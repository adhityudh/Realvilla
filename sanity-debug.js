const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
});

async function main() {
  console.log("=== ALL PROPERTIES (INCLUDING DRAFTS) ===");
  const allProps = await client.fetch(`*[_type == "property"]{_id, propertyCode, title, language}`);
  allProps.forEach(doc => {
    console.log(`ID: ${doc._id} | Code: ${doc.propertyCode} | Lang: ${doc.language} | Title: ${doc.title}`);
  });
  
  console.log("\n=== TRANSLATION METADATA ===");
  const allMeta = await client.fetch(`*[_type == "translation.metadata"]{_id, translations}`);
  allMeta.forEach(doc => {
    console.log(`Meta ID: ${doc._id}`);
    console.log(JSON.stringify(doc.translations, null, 2));
  });
}
main().catch(console.error);
