import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-05-02',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const enText = `Effective Date: 
1. INTRODUCTION
Welcome to RealVilla. We are committed to protecting your privacy and ensuring that your personal information is handled securely and responsibly. This Privacy Policy outlines how we collect, use, and protect your personal data when you visit our website, use our valuation tools, or engage with our real estate services in Tenerife. This policy complies with the General Data Protection Regulation (GDPR).
2. INFORMATION WE COLLECT
To provide you with exceptional real estate services, we may collect the following types of information:
• Identity & Contact Data: Full name, email address, phone number, and correspondence preferences.
• Property Data: Information regarding your property, including location, size, property type, and details provided through our valuation calculator or listing forms.
• Financial Data: Information required for facilitating transactions, mortgages, or managing payments (handled securely via third-party processors).
• Technical Data: Internet Protocol (IP) address, browser type, time zone setting, and operating system collected automatically when you browse our site.
3. HOW WE USE YOUR INFORMATION
We process your personal data for the following purposes:
• To provide accurate property valuations and real estate market analysis.
• To facilitate the buying, selling, or investment processes for properties in Tenerife.
• To respond to your inquiries and initiate communication regarding your real estate goals.
• To send administrative information, such as changes to our terms, conditions, and policies.
• To deliver relevant market reports, guides, and updates (only if you have opted in to receive marketing communications).
4. DATA SHARING AND DISCLOSURE
RealVilla operates with strict discretion. We do not sell your personal data. We may share your information only with:
• Service Providers: Trusted third-party IT, hosting, and CRM platforms that assist us in operating our website and business.
• Legal & Financial Partners: Notaries, legal advisors, banks, or payment processors (such as Stripe) when strictly necessary to execute a transaction or secure a mortgage.
• Regulatory Authorities: When required by law to comply with local regulations in Spain.
5. DATA RETENTION
We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, including satisfying any legal, accounting, or reporting requirements. When data is no longer needed, it is securely deleted or anonymized.
6. YOUR GDPR RIGHTS
Under the GDPR, you have the following rights regarding your personal data:
• Right to Access: Request a copy of the personal data we hold about you.
• Right to Rectification: Request correction of any inaccurate or incomplete data.
• Right to Erasure: Request the deletion of your personal data ("right to be forgotten").
• Right to Restrict Processing: Request a pause in the processing of your data.
• Right to Object: Object to our processing of your personal data for direct marketing.
7. COOKIES AND TRACKING TECHNOLOGIES
Our website uses cookies to enhance user experience, analyze site traffic, and optimize our platform. You can manage or disable cookies through your browser settings at any time.
8. CONTACT US
If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please contact us at:
• Email: luis.villarreal@realvilla.es
• Phone: +34 675 15 15 97`;

function generateBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check if it's a heading
    if (/^\d+\.\s+[A-Z\s]+$/.test(trimmed) || /^[A-Z\s&]+$/.test(trimmed) && trimmed.length > 5) {
        blocks.push({
            _key: Math.random().toString(36).substring(7),
            _type: 'block',
            style: 'h2',
            markDefs: [],
            children: [{ _key: Math.random().toString(36).substring(7), _type: 'span', marks: [], text: trimmed }]
        });
    } else if (trimmed.startsWith('•')) {
        blocks.push({
            _key: Math.random().toString(36).substring(7),
            _type: 'block',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            markDefs: [],
            children: [{ _key: Math.random().toString(36).substring(7), _type: 'span', marks: [], text: trimmed.substring(1).trim() }]
        });
    } else {
        blocks.push({
            _key: Math.random().toString(36).substring(7),
            _type: 'block',
            style: 'normal',
            markDefs: [],
            children: [{ _key: Math.random().toString(36).substring(7), _type: 'span', marks: [], text: trimmed }]
        });
    }
  }
  return blocks;
}

async function translateText(text) {
  if (!text || text.trim() === '') return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (error) {
    console.error(`Failed to translate: ${text}`, error.message);
    return text;
  }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const enBlocks = generateBlocks(enText);
  
  console.log("Generating ES translation...");
  const esBlocks = JSON.parse(JSON.stringify(enBlocks));
  for (const block of esBlocks) {
      if (block.children && block.children[0]) {
          block.children[0].text = await translateText(block.children[0].text);
          await sleep(200);
      }
  }

  const pages = await client.fetch(`*[_type == "page" && (slug.current match "*privacy*" || slug.current match "*privacidad*")] { _id, title, "slug": slug.current, language }`);
  console.log("Found pages:", pages);

  if (pages.length === 0) {
      console.log("No privacy policy pages found!");
      return;
  }

  for (const page of pages) {
      const isSpanish = page.language === 'es';
      const blocks = isSpanish ? esBlocks : enBlocks;
      const titleText = isSpanish ? 'Política de Privacidad' : 'Privacy Policy';
      const tocLabel = isSpanish ? 'Tabla de Contenido' : 'Table of Contents';
      
      const newSection = {
          _type: 'generalDocumentSection',
          _key: Math.random().toString(36).substring(7),
          title: titleText,
          tocLabel: tocLabel,
          body: blocks,
          anchor: 'privacy-policy'
      };

      console.log(`Patching ${page._id} (${page.title})...`);
      await client.patch(page._id)
          .setIfMissing({ sections: [] })
          .insert('after', 'sections[-1]', [newSection])
          .commit();
      console.log(`Successfully patched ${page._id}`);
  }
}

run().catch(console.error);
