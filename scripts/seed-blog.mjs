import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-05-02',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// ------------------------------------------------------------------------
//  Available Sanity image assets (property photos suitable for blog)
// ------------------------------------------------------------------------
const FEATURED_IMAGES = [
  { _type: 'image', asset: { _type: 'reference', _ref: 'image-8019ae6869da67d5c08834bd8050b6c578f427ac-1957x1181-webp' } },
  { _type: 'image', asset: { _type: 'reference', _ref: 'image-b66f6c1e085511923c957d9ba783eb4cae6c8d17-2048x2048-webp' } },
  { _type: 'image', asset: { _type: 'reference', _ref: 'image-8b3e6a229514fac24cd49c4654f68445c54bc22d-2048x2048-webp' } },
  { _type: 'image', asset: { _type: 'reference', _ref: 'image-e65e552f38a0ee13c1f9649560e46795865a3c33-848x1264-webp' } },
  { _type: 'image', asset: { _type: 'reference', _ref: 'image-a1423036ec14fecedf1a3da29fa86a9a90ceeda2-1376x768-webp' } },
];

// ------------------------------------------------------------------------
//  Blog content: 5 posts about buying property in Tenerife
// ------------------------------------------------------------------------
const POSTS = [
  {
    title: 'A Complete Guide to Buying Property in Tenerife as a Foreigner',
    slug: 'buying-property-tenerife-foreigner-guide',
    excerpt: 'Everything you need to know about purchasing real estate in Tenerife as a non-Spanish resident, from NIE numbers to notary fees.',
    body: (() => {
      const blocks = [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Tenerife has long been one of Europe\'s most sought-after destinations for international property buyers. With its year-round sunshine, stunning landscapes, and high quality of life, it\'s no wonder that foreigners account for a significant percentage of property purchases on the island.' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
        { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Getting Your NIE Number' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'The first step for any foreign buyer is obtaining a NIE (Número de Identificación de Extranjero). This is your tax identification number and is required for any major financial transaction in Spain, including buying a property. You can apply at the Spanish consulate in your home country or directly at a police station in Spain.' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
        { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Understanding the Costs' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Beyond the purchase price, buyers should budget for additional costs typically ranging from 8-12% of the property value. These include stamp duty (ITP) for resale properties, VAT (IVA) for new builds, notary fees, land registry fees, and legal representation. A good rule of thumb is to have an additional 10% of the purchase price set aside.' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
        { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Finding the Right Property' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Whether you\'re looking for a luxury villa in Costa Adeje, a beachfront apartment in Los Cristianos, or a traditional finca in the Orotava Valley, working with a reputable local real estate agent is essential. At REALVILLA, we specialize in matching international buyers with their perfect Tenerife property.' }] },
      ];
      return blocks.map((b) => ({ ...b, _key: crypto.randomBytes(6).toString('hex') }));
    })(),
  },
  {
    title: 'Best Areas to Live in Tenerife: Where to Buy in 2026',
    slug: 'best-areas-live-tenerife-2026',
    excerpt: 'From the glamorous south coast to the historic north, discover which area of Tenerife best suits your lifestyle and investment goals.',
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Tenerife offers a remarkable diversity of landscapes and lifestyles despite its relatively small size. Choosing the right area is perhaps the most important decision you\'ll make when buying property on the island.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Costa Adeje — Luxury and Leisure' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Home to five-star resorts, world-class golf courses, and the exclusive Marina Del Sur, Costa Adeje is the premier choice for luxury property buyers. Properties here command premium prices but offer exceptional quality of life and strong rental yields.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Santa Cruz — Urban Living' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'The capital city offers a vibrant urban lifestyle with excellent amenities, cultural attractions, and the island\'s main port. Property prices are more accessible than the luxury southern resorts, making it ideal for young professionals and families.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'La Orotava Valley — Traditional Charm' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'For those seeking authentic Canarian living, the Orotava Valley offers stunning mountain views, historic architecture, and lush vegetation. This area is perfect for buyers looking for a peaceful retreat with easy access to both the north and south coasts.' }] },
    ],
  },
  {
    title: 'Understanding Tenerife\'s Property Market Trends in 2026',
    slug: 'tenerife-property-market-trends-2026',
    excerpt: 'An in-depth analysis of current market conditions, price trends, and investment opportunities in Tenerife\'s real estate sector.',
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'The Tenerife property market continues to show remarkable resilience and growth entering 2026. Following a strong post-pandemic recovery, the island has seen sustained demand from both international buyers and domestic investors.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Price Appreciation' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Property prices in prime locations such as Costa Adeje and La Caleta have appreciated by an average of 8-12% year-on-year. The luxury segment, in particular, has outperformed the broader market, driven by high-net-worth individuals seeking European residency and lifestyle investments.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Demand Drivers' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Several factors continue to drive demand: Tenerife\'s status as a year-round destination, improved air connectivity with major European cities, the rise of remote work enabling location independence, and Spain\'s attractive Golden Visa program for non-EU investors.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Investment Outlook' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'With limited land availability in prime coastal areas, strict building regulations protecting the island\'s natural environment, and consistently strong tourism numbers, the long-term outlook for Tenerife property investments remains very positive.' }] },
    ],
  },
  {
    title: 'The Cost of Buying a Home in Tenerife: A Complete Breakdown',
    slug: 'cost-buying-home-tenerife-breakdown',
    excerpt: 'A transparent look at all the expenses involved in purchasing a property in Tenerife, from taxes and legal fees to ongoing ownership costs.',
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'One of the most common questions we hear from prospective buyers is: "What is the true cost of buying a home in Tenerife?" The answer involves several components that go well beyond the listing price.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Purchase Taxes' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'For resale properties, buyers pay Transfer Tax (ITP) which ranges from 6.5% to 10% depending on the region. In the Canary Islands, the current rate is 6.5%. For new builds, you\'ll pay 7% VAT (IGIC in the Canary Islands) plus 1.5% Stamp Duty.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Legal and Notary Fees' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'You will need a Spanish lawyer (abogado) to handle due diligence, contract review, and the purchase process. Legal fees typically range from 1% to 2% of the purchase price. Notary and land registry fees add approximately 0.5% to 1%.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Ongoing Costs' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Annual ownership costs include Community Fees (for apartments and gated communities), Property Tax (IBI), and Waste Management Tax. Budget approximately 1-2% of the property value annually for maintenance and running costs.' }] },
    ],
  },
  {
    title: 'Top 10 Questions to Ask Before Buying a Villa in Costa Adeje',
    slug: 'questions-before-buying-villa-costa-adeje',
    excerpt: 'Essential questions every buyer should ask when viewing luxury villas in Costa Adeje, from construction quality to rental potential.',
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Costa Adeje represents the pinnacle of luxury living in Tenerife. But with premium prices come important considerations. Here are the ten questions you should ask before making an offer on a villa in this exclusive area.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: '1. What is the build quality and age of the property?' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Newer builds in Costa Adeje benefit from modern construction standards, better insulation, and energy efficiency. Older properties may require renovation but often offer larger plots and more established gardens.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: '2. Does the villa have the necessary licences?' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Ensure the property has a valid First Occupation Licence (Licencia de Primera Ocupación) and that all extensions or modifications have the proper permits. This is crucial for both legality and future resale value.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: '3. What are the community fees and rules?' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Many luxury villas are part of gated communities with shared amenities like pools, gardens, and security. Review the community statutes and fees carefully before committing.' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: '4. What is the rental potential?' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'If you plan to rent out your villa, check whether the community allows short-term holiday rentals and whether the property has a tourist licence. Costa Adeje has specific regulations regarding vacation rentals.' }] },
    ],
  },
];

