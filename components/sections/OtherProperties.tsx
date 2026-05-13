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
  price?: number;
  locale: string;
  dict: any;
}

// Single GROQ Query with high-dimensional additive score sorting:
// - Same Category: weight 5 (Primary context: type match)
// - Similar Price (±30%): weight 4 (High psychological constraint: budget match)
// - Same Municipality: weight 3 (Geographic constraint: area match)
// Summation provides perfect matching (12), cross-attribute blends, or newest fallback (0).
const SUGGESTED_PROPERTIES_QUERY = groq`
  *[_type == "property" && (language == $language || (!defined(language) && $language == "en")) && status == "for-sale" && _id != $currentId] 
  | order(
      (
        select(category._ref == $categoryId => 5, 0) + 
        select(price >= $minPrice && price <= $maxPrice => 4, 0) + 
        select(location.municipality == $municipality => 3, 0)
      ) desc,
      _createdAt desc
    ) [0...3] {
      ${PROPERTY_CARD_FIELDS}
    }
`;

export default async function OtherProperties({ currentPropertyId, categoryId, municipality, price, locale, dict }: OtherPropertiesProps) {
  let properties = [];
  
  // Calculate similar budget thresholds (±30%) to feed matching engine
  const currentPrice = Number(price) || 0;
  const minPrice = currentPrice > 0 ? currentPrice * 0.70 : 0;
  const maxPrice = currentPrice > 0 ? currentPrice * 1.30 : 0;

  try {
    properties = await client.fetch(
      SUGGESTED_PROPERTIES_QUERY, 
      { 
        language: locale, 
        currentId: currentPropertyId, 
        categoryId: categoryId || '', 
        municipality: municipality || '',
        minPrice,
        maxPrice
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
            <PropertyCard key={prop._id} prop={prop} dict={dict} />
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
