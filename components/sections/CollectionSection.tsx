'use client';

import StretchArrow from '@/components/ui/StretchArrow';
import PropertyCard from '@/components/ui/PropertyCard';

const FEATURED_PROPERTIES = [
  { title: 'Villa Oceana', meta: 'Costa Adeje · 4 Bed · €2,850,000', imageSrc: '/images/buy.jpg' },
  { title: 'Casa del Mar', meta: 'Los Cristianos · 3 Bed · €1,950,000', imageSrc: '/images/sell.jpg' },
  { title: 'Finca Dorada', meta: 'Guía de Isora · 5 Bed · €3,200,000', imageSrc: '/images/invest.jpg' },
];

export default function CollectionSection() {
  return (
    <section className="collection-section">
      <div className="collection-container">
        <div className="collection-info">
          <div className="collection-label"><div className="collection-label-line" />Featured Properties</div>
          <h2 className="collection-headline">Curated Selection of Premium Estates</h2>
          <p className="collection-desc">Discover handpicked luxury properties across Tenerife&apos;s most sought-after locations. Each property has been personally vetted by our team of experts.</p>
          <a href="#" className="service-cta"><span>View All Properties</span><StretchArrow /></a>
        </div>
        <div className="collection-carousel-wrapper">
          <div className="collection-carousel">
            {FEATURED_PROPERTIES.map((p) => <PropertyCard key={p.title} {...p} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
