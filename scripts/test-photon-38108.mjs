async function testPhoton(q) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10&lat=28.2916&lon=-16.6291&bbox=-16.95,27.98,-16.10,28.59`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Query: "${q}"`);
      console.log(`Count: ${data.features.length}`);
      data.features.forEach((f, idx) => {
        const p = f.properties || {};
        console.log(`Item ${idx + 1}: type="${p.type}" (osm_value="${p.osm_value}")`);
        console.log(`  Display: ${p.name || ''}, ${p.street || ''}, ${p.city || ''}, ${p.postcode || ''}`);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

testPhoton("38108 calle");
