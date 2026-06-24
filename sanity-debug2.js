const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
});
async function main() {
  const allProps = await client.fetch(`*[_type == "property" || _type == "translation.metadata"]{_id, _type, propertyCode, title, language, translations}`);
  allProps.filter(d => d._type === "property").forEach(doc => {
    console.log(`[PROP] ID: ${doc._id} | Code: ${doc.propertyCode} | Lang: ${doc.language} | Title: ${doc.title}`);
  });
  console.log("\n[META]");
  allProps.filter(d => d._type === "translation.metadata" && d.translations && d.translations.length > 0).forEach(doc => {
    if(doc._id.includes("property") || doc.translations.some(t => t.value && t.value._ref && t.value._ref.includes("property"))){
      console.log(`Meta ID: ${doc._id}`);
      console.log(JSON.stringify(doc.translations.map(t => ({ lang: t.language || t._key, ref: t.value ? t.value._ref : null })), null, 2));
    }
  });
}
main().catch(console.error);
