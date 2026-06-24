const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
});
async function main() {
  const docs = await client.fetch(`*[title match "San Isidro"]{_id, propertyCode, title, language}`);
  docs.forEach(d => console.log(`${d.language}: ${d.propertyCode} - ${d.title} (ID: ${d._id})`));
}
main().catch(console.error);
