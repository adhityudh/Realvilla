'use client';

import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/image';
import './BlogCard.css';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  publishedAt?: string;
  excerpt?: string;
  featuredImage?: any;
  author?: {
    name?: string;
    avatar?: any;
  };
  categories?: Array<{
    _id: string;
    title: string;
    slug: string;
  }>;
  tags?: string[];
  language?: string;
}

export default function BlogCard({ post, locale, variant = 'default' }: { post: BlogPost; locale: string; variant?: 'default' | 'featured' | 'seamless' }) {
  const { title, slug, publishedAt, excerpt, featuredImage, author, categories } = post;
  const href = `/${locale}/blog/${slug}`;

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

  const imageUrl = featuredImage?.asset?.url
    ? urlForImage(featuredImage).width(variant === 'featured' ? 800 : 600).url()
    : null;

  return (
    <Link href={href} className={`blog-card blog-card--${variant}`}>
      <div className="blog-card-image-wrapper">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={featuredImage?.alt || title}
            className="blog-card-image"
            fill
            sizes={variant === 'featured' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="blog-card-image-placeholder" />
        )}
        {categories && categories.length > 0 && (
          <span className="blog-card-category-badge">
            {categories[0].title}
          </span>
        )}
      </div>
      <div className="blog-card-content">
        {publishedAt && (
          <time className="blog-card-date" dateTime={publishedAt}>
            {formatDate(publishedAt)}
          </time>
        )}
        <h3 className="blog-card-title">{title}</h3>
        {excerpt && <p className="blog-card-excerpt">{excerpt}</p>}
        {author && author.name && (
          <div className="blog-card-author">
            {author.avatar?.asset?.url && (
              <Image
                src={urlForImage(author.avatar).width(32).height(32).url()}
                alt={author.name}
                width={24}
                height={24}
                className="blog-card-avatar"
              />
            )}
            <span className="blog-card-author-name">{author.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}