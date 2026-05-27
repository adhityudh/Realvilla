import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

async function audit() {
  console.log('Fetching blog posts...');
  
  // Fetch all posts, and for each post get translation metadata
  const query = `*[_type == "blogPost" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
    _id,
    title,
    language,
    "slug": slug.current,
    excerpt,
    body,
    author->{name},
    categories[]->{title},
    _createdAt,
    _updatedAt,
    __i18n_refs,
    "translationMetadata": *[_type == "translation.metadata" && references(^._id)][0] {
      translations[] {
        language,
        value {
          _ref
        }
      }
    }
  }`;

  const posts = await client.fetch(query);

  const enPosts = posts.filter(p => p.language === 'en');
  const esPosts = posts.filter(p => p.language === 'es');

  console.log(`Found ${enPosts.length} EN posts and ${esPosts.length} ES posts.`);

  const auditResults = [];

  for (const en of enPosts) {
    const result = {
      en_title: en.title,
      en_slug: en.slug,
      en_id: en._id,
      status: 'OK',
      es_match: null,
      issues: []
    };

    // Find the ES counterpart
    let esId = null;
    if (en.translationMetadata) {
      const esTrans = en.translationMetadata.translations.find(t => t.language === 'es');
      if (esTrans && esTrans.value) {
        esId = esTrans.value._ref;
      }
    } else if (en.__i18n_refs) {
        const esTrans = en.__i18n_refs.find(r => r._key === 'es');
        if (esTrans) {
            esId = esTrans._ref;
        }
    }

    if (!esId) {
      result.status = 'MISSING_ES_TRANSLATION';
      result.issues.push('No Spanish translation linked via translation.metadata or __i18n_refs');
    } else {
      const es = esPosts.find(p => p._id === esId);
      if (!es) {
        result.status = 'BROKEN_LINK';
        result.issues.push(`Linked ES document (_id: ${esId}) does not exist or is a draft.`);
      } else {
        result.es_match = {
          title: es.title,
          slug: es.slug,
          id: es._id
        };
        
        // Compare fields
        if (!es.body) {
            result.issues.push('ES version is missing body content');
        } else {
            // Very naive length check, just to see if it's completely different
            if (en.body && Math.abs(JSON.stringify(en.body).length - JSON.stringify(es.body).length) > 1000) {
                result.issues.push('Significant body content length difference. Maybe not fully translated?');
            }
        }
        
        if (!es.excerpt && en.excerpt) {
            result.issues.push('ES version is missing excerpt');
        }
        
        if (en.categories?.length !== es.categories?.length) {
            result.issues.push(`Category mismatch: EN has ${en.categories?.length || 0}, ES has ${es.categories?.length || 0}`);
        }
        
        if (result.issues.length > 0) {
            result.status = 'NEEDS_UPDATE';
        }
      }
    }
    
    auditResults.push(result);
  }
  
  // Find ES orphans
  const orphans = esPosts.filter(es => {
      let enId = null;
      if (es.translationMetadata) {
          const enTrans = es.translationMetadata.translations.find(t => t.language === 'en');
          if (enTrans && enTrans.value) enId = enTrans.value._ref;
      } else if (es.__i18n_refs) {
          const enTrans = es.__i18n_refs.find(r => r._key === 'en');
          if (enTrans) enId = enTrans._ref;
      }
      return !enId || !enPosts.find(en => en._id === enId);
  });
  
  if (orphans.length > 0) {
      console.log(`\nFound ${orphans.length} orphaned ES posts (no linked EN post):`);
      for (const orphan of orphans) {
          console.log(`- ${orphan.title} (${orphan.slug})`);
      }
  }

  fs.writeFileSync(path.resolve(__dirname, 'audit-report.json'), JSON.stringify(auditResults, null, 2));
  console.log('\nAudit complete. Wrote detailed report to scripts/audit-report.json');
}

audit().catch(console.error);
