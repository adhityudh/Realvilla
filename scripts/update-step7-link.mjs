import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-03-05',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function run() {
  const pages = await client.fetch(`*[_type == "page" && slug.current in ["buy", "comprar"]]`);

  for (const page of pages) {
    const isEs = page.language === 'es';
    console.log(`Processing [${page.language || 'en'}] ${page.title}`);

    let updated = false;
    const updatedSections = (page.sections || []).map((section) => {
      if (section._type === 'buyingProcessSection' || section._type === 'mortgageProcessSection') {
        const steps = (section.steps || []).map((step) => {
          if (step.number === '07') {
            console.log(`Found Step 7 in ${page.title}`);
            const linkText = 'EXPLORE FINANCING OPTIONS';
            const linkUrl = isEs ? '/es/mortgage' : '/en/mortgage';

            const description = step.description || [];
            if (description.length > 0) {
              const lastBlock = { ...description[description.length - 1] };
              if (lastBlock._type === 'block') {
                const children = [...(lastBlock.children || [])];
                const lastChild = children[children.length - 1];

                if (lastChild && lastChild._type === 'span') {
                  if (!lastChild.text.includes(linkText)) {
                    // Append a space and the link text to the paragraph as a separate span
                    lastChild.text = lastChild.text.trim() + ' ';

                    const linkSpanKey = `span_${Math.random().toString(36).substr(2, 9)}`;
                    const markKey = `link_${Math.random().toString(36).substr(2, 9)}`;

                    const linkSpan = {
                      _key: linkSpanKey,
                      _type: 'span',
                      marks: [markKey],
                      text: linkText
                    };

                    children.push(linkSpan);
                    lastBlock.children = children;

                    const markDefs = [...(lastBlock.markDefs || [])];
                    markDefs.push({
                      _key: markKey,
                      _type: 'link',
                      href: linkUrl,
                      blank: false
                    });
                    lastBlock.markDefs = markDefs;

                    updated = true;
                    console.log(`Appended link to description block.`);
                  }
                }
              }
              description[description.length - 1] = lastBlock;
            }
            return {
              ...step,
              description
            };
          }
          return step;
        });
        return {
          ...section,
          steps
        };
      }
      return section;
    });

    if (updated) {
      await client
        .patch(page._id)
        .set({ sections: updatedSections })
        .commit();
      console.log(`Saved changes for [${page.language}] ${page.title}`);
    } else {
      console.log(`No changes needed or link already exists for [${page.language}] ${page.title}`);
    }
  }
}

run().catch(console.error);
