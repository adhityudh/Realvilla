const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
});

async function main() {
  const docs = await client.fetch(`*[_type == "property"]{_id, propertyCode, language}`);
  console.log("PROPERTIES:");
  docs.forEach(doc => console.log(`${doc._id} | Lang: ${doc.language} | Code: ${doc.propertyCode}`));
  
  const translations = await client.fetch(`*[_type == "translation.metadata"]{_id, translations}`);
  console.log("\nTRANSLATIONS:");
  translations.forEach(doc => console.log(JSON.stringify(doc, null, 2)));
}

main().catch(console.error);
