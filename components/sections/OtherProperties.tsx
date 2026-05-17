import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import { PROPERTY_CARD_FIELDS } from '@/sanity/lib/queries';
import PropertyCard from '@/components/ui/PropertyCard';
import Button from '@/components/ui/Button';
import './OtherProperties.css';

interface OtherPropertiesProps {
  currentPropertyId: string;
  categoryId?: string;
  municipality?: string;
  locale: string;
  dict: any;
}

// Single GROQ Query with smart sorting weights:
// Priority score: 
// 3 = SAME Category && SAME Municipality
// 2 = SAME Category ONLY
// 1 = SAME Municipality ONLY
// 0 = Default (Fallback to newest)
const SUGGESTED_PROPERTIES_QUERY = groq`
  *[_type == "property" && (language == $language || (!defined(language) && $language == "en")) && status == "for-sale" && _id != $currentId] 
  | order(
      select(
        category._ref == $categoryId && location.municipality == $municipality => 3,
        category._ref == $categoryId => 2,
        location.municipality == $municipality => 1,
        0
      ) desc,
      _createdAt desc
    ) [0...3] {
      ${PROPERTY_CARD_FIELDS}
    }
`;

export default async function OtherProperties({ currentPropertyId, categoryId, municipality, locale, dict }: OtherPropertiesProps) {
  let properties = [];
  try {
    properties = await client.fetch(
      SUGGESTED_PROPERTIES_QUERY, 
      { 
        language: locale, 
        currentId: currentPropertyId, 
        categoryId: categoryId || '', 
        municipality: municipality || '' 
      },
      { next: { revalidate: 60 } }
    );
  } catch (err) {
    console.error('[OtherProperties] Suggestion fetch error:', err);
  }

  if (!properties || properties.length === 0) return null;

  const title = locale === 'es' ? 'Explorar Otras Propiedades' : 'Explore Other Properties';
  const ctaLabel = dict?.search?.view_all || (locale === 'es' ? 'VER TODAS' : 'VIEW ALL');
  const linkPath = locale === 'es' ? '/es/propiedades' : '/en/properties';

  return (
    <section className="other-properties-section">
      <div className="other-properties-container">
        <h2 className="other-properties-title">{title}</h2>
        
        <div className="properties-grid-suggested">
          {properties.map((prop: any) => (
            <PropertyCard key={prop._id} prop={prop} variant="default" dict={dict} />
          ))}
        </div>

        <div className="other-properties-cta">
          <Button 
            href={linkPath}
            variant="dark"
            label={ctaLabel}
          />
        </div>
      </div>
    </section>
  );
}
