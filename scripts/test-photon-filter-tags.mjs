async function testPhoton(q, osmTags = []) {
  let tagParams = osmTags.map(tag => `&osm_tag=${tag}`).join('');
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10&lat=28.2916&lon=-16.6291&bbox=-16.95,27.98,-16.10,28.59${tagParams}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Query: "${q}" with tags [${osmTags.join(', ')}]`);
      console.log(`Returned count: ${data.features.length}`);
      data.features.forEach((f, idx) => {
        const p = f.properties || {};
        console.log(`  Item ${idx + 1}: type="${p.type}" (osm_key="${p.osm_key}" osm_value="${p.osm_value}")`);
        console.log(`    Display: ${p.name || ''}, ${p.street || ''}, ${p.city || ''}, ${p.postcode || ''}`);
      });
      console.log("=========================================");
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  console.log("Testing with osm_tag=highway (streets only)");
  await testPhoton("Adeje", ["highway"]);
  await testPhoton("38107", ["highway"]);
  await testPhoton("Tincer", ["highway"]);
  
  console.log("Testing with osm_tag=highway & osm_tag=place:house");
  await testPhoton("Adeje", ["highway", "place:house"]);
  await testPhoton("38107", ["highway", "place:house"]);
  
  console.log("Testing with osm_tag=highway & osm_tag=building");
  await testPhoton("Adeje", ["highway", "building"]);
  await testPhoton("38107", ["highway", "building"]);
  await testPhoton("Tincer", ["highway", "building"]);
}

run();