const esTranslations = [
  {
    title: 'Guía Completa para Comprar Propiedad en Tenerife como Extranjero',
    excerpt: 'Todo lo que necesita saber sobre la compra de inmuebles en Tenerife como residente no español, desde el NIE hasta los honorarios notariales.',
    slug: 'comprar-propiedad-tenerife-extranjero-guia',
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Tenerife ha sido durante mucho tiempo uno de los destinos más buscados de Europa para los compradores internacionales de propiedades. Con su sol durante todo el año, paisajes impresionantes y alta calidad de vida, no es de extrañar que los extranjeros representen un porcentaje significativo de las compras de propiedades en la isla.' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Obteniendo su Número NIE' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'El primer paso para cualquier comprador extranjero es obtener un NIE (Número de Identificación de Extranjero). Este es su número de identificación fiscal y es necesario para cualquier transacción financiera importante en España, incluida la compra de una propiedad.' }] },
    ],
  },
  {
    title: 'Las Mejores Zonas para Vivir en Tenerife: Dónde Comprar en 2026',
    excerpt: 'Desde la glamorosa costa sur hasta el histórico norte, descubra qué zona de Tenerife se adapta mejor a su estilo de vida y objetivos de inversión.',
    slug: 'mejores-zonas-vivir-tenerife-2026',
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Tenerife ofrece una diversidad notable de paisajes y estilos de vida a pesar de su tamaño relativamente pequeño. Elegir la zona adecuada es quizás la decisión más importante que tomará al comprar una propiedad en la isla.' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Costa Adeje — Lujo y Ocio' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Hogar de resorts de cinco estrellas, campos de golf de clase mundial y la exclusiva Marina Del Sur, Costa Adeje es la opción principal para compradores de propiedades de lujo.' }] },
    ],
  },
  {
    title: 'Tendencias del Mercado Inmobiliario de Tenerife en 2026',
    excerpt: 'Un análisis profundo de las condiciones actuales del mercado, las tendencias de precios y las oportunidades de inversión en el sector inmobiliario de Tenerife.',
    slug: 'tendencias-mercado-inmobiliario-tenerife-2026',
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'El mercado inmobiliario de Tenerife continúa mostrando una notable resistencia y crecimiento al entrar en 2026. Tras una fuerte recuperación post-pandemia, la isla ha visto una demanda sostenida tanto de compradores internacionales como de inversores nacionales.' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Apreciación de Precios' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Los precios de las propiedades en ubicaciones privilegiadas como Costa Adeje y La Caleta se han apreciado en un promedio del 8-12% interanual.' }] },
    ],
  },
  {
    title: 'El Costo de Comprar una Casa en Tenerife: Desglose Completo',
    excerpt: 'Una mirada transparente a todos los gastos involucrados en la compra de una propiedad en Tenerife, desde impuestos y honorarios legales hasta costos de propiedad continuos.',
    slug: 'costo-comprar-casa-tenerife-desglose',
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Una de las preguntas más comunes que escuchamos de los compradores potenciales es: "¿Cuál es el costo real de comprar una casa en Tenerife?" La respuesta involucra varios componentes que van mucho más allá del precio de lista.' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Impuestos de Compra' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Para propiedades de reventa, los compradores pagan el Impuesto de Transmisiones Patrimoniales (ITP) que oscila entre el 6.5% y el 10%. En Canarias, la tasa actual es del 6.5%.' }] },
    ],
  },
  {
    title: '10 Preguntas Clave Antes de Comprar una Villa en Costa Adeje',
    excerpt: 'Preguntas esenciales que todo comprador debe hacer al ver villas de lujo en Costa Adeje, desde la calidad de construcción hasta el potencial de alquiler.',
    slug: 'preguntas-comprar-villa-costa-adeje',
    body: [
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Costa Adeje representa la cúspide de la vida de lujo en Tenerife. Pero con precios premium vienen consideraciones importantes. Aquí están las diez preguntas que debe hacer antes de hacer una oferta.' }] },
      { _type: 'block', style: 'h2', children: [{ _type: 'span', text: '1. ¿Cuál es la calidad de construcción y la antigüedad de la propiedad?' }] },
      { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Las construcciones nuevas en Costa Adeje se benefician de estándares modernos de construcción, mejor aislamiento y eficiencia energética.' }] },
    ],
  },
];

