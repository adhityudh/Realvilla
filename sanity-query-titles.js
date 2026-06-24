const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
});

async function main() {
  const docs = await client.fetch(`*[_type == "property"]{_id, propertyCode, language, title}`);
  docs.forEach(doc => console.log(`${doc._id} | Code: ${doc.propertyCode} | Lang: ${doc.language} | Title: ${doc.title}`));
}

main().catch(console.error);
