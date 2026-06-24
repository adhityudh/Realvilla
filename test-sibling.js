const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
});

async function findSiblingCode(documentId) {
  const publishedId = documentId.replace(/^drafts\./, '');
  const meta = await client.fetch(
    `*[_type == "translation.metadata" && references($publishedId)][0]{
      translations[] { "refId": value._ref }
    }`,
    { publishedId }
  );

  const siblingIds = new Set();
  if (meta?.translations?.length) {
    for (const t of meta.translations) {
      const refId = t.refId;
      if (refId && refId !== publishedId && refId !== documentId) {
        siblingIds.add(refId);
        siblingIds.add(`drafts.${refId}`);
      }
    }
  }

  const allIds = Array.from(siblingIds);
  console.log(`Document: ${documentId}`);
  console.log(`Siblings found: ${allIds.join(', ')}`);
  
  if (allIds.length === 0) return null;

  for (const id of allIds) {
    const normalizedId = id.replace(/^drafts\./, '');
    const doc = await client.fetch(
      `*[_id == $id || _id == "drafts." + $id][0] { propertyCode }`,
      { id: normalizedId }
    );
    if (doc?.propertyCode) return doc.propertyCode;
  }
  return null;
}

async function main() {
  console.log("English version:");
  const enCode = await findSiblingCode("4f95c4db-6147-4b19-b7cc-fb3dc15e12d2");
  console.log(`-> Returned code: ${enCode}\n`);
  
  console.log("Spanish version:");
  const esCode = await findSiblingCode("8ebe4642-cc14-4f6b-9c7c-794f1c832792");
  console.log(`-> Returned code: ${esCode}\n`);
}
main().catch(console.error);
