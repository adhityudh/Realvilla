const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
});

async function main() {
  const allProps = await client.fetch(`*[_type == "property"]{_id, propertyCode, title, language}`);
  console.log("All properties:", allProps);
}
main().catch(console.error);
