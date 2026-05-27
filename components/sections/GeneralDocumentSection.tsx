'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';
import './GeneralDocumentSection.css';

interface GeneralDocumentSectionProps {
  title?: string;
  body: any[];
  tocLabel?: string;
}

// Convert heading text to a URL-safe slug id
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

interface TocItem {
  id: string;
  text: string;
  level: 'h2' | 'h3';
}

// Extract TOC items from Sanity portable text body
function extractToc(body: any[]): TocItem[] {
  if (!body) return [];
  return body
    .filter((b) => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'))
    .map((b) => {
      const text = (b.children as any[]).map((c: any) => c.text).join('');
      return { id: slugify(text), text, level: b.style as 'h2' | 'h3' };
    })
    .filter((item) => item.text.trim() !== '');
}

export default function GeneralDocumentSection({ data }: { data: any }) {
  const { title, body, tocLabel = 'Table of Contents' } = data || {};
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  const tocItems = extractToc(body || []);

  // IntersectionObserver to track which heading is in view
  useEffect(() => {
    if (tocItems.length === 0) return;

    const headingEls: HTMLElement[] = tocItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headingEls.length === 0) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0,
      }
    );

    headingEls.forEach((el) => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, [body]);

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 96; // header height clearance
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.scrollTo(top, { duration: 1.2 });
    } else {
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setActiveId(id);
  };

  return (
    <section className="gd-section">
      <div className="gd-container">
        {body && (
          <div className="gd-content-layout">
            {/* Left: TOC Sidebar */}
            {tocItems.length > 0 && (
              <aside className="gd-toc-sidebar">
                <p className="gd-toc-label">{tocLabel}</p>
                <nav className="gd-toc-nav">
                  <ul className="gd-toc-list">
                    {tocItems.map((item) => (
                      <li
                        key={item.id}
                        className={`gd-toc-item gd-toc-item--${item.level} ${activeId === item.id ? 'is-active' : ''}`}
                      >
                        <a
                          href={`#${item.id}`}
                          className="gd-toc-link"
                          onClick={(e) => handleTocClick(e, item.id)}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            {/* Right/Center: Article body */}
            <div className="gd-body">
              {body.map((block: any, idx: number) => {
                if (block._type === 'block') {
                  const style = block.style || 'normal';
                  const text = (block.children as any[]).map((c: any) => c.text).join('');

                  if (style === 'h2') {
                    return <h2 key={idx} id={slugify(text)}>{text}</h2>;
                  }
                  if (style === 'h3') {
                    return <h3 key={idx} id={slugify(text)}>{text}</h3>;
                  }
                  if (style === 'blockquote') {
                    return <blockquote key={idx}>{text}</blockquote>;
                  }
                  if (!text.trim()) return null;
                  return <p key={idx}>{text}</p>;
                }
                if (block._type === 'image' && block.asset) {
                  const imgUrl = urlForImage(block).width(800).url();
                  return (
                    <figure key={idx} className="gd-body-image">
                      <Image
                        src={imgUrl}
                        alt={block.alt || ''}
                        width={800}
                        height={500}
                        style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                      />
                      {block.caption && <figcaption>{block.caption}</figcaption>}
                    </figure>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