// ------------------------------------------------------------------------
//  Seed function
// ------------------------------------------------------------------------
async function seed() {
  console.log('🌱 Seeding blog data...\n');

  // 1. Create Author (if not exists)
  const authorId = 'blog-author-realvilla';
  const existingAuthor = await client.fetch(`*[_id == $id][0]`, { id: authorId });
  
  if (!existingAuthor) {
    await client.createOrReplace({
      _id: authorId,
      _type: 'blogAuthor',
      name: 'REALVILLA Team',
      role: 'Real Estate Experts',
      bio: 'The REALVILLA team brings decades of combined experience in Tenerife\'s luxury property market. We help international buyers find their dream homes in the Canary Islands.',
      slug: { _type: 'slug', current: 'realvilla-team' },
    });
    console.log('  ✅ Created author: REALVILLA Team');
  } else {
    console.log('  ℹ️  Author already exists, skipping');
  }

  // 2. Create Category (if not exists)
  const categoryId = 'blog-category-market-insights';
  const existingCategory = await client.fetch(`*[_id == $id][0]`, { id: categoryId });
  
  if (!existingCategory) {
    await client.createOrReplace({
      _id: categoryId,
      _type: 'blogCategory',
      title: { en: 'Market Insights', es: 'Perspectivas del Mercado' },
      slug: { _type: 'slug', current: 'market-insights' },
      description: { en: 'Analysis and trends in the Tenerife real estate market.', es: 'Análisis y tendencias del mercado inmobiliario en Tenerife.' },
      order: 0,
    });
    console.log('  ✅ Created category: Market Insights');
  } else {
    console.log('  ℹ️  Category already exists, skipping');
  }

  // 3. Create 5 blog posts (EN + ES)
  const reference = { _type: 'reference', _ref: categoryId };
  const authorRef = { _type: 'reference', _ref: authorId };

  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    const enId = `blog-post-${post.slug}-en`;
    const esId = `blog-post-${post.slug}-es`;
    const image = FEATURED_IMAGES[i];

      // English version
    const existingEn = await client.fetch(`*[_id == $id][0]`, { id: enId });
    if (!existingEn) {
      const bodyWithKeys = post.body.map((b) => ({ ...b, _key: crypto.randomBytes(6).toString('hex') }));
      await client.createOrReplace({
        _id: enId,
        _type: 'blogPost',
        language: 'en',
        title: post.title,
        slug: { _type: 'slug', current: post.slug },
        publishedAt: new Date(Date.now() - i * 86400000 * 3).toISOString(), // spread across days
        author: authorRef,
        categories: [{ ...reference, _key: crypto.randomBytes(6).toString('hex') }],
        excerpt: post.excerpt,
        body: bodyWithKeys,
        featuredImage: image,
      });
      console.log(`  ✅ Created EN post: ${post.title}`);
    } else {
      console.log(`  ℹ️  EN post "${post.title}" exists, skipping`);
    }

    // Spanish version
    const esPost = esTranslations[i];
    const esSlug = esPost?.slug || `${post.slug}-es`;
    const currentEsId = `blog-post-${esSlug}-es`;
    const existingEs = await client.fetch(`*[_id == $id][0]`, { id: currentEsId });
    if (!existingEs) {
      const esBodyWithKeys = esPost.body.map((b) => ({ ...b, _key: crypto.randomBytes(6).toString('hex') }));
      await client.createOrReplace({
        _id: currentEsId,
        _type: 'blogPost',
        language: 'es',
        title: esPost?.title || post.title,
        slug: { _type: 'slug', current: esSlug },
        publishedAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
        author: authorRef,
        categories: [{ ...reference, _key: crypto.randomBytes(6).toString('hex') }],
        excerpt: esPost?.excerpt || post.excerpt,
        body: esBodyWithKeys,
        featuredImage: image,
      });
      console.log(`  ✅ Created ES post: ${esPost?.title || post.title}`);
    } else {
      console.log(`  ℹ️  ES post exists, skipping`);
    }
  }

  console.log('\n✅ Blog seeding complete!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
