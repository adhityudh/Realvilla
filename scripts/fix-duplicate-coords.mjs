import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  token: 'skLl5e6q6ps35wxtfXYhjZcZBR2DIBc5iOwqzwxahEjse6ob8HDpMCSfQnvdej8Afqv5UvyVNs7dZt3OiATMNJ8CcA5e3doUL3pcubEX6fLKOoZtv8i3xv1MR8BhLZ27avyQhSMY1ALNmUmBVHDSNY4ErafnSVym99VtLwudY9W62nBEJDVS',
  useCdn: false,
  apiVersion: '2024-05-02',
});

async function main() {
  console.log('🔍 Fetching all English properties with coordinates...');
  const props = await client.fetch('*[_type == "property" && language == "en"]{_id,title,propertyCode,location{coordinateMethod,coordinates},lat,lng}');
  
  // Group by coordinate
  const coordMap = {};
  
  props.forEach(p => {
    const loc = p.location || {};
    const method = loc.coordinateMethod;
    let lat, lng;
    
    if (method === 'url' && p.lat && p.lng) {
      lat = p.lat; lng = p.lng;
    } else if (loc.coordinates?.lat && loc.coordinates?.lng) {
      lat = loc.coordinates.lat; lng = loc.coordinates.lng;
    }
    
    if (lat && lng) {
      // Round to 4 decimal places to detect "same" coordinates
      const key = lat.toFixed(4) + ',' + lng.toFixed(4);
      if (!coordMap[key]) coordMap[key] = [];
      coordMap[key].push({ ...p, lat, lng, origKey: key });
    }
  });
  
  const duplicates = Object.entries(coordMap).filter(([k, v]) => v.length > 1);
  console.log(`\nFound ${duplicates.length} coordinate groups with duplicates.\n`);
  
  // For each duplicate group, offset the extra ones slightly
  const updates = [];
  
  duplicates.forEach(([key, items]) => {
    console.log(`\n📍 Group at ${key}: ${items.map(i => i.propertyCode).join(', ')}`);
    
    items.forEach((item, idx) => {
      if (idx === 0) {
        console.log(`   ${item.propertyCode} (${item.title}) → KEEP original`);
        return; // Keep first one at original position
      }
      
      // Generate offset in a spiral pattern: ~1-6 meter offsets
      const offsetDeg = 0.00005 * idx; // ~5m per index
      const angle = (idx - 1) * 2.4; // ~137.5 deg (golden angle) for even spread
      const newLat = item.lat + offsetDeg * Math.cos(angle);
      const newLng = item.lng + offsetDeg * Math.sin(angle);
      
      console.log(`   ${item.propertyCode} (${item.title}) → offset to ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
      
      updates.push({
        id: item._id,
        propertyCode: item.propertyCode,
        newLat: parseFloat(newLat.toFixed(6)),
        newLng: parseFloat(newLng.toFixed(6)),
      });
    });
  });
  
  if (updates.length === 0) {
    console.log('✅ No duplicates to fix.');
    return;
  }
  
  console.log(`\n📝 Ready to update ${updates.length} properties with offset coordinates.`);
  console.log('Executing updates...\n');
  
  // Execute updates
  for (const u of updates) {
    try {
      await client.patch(u.id)
        .set({
          'location.coordinates.lat': u.newLat,
          'location.coordinates.lng': u.newLng,
          'location.coordinateMethod': 'url',
          lat: u.newLat,
          lng: u.newLng,
        })
        .commit();
      console.log(`✅ Updated ${u.propertyCode} → (${u.newLat}, ${u.newLng})`);
    } catch (err) {
      console.error(`❌ Failed to update ${u.propertyCode}:`, err.message);
    }
  }
  
  console.log('\n✨ Done! All duplicate coordinates have been offset.');
}
main().catch(console.error);