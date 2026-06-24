const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
});

async function main() {
  const meta = await client.fetch(`*[_type == "translation.metadata" && references("SzL855SmyokgBblV3bPYWO")][0]{
    translations[] { "refId": value._ref, "refIdResolved": value->._id }
  }`);
  console.log(JSON.stringify(meta, null, 2));
}

main().catch(console.error);
