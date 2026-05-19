import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function run() {
  const pages = await client.fetch('*[_type == "page" && "mortgageFAQSection" in sections[]._type]');
  
  console.log(`Found ${pages.length} pages to migrate...`);

  for (const page of pages) {
    const updatedSections = (page.sections || []).map((section) => {
      if (section._type === 'mortgageFAQSection') {
        const newSection = { ...section };

        // Map Primary CTA
        if (newSection.ctaPrimaryLabel !== undefined) {
          newSection.ctaLabel = newSection.ctaPrimaryLabel;
          delete newSection.ctaPrimaryLabel;
        }
        if (newSection.ctaPrimaryLinkType !== undefined) {
          newSection.linkType = newSection.ctaPrimaryLinkType;
          delete newSection.ctaPrimaryLinkType;
        }
        if (newSection.ctaPrimaryInternalLink !== undefined) {
          newSection.internalLink = newSection.ctaPrimaryInternalLink;
          delete newSection.ctaPrimaryInternalLink;
        }
        if (newSection.ctaPrimaryExternalLink !== undefined) {
          newSection.externalLink = newSection.ctaPrimaryExternalLink;
          delete newSection.ctaPrimaryExternalLink;
        }

        // Map Secondary CTA
        if (newSection.ctaSecondaryLabel !== undefined) {
          newSection.secondaryCtaLabel = newSection.ctaSecondaryLabel;
          delete newSection.ctaSecondaryLabel;
        }
        if (newSection.ctaSecondaryLinkType !== undefined) {
          newSection.secondaryLinkType = newSection.ctaSecondaryLinkType;
          delete newSection.ctaSecondaryLinkType;
        }
        if (newSection.ctaSecondaryInternalLink !== undefined) {
          newSection.secondaryInternalLink = newSection.ctaSecondaryInternalLink;
          delete newSection.ctaSecondaryInternalLink;
        }
        if (newSection.ctaSecondaryExternalLink !== undefined) {
          newSection.secondaryExternalLink = newSection.ctaSecondaryExternalLink;
          delete newSection.ctaSecondaryExternalLink;
        }

        return newSection;
      }
      return section;
    });

    await client
      .patch(page._id)
      .set({ sections: updatedSections })
      .commit();

    console.log(`Successfully migrated mortgageFAQSection on page: ${page.slug?.current || page._id}`);
  }

  console.log('Migration finished successfully!');
}

run().catch(console.error);
