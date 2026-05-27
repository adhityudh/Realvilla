'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/image';
import BlogCard from '../ui/BlogCard';
import Button from '../ui/Button';
import './BlogDetailSection.css';

interface BlogDetailSectionProps {
  post: any;
  dict?: any;
  locale: string;
  blogDetailCta?: {
    headline: string;
    ctaLabel: string;
    linkType: 'internal' | 'external';
    openInNewWindow?: boolean;
    internalLink?: {
      _type: string;
      slug: string;
    } | null;
    internalSection?: string;
    externalLink?: string;
  } | null;
  blogDetailAbout?: {
    title: string;
    body: string;
    ctaLabel?: string;
    linkType?: 'internal' | 'external';
    openInNewWindow?: boolean;
    internalLink?: {
      _type: string;
      slug: string;
    } | null;
    internalSection?: string;
    externalLink?: string;
  } | null;
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

export default function BlogDetailSection({ post, dict, locale, blogDetailCta, blogDetailAbout }: BlogDetailSectionProps) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    document.body.classList.remove('header-light-mode');
    document.body.classList.add('header-dark-mode');
    return () => {
      document.body.classList.remove('header-dark-mode');
    };
  }, []);

  const tocItems = extractToc(post.body || []);

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
  }, [post.body]);

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const featuredImageUrl = post.featuredImage?.asset?.url
    ? urlForImage(post.featuredImage).width(1200).height(630).url()
    : null;

  return (
    <article className="blog-detail-section">
      <div className="blog-detail-container">
        {/* Breadcrumb */}
        <div className="blog-breadcrumb-wrapper">
          <nav className="blog-breadcrumb">
            <Link href={`/${locale}`} className="breadcrumb-item breadcrumb-home-link">
              <img src="/images/logo-mark-raster.png" alt="Home" width="20" height="20" className="breadcrumb-logo" />
            </Link>
            <img src="/icons/chevron_forward.svg" className="breadcrumb-separator" alt="separator" width="16" height="16" />
            <Link href={`/${locale}/blog`} className="breadcrumb-item">
              <span>{dict?.blog?.back_to_blog}</span>
            </Link>
            <img src="/icons/chevron_forward.svg" className="breadcrumb-separator" alt="separator" width="16" height="16" />
            <div className="breadcrumb-item current">
              {post.title}
            </div>
          </nav>
        </div>

        {/* Header */}
        <header className="blog-detail-header">
          <div className="blog-detail-header-left">
            {post.title && <h1 className="blog-detail-title">{post.title}</h1>}
          </div>
          <div className="blog-detail-header-right">
            <div className="blog-card-meta">
              {post.categories && post.categories.length > 0 && (
                <span className="blog-card-category-badge">
                  {post.categories[0].title}
                </span>
              )}
              <div className="blog-card-date-author">
                {post.publishedAt && (
                  <time className="blog-card-date" dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                )}
                {post.author?.name && (
                  <div className="blog-card-author">
                    {post.author.avatar?.asset?.url && (
                      <Image
                        src={urlForImage(post.author.avatar).width(32).height(32).url()}
                        alt={post.author.name}
                        width={24}
                        height={24}
                        className="blog-card-avatar"
                      />
                    )}
                    <span className="blog-card-author-name">{post.author.name}</span>
                  </div>
                )}
              </div>
            </div>
            {post.excerpt && (
              <div className="blog-detail-excerpt">{post.excerpt}</div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {featuredImageUrl && (
          <div className="blog-detail-image-wrapper">
            <Image
              src={featuredImageUrl}
              alt={post.featuredImage?.alt || post.title}
              className="blog-detail-image"
              width={1200}
              height={630}
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
              priority
            />
          </div>
        )}

        {/* Body + TOC layout */}
        {post.body && (
          <div className="blog-detail-content-layout">
            {/* Left: TOC Sidebar */}
            {tocItems.length > 0 && (
              <aside className="blog-toc-sidebar">
                <p className="blog-toc-label">
                  {dict?.blog?.toc_label}
                </p>
                {/* <div className="blog-toc-article-title">{post.title}</div> */}
                <nav className="blog-toc-nav">
                  <ul className="blog-toc-list">
                    {tocItems.map((item) => (
                      <li
                        key={item.id}
                        className={`blog-toc-item blog-toc-item--${item.level} ${activeId === item.id ? 'is-active' : ''}`}
                      >
                        <a
                          href={`#${item.id}`}
                          className="blog-toc-link"
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

            {/* Center: Article body */}
            <div className="blog-detail-body">
              {post.body.map((block: any, idx: number) => {
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
                    <figure key={idx} className="blog-detail-body-image">
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

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="blog-detail-tags">
                  {post.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="blog-detail-tag">{tag}</span>
                  ))}
                </div>
              )}

              {/* About REALVILLA Info Card */}
              {blogDetailAbout && (() => {
                let href = '#';
                if (blogDetailAbout.linkType === 'internal' && blogDetailAbout.internalLink) {
                  const slug = blogDetailAbout.internalLink.slug;
                  const type = blogDetailAbout.internalLink._type;
                  
                  if (type === 'page') {
                    const isHome = slug === 'home' || slug === 'inicio';
                    href = isHome ? `/${locale}` : `/${locale}/${slug}`;
                  }
                  
                  if (blogDetailAbout.internalSection) {
                    href += `#${blogDetailAbout.internalSection}`;
                  }
                } else if (blogDetailAbout.linkType === 'external' && blogDetailAbout.externalLink) {
                  href = blogDetailAbout.externalLink;
                }

                return (
                  <>
                    <div className="blog-detail-about-divider" />
                    <h3>{blogDetailAbout.title}</h3>
                    <p>{blogDetailAbout.body}</p>
                    {blogDetailAbout.ctaLabel && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <Button
                          label={blogDetailAbout.ctaLabel}
                          href={href}
                          variant="link-dark"
                          className="btn-link-styled btn-link-md"
                          target={blogDetailAbout.openInNewWindow ? '_blank' : undefined}
                          rel={blogDetailAbout.openInNewWindow ? 'noopener noreferrer' : undefined}
                        />
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Author Bio */}
              {/* {post.author?.bio && (
                <div className="blog-detail-author-bio">
                  {post.author.avatar?.asset?.url && (
                    <Image
                      src={urlForImage(post.author.avatar).width(80).height(80).url()}
                      alt={post.author.name}
                      width={64}
                      height={64}
                      className="blog-detail-author-bio-avatar"
                    />
                  )}
                  <div>
                    <strong>{post.author.name}</strong>
                    <p>{post.author.bio}</p>
                  </div>
                </div>
              )} */}
            </div>

            {/* Right: CTA card column */}
            {blogDetailCta && (() => {
              let href = '#';
              if (blogDetailCta.linkType === 'internal' && blogDetailCta.internalLink) {
                // Determine page URL path
                const slug = blogDetailCta.internalLink.slug;
                const type = blogDetailCta.internalLink._type;
                
                if (type === 'page') {
                  // Resolve standard pages (dynamic localized paths)
                  const isHome = slug === 'home' || slug === 'inicio';
                  href = isHome ? `/${locale}` : `/${locale}/${slug}`;
                }
                
                if (blogDetailCta.internalSection) {
                  href += `#${blogDetailCta.internalSection}`;
                }
              } else if (blogDetailCta.linkType === 'external' && blogDetailCta.externalLink) {
                href = blogDetailCta.externalLink;
              }

              return (
                <aside className="blog-detail-right-col">
                  <div className="blog-detail-sidebar-cta">
                    <p className="blog-detail-sidebar-cta-headline">{blogDetailCta.headline}</p>
                    <Button
                      label={blogDetailCta.ctaLabel}
                      href={href}
                      variant="outline"
                      showArrow={false}
                      className="blog-detail-sidebar-cta-btn"
                      target={blogDetailCta.openInNewWindow ? '_blank' : undefined}
                      rel={blogDetailCta.openInNewWindow ? 'noopener noreferrer' : undefined}
                    />
                  </div>
                </aside>
              );
            })()}
          </div>
        )}
      </div>

      {/* Related Posts */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <div className="blog-detail-related">
          <div className="blog-detail-container">
            <h2 className="blog-detail-related-title">
              {dict?.blog?.related_posts}
            </h2>
            <div className="blog-detail-related-grid">
              {post.relatedPosts.map((related: any) => (
                <BlogCard key={related._id} post={related} locale={locale} />
              ))}
            </div>
            
            <div className="blog-detail-related-cta">
              <Button
                href={locale === 'es' ? '/es/blog' : '/en/blog'}
                variant="dark"
                label={dict?.blog?.view_all}
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}