/**
 * Seed Script: Inject Contact Section to Blog Page Sections
 * 
 * This script adds a pre-configured Contact Section to the blogPageSections
 * array in Global Settings for both EN and ES locales.
 * 
 * Usage: node scripts/seed-blog-contact.js
 */

const { createClient } = require('@sanity/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const contactSectionEN = {
  _type: 'contactSection',
  _key: `blog-contact-en-${Date.now()}`,
  headline: 'SPEAK WITH A SPECIALIST',
  subtitle: 'Need deeper insights? Discuss your real estate goals with our Tenerife market experts.',
  mode: 'form',
  initialStep: 'general',
  formTitle: 'START A CONVERSATION',
  formSubtitle: 'Leave your details below, and a REALVILLA advisor will reach out to you promptly.',
  showIntentWhatsApp: true,
  generalTitle: 'General Inquiry',
  generalSubtitle: 'Reach out for tailored advice, property inquiries, or market information.',
  hideGeneralWhatsApp: false,
};

const contactSectionES = {
  _type: 'contactSection',
  _key: `blog-contact-es-${Date.now()}`,
  headline: 'HABLE CON UN ESPECIALISTA',
  subtitle: '¿Necesita información más detallada? Discuta sus objetivos inmobiliarios con nuestros expertos en Tenerife.',
  mode: 'form',
  initialStep: 'general',
  formTitle: 'INICIE UNA CONVERSACIÓN',
  formSubtitle: 'Deje sus datos a continuación y un asesor de REALVILLA se pondrá en contacto con usted a la brevedad.',
  showIntentWhatsApp: true,
  generalTitle: 'Consulta General',
  generalSubtitle: 'Contáctenos para asesoramiento personalizado, consultas sobre propiedades o información del mercado.',
  hideGeneralWhatsApp: false,
};

async function seedBlogContact() {
  try {
    console.log('🌱 Starting seed: Inject Contact Section to Blog Page Sections...\n');

    // Fetch all settings documents
    const settingsDocs = await client.fetch(
      `*[_type == "settings"]{ _id, _rev, language, blogPageSections }`
    );

    if (!settingsDocs || settingsDocs.length === 0) {
      console.error('❌ No settings documents found!');
      return;
    }

    console.log(`📄 Found ${settingsDocs.length} settings document(s)\n`);

    // Update each settings document
    for (const doc of settingsDocs) {
      const locale = doc.language || 'en';
      console.log(`🔄 Processing settings for locale: ${locale.toUpperCase()}`);

      // Fetch homepage for this locale to get the market data
      console.log(`📥 Fetching homepage contact section for market data...`);
      const homepage = await client.fetch(
        `*[_type == "page" && slug.current == "home" && language == $language][0]{ sections }`,
        { language: locale }
      );

      let marketData = [];
      if (homepage && homepage.sections) {
        const homepageContactSection = homepage.sections.find(
          section => section._type === 'contactSection'
        );
        if (homepageContactSection && homepageContactSection.marketData) {
          marketData = homepageContactSection.marketData;
          console.log(`✅ Found market data from homepage for ${locale.toUpperCase()}`);
        }
      }

      // Select the appropriate contact section based on locale and add market data
      const baseContactSection = locale === 'es' ? contactSectionES : contactSectionEN;
      const contactSection = {
        ...baseContactSection,
        marketData: marketData
      };

      // Check if blogPageSections already has a contact section
      const existingSections = doc.blogPageSections || [];
      const contactSectionIndex = existingSections.findIndex(
        section => section._type === 'contactSection'
      );

      let updatedSections;
      if (contactSectionIndex !== -1) {
        // Update existing contact section
        console.log(`🔄 Updating existing Contact Section for ${locale.toUpperCase()}...`);
        updatedSections = [...existingSections];
        updatedSections[contactSectionIndex] = contactSection;
      } else {
        // Add new contact section
        console.log(`➕ Adding new Contact Section for ${locale.toUpperCase()}...`);
        updatedSections = [...existingSections, contactSection];
      }

      // Update the document
      await client
        .patch(doc._id)
        .set({ blogPageSections: updatedSections })
        .commit();

      console.log(`✅ Successfully updated Contact Section for ${locale.toUpperCase()} settings`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check Sanity Studio → Global Settings → Blog Page');
    console.log('   2. Verify Contact Section is present in Blog Page Sections');
    console.log('   3. Contact Section should match homepage, with initialStep = "general"');
    console.log('   4. Visit /blog page to see the Contact Section\n');

  } catch (error) {
    console.error('❌ Error seeding blog contact section:', error);
    process.exit(1);
  }
}

// Run the seed
seedBlogContact();
