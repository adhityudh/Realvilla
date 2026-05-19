import fs from 'fs';
import path from 'path';

const schemasDir = '/Users/yudha/Documents/Freelance/realvilla/sanity/schemaTypes/modules';

const sectionDefaults = {
  'aboutSection.ts': 'about',
  'buyHeroSection.ts': 'buy-hero',
  'buyMortgageSimSection.ts': 'mortgage-simulator',
  'buyPropertiesSection.ts': 'properties-list',
  'buyingProcessSection.ts': 'buying-process',
  'contactSection.ts': 'contact',
  'documentLedgerSection.ts': 'document-ledger',
  'financingCardsSection.ts': 'financing-cards',
  'generalHeroSection.ts': 'general-hero',
  'heroSection.ts': 'hero',
  'mortgageFAQSection.ts': 'mortgage',
  'mortgageProcessSection.ts': 'process',
  'partnerSection.ts': 'partners',
  'propertiesSection.ts': 'properties',
  'statsSection.ts': 'stats',
  'testimonialsSection.ts': 'testimonials',
  'valuationSection.ts': 'valuation'
};

function run() {
  for (const [filename, defaultId] of Object.entries(sectionDefaults)) {
    const filePath = path.join(schemasDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File ${filePath} does not exist. Skipping.`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if the id field is already defined to avoid duplicate injection
    if (content.includes("name: 'id'") || content.includes('name: "id"')) {
      console.log(`File ${filename} already has an id field. Skipping.`);
      continue;
    }

    const searchStr = 'fields: [';
    const index = content.indexOf(searchStr);

    if (index === -1) {
      console.warn(`Could not find "fields: [" in ${filename}. Skipping.`);
      continue;
    }

    const insertIndex = index + searchStr.length;
    const injection = `
    defineField({
      name: 'id',
      title: 'Section ID',
      type: 'string',
      description: 'Used as an anchor identifier (e.g. for smooth scrolling links like #about).',
      initialValue: '${defaultId}',
    }),`;

    const newContent = content.slice(0, insertIndex) + injection + content.slice(insertIndex);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Successfully injected id field to ${filename} with default: ${defaultId}`);
  }
}

run();
