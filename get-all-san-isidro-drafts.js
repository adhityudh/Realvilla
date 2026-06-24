const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  token: 'skLl5e6q6ps35wxtfXYhjZcZBR2DIBc5iOwqzwxahEjse6ob8HDpMCSfQnvdej8Afqv5UvyVNs7dZt3OiATMNJ8CcA5e3doUL3pcubEX6fLKOoZtv8i3xv1MR8BhLZ27avyQhSMY1ALNmUmBVHDSNY4ErafnSVym99VtLwudY9W62nBEJDVS',
  useCdn: false,
});
async function main() {
  const docs = await client.fetch(`*[title match "San Isidro"]{_id, propertyCode, title, language}`);
  docs.forEach(d => console.log(`${d.language}: ${d.propertyCode} - ${d.title} (ID: ${d._id})`));
}
main().catch(console.error);
