const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
});

async function main() {
  const publishedId = "4f95c4db-6147-4b19-b7cc-fb3dc15e12d2"; // Apartment in San Isidro
  const meta = await client.fetch(`*[_type == "translation.metadata" && references($publishedId)][0]{
        translations[] { "refId": value._ref }
      }`, { publishedId });
  console.log(JSON.stringify(meta, null, 2));
}

main().catch(console.error);
