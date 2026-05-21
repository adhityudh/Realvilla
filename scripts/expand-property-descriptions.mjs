import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Helper to create block content
function createBlockContent(paragraphs) {
  return paragraphs.map((text, index) => ({
    _key: `block-${Date.now()}-${index}`,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{
      _key: `span-${Date.now()}-${index}`,
      _type: 'span',
      marks: [],
      text: text
    }]
  }));
}

// Generate detailed property description in English
function generateEnglishDescription(property, meta) {
  const location = property.location?.municipality || 'Tenerife';
  const price = property.price ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price) : '';
  
  const paragraphs = [
    `Welcome to ${property.title || 'this exceptional property'}, a masterpiece of contemporary architecture and refined living in the heart of ${location}, Tenerife. This extraordinary residence represents the pinnacle of luxury real estate in the Canary Islands, offering an unparalleled lifestyle where sophistication meets natural beauty.`,
    
    `Spanning an impressive living space, this property has been meticulously designed to capture the essence of modern Mediterranean living. Every detail has been carefully considered, from the premium materials used throughout to the seamless integration of indoor and outdoor spaces. The architectural vision celebrates clean lines, expansive volumes, and an abundance of natural light that floods through floor-to-ceiling windows, creating an atmosphere of openness and tranquility.`,
    
    `The interior spaces are a testament to contemporary elegance, featuring open-plan living areas that flow effortlessly from one room to the next. The gourmet kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for both everyday living and entertaining guests. The spacious bedrooms serve as private sanctuaries, each thoughtfully designed with comfort and style in mind, while the luxurious bathrooms showcase premium fixtures and finishes that elevate the daily routine into a spa-like experience.`,
    
    `Step outside to discover your private oasis, where the boundaries between indoor and outdoor living dissolve. The expansive terraces and outdoor living areas are ideal for al fresco dining, entertaining, or simply relaxing while taking in the breathtaking views. The meticulously landscaped grounds create a serene environment that enhances the property's natural beauty and provides the perfect backdrop for outdoor enjoyment year-round.`,
    
    `Located in one of Tenerife's most sought-after areas, this property offers the perfect balance of privacy and convenience. You'll enjoy easy access to pristine beaches, world-class golf courses, fine dining establishments, and premium shopping destinations. The vibrant local community, combined with the island's exceptional climate and natural beauty, creates an enviable lifestyle that few places in the world can match.`,
    
    `This is more than just a home; it's an investment in a lifestyle of luxury, comfort, and endless possibilities. Whether you're seeking a permanent residence, a vacation retreat, or a prestigious investment property, this exceptional estate offers everything you need and more. Experience the ultimate in Canarian living and make this architectural gem your own.`
  ];
  
  return createBlockContent(paragraphs);
}

