const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  token: 'skLl5e6q6ps35wxtfXYhjZcZBR2DIBc5iOwqzwxahEjse6ob8HDpMCSfQnvdej8Afqv5UvyVNs7dZt3OiATMNJ8CcA5e3doUL3pcubEX6fLKOoZtv8i3xv1MR8BhLZ27avyQhSMY1ALNmUmBVHDSNY4ErafnSVym99VtLwudY9W62nBEJDVS',
  useCdn: false,
});
async function main() {
  await client.patch('4f95c4db-6147-4b19-b7cc-fb3dc15e12d2')
    .set({ propertyCode: 'RV0004' })
    .commit();
  console.log("Patched EN to RV0004");
  
  // Check if there are drafts, patch them too
  const drafts = await client.fetch(`*[_id == "drafts.4f95c4db-6147-4b19-b7cc-fb3dc15e12d2"]`);
  if (drafts.length > 0) {
     await client.patch('drafts.4f95c4db-6147-4b19-b7cc-fb3dc15e12d2')
       .set({ propertyCode: 'RV0004' })
       .commit();
     console.log("Patched EN draft to RV0004");
  }
}
main().catch(console.error);
