const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
});

async function findSharedCode(documentId) {
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
      if (refId) {
        siblingIds.add(refId);
        siblingIds.add(`drafts.${refId}`);
      }
    }
  }

  const allIds = Array.from(siblingIds);
  const codes = [];
  
  if (allIds.length === 0) return null;

  for (const id of allIds) {
    const normalizedId = id.replace(/^drafts\./, '');
    const doc = await client.fetch(
      `*[_id == $id || _id == "drafts." + $id][0] { propertyCode }`,
      { id: normalizedId }
    );
    if (doc?.propertyCode) codes.push(doc.propertyCode);
  }
  
  if (codes.length > 0) {
    codes.sort();
    return codes[0];
  }
  
  return null;
}

async function main() {
  console.log("English version:");
  const enCode = await findSharedCode("4f95c4db-6147-4b19-b7cc-fb3dc15e12d2");
  console.log(`-> Shared code: ${enCode}\n`);
  
  console.log("Spanish version:");
  const esCode = await findSharedCode("8ebe4642-cc14-4f6b-9c7c-794f1c832792");
  console.log(`-> Shared code: ${esCode}\n`);
}
main().catch(console.error);
