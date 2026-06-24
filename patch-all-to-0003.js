const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  token: 'skLl5e6q6ps35wxtfXYhjZcZBR2DIBc5iOwqzwxahEjse6ob8HDpMCSfQnvdej8Afqv5UvyVNs7dZt3OiATMNJ8CcA5e3doUL3pcubEX6fLKOoZtv8i3xv1MR8BhLZ27avyQhSMY1ALNmUmBVHDSNY4ErafnSVym99VtLwudY9W62nBEJDVS',
  useCdn: false,
});
async function main() {
  const ids = [
    "4f95c4db-6147-4b19-b7cc-fb3dc15e12d2",
    "8ebe4642-cc14-4f6b-9c7c-794f1c832792",
    "drafts.4f95c4db-6147-4b19-b7cc-fb3dc15e12d2",
    "drafts.8ebe4642-cc14-4f6b-9c7c-794f1c832792"
  ];
  
  for (const id of ids) {
    const doc = await client.fetch(`*[_id == "${id}"][0]`);
    if (doc) {
       await client.patch(id).set({ propertyCode: 'RV0003' }).commit();
       console.log(`Patched ${id} to RV0003`);
    }
  }
}
main().catch(console.error);