// Generate detailed property description in Spanish
function generateSpanishDescription(property, meta) {
  const location = property.location?.municipality || 'Tenerife';
  const price = property.price ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price) : '';
  
  const paragraphs = [
    `Bienvenido a ${property.title || 'esta propiedad excepcional'}, una obra maestra de arquitectura contemporánea y vida refinada en el corazón de ${location}, Tenerife. Esta extraordinaria residencia representa la cúspide del mercado inmobiliario de lujo en las Islas Canarias, ofreciendo un estilo de vida incomparable donde la sofisticación se encuentra con la belleza natural.`,
    
    `Con un impresionante espacio habitable, esta propiedad ha sido meticulosamente diseñada para capturar la esencia de la vida mediterránea moderna. Cada detalle ha sido cuidadosamente considerado, desde los materiales premium utilizados en toda la propiedad hasta la integración perfecta de espacios interiores y exteriores. La visión arquitectónica celebra líneas limpias, volúmenes expansivos y una abundancia de luz natural que inunda a través de ventanas de piso a techo, creando una atmósfera de apertura y tranquilidad.`,
    
    `Los espacios interiores son un testimonio de elegancia contemporánea, con áreas de estar de planta abierta que fluyen sin esfuerzo de una habitación a otra. La cocina gourmet está equipada con electrodomésticos de primera línea y gabinetes personalizados, perfecta tanto para la vida cotidiana como para entretener a los invitados. Las amplias habitaciones sirven como santuarios privados, cada una diseñada cuidadosamente con comodidad y estilo en mente, mientras que los lujosos baños exhiben accesorios y acabados premium que elevan la rutina diaria a una experiencia tipo spa.`,
    
    `Salga al exterior para descubrir su oasis privado, donde los límites entre la vida interior y exterior se disuelven. Las amplias terrazas y áreas de estar al aire libre son ideales para cenar al aire libre, entretener o simplemente relajarse mientras disfruta de las impresionantes vistas. Los terrenos meticulosamente diseñados crean un ambiente sereno que realza la belleza natural de la propiedad y proporciona el telón de fondo perfecto para el disfrute al aire libre durante todo el año.`,
    
    `Ubicada en una de las áreas más codiciadas de Tenerife, esta propiedad ofrece el equilibrio perfecto entre privacidad y conveniencia. Disfrutará de fácil acceso a playas prístinas, campos de golf de clase mundial, restaurantes de alta cocina y destinos de compras premium. La vibrante comunidad local, combinada con el clima excepcional de la isla y su belleza natural, crea un estilo de vida envidiable que pocos lugares en el mundo pueden igualar.`,
    
    `Esto es más que un hogar; es una inversión en un estilo de vida de lujo, comodidad y posibilidades infinitas. Ya sea que busque una residencia permanente, un retiro vacacional o una propiedad de inversión prestigiosa, esta finca excepcional ofrece todo lo que necesita y más. Experimente lo último en vida canaria y haga suya esta joya arquitectónica.`
  ];
  
  return createBlockContent(paragraphs);
}

async function expandPropertyDescriptions() {
  try {
    console.log('🔍 Fetching all properties...');
    const properties = await client.fetch(`*[_type == "property"]{ 
      _id, 
      title, 
      language,
      price,
      location,
      description,
      meta
    }`);
    console.log(`Found ${properties.length} properties`);

    // Group properties by base ID
    const propertyGroups = new Map();
    
    for (const property of properties) {
      const baseId = property._id.replace(/-es$/, '');
      
      if (!propertyGroups.has(baseId)) {
        propertyGroups.set(baseId, []);
      }
      propertyGroups.get(baseId).push(property);
    }

    console.log(`\n📦 Processing ${propertyGroups.size} property groups...\n`);

    let updatedCount = 0;
    let groupIndex = 0;

    for (const [baseId, group] of propertyGroups) {
      groupIndex++;
      const enProperty = group.find(p => p.language === 'en');
      const esProperty = group.find(p => p.language === 'es');
      
      if (!enProperty) {
        console.log(`[${groupIndex}/${propertyGroups.size}] ⚠️  No English version found for ${baseId}, skipping`);
        continue;
      }

      const displayTitle = enProperty.title || baseId;
      console.log(`[${groupIndex}/${propertyGroups.size}] 📝 ${displayTitle}`);

      // Generate new descriptions
      const enDescription = generateEnglishDescription(enProperty, enProperty.meta);
      const esDescription = generateSpanishDescription(enProperty, enProperty.meta);

      // Update English version
      await client
        .patch(enProperty._id)
        .set({ description: enDescription })
        .commit();
      
      console.log(`   ✅ Updated [EN] - ${enDescription.length} paragraphs`);
      updatedCount++;

      // Update Spanish version if exists
      if (esProperty) {
        await client
          .patch(esProperty._id)
          .set({ description: esDescription })
          .commit();
        
        console.log(`   ✅ Updated [ES] - ${esDescription.length} paragraphs`);
        updatedCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 Complete! Updated ${updatedCount} properties with expanded descriptions.`);
    console.log(`📊 Each property now has 6 detailed paragraphs covering:`);
    console.log(`   • Property overview and location`);
    console.log(`   • Architectural design and features`);
    console.log(`   • Interior spaces and amenities`);
    console.log(`   • Outdoor living areas`);
    console.log(`   • Location benefits and lifestyle`);
    console.log(`   • Investment value and conclusion`);
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

expandPropertyDescriptions();