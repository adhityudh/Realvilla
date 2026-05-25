import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'c8xelbhk',
  dataset: 'production',
  token: 'skLl5e6q6ps35wxtfXYhjZcZBR2DIBc5iOwqzwxahEjse6ob8HDpMCSfQnvdej8Afqv5UvyVNs7dZt3OiATMNJ8CcA5e3doUL3pcubEX6fLKOoZtv8i3xv1MR8BhLZ27avyQhSMY1ALNmUmBVHDSNY4ErafnSVym99VtLwudY9W62nBEJDVS',
  useCdn: true,
  apiVersion: '2024-05-02',
});

async function main() {
  const props = await client.fetch('*[_type == "property" && language == "en"]{_id,title,propertyCode,location{coordinateMethod,coordinates},lat,lng}');
  console.log('Total English properties:', props.length);
  
  let withCoord = 0;
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
      withCoord++;
      const key = String(lat) + ',' + String(lng);
      if (!coordMap[key]) coordMap[key] = [];
      coordMap[key].push(p.propertyCode + ' | ' + (p.title || 'untitled'));
      console.log('COORD:', p.propertyCode, '->', lat, lng, '(' + (method || '?') + ')');
    } else {
      console.log('NO COORD:', p.propertyCode, '-', p.title, '(method=' + (method || '?') + ')');
    }
  });
  
  console.log('\nTotal with coordinates:', withCoord, '/' , props.length);
  
  const dups = Object.entries(coordMap).filter(([k,v]) => v.length > 1);
  if (dups.length > 0) {
    console.log('\nDUPLICATE COORDINATES FOUND:');
    dups.forEach(([key, list]) => console.log('  ' + key + ':', list.join(', ')));
  } else {
    console.log('\nNo duplicate coordinates found.');
  }
}
main().catch(console.error);