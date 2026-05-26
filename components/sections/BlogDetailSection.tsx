'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/image';
import BlogCard from '../ui/BlogCard';
import './BlogDetailSection.css';

interface BlogDetailSectionProps {
  post: any;
  dict?: any;
  locale: string;
}

export default function BlogDetailSection({ post, dict, locale }: BlogDetailSectionProps) {
  useEffect(() => {
    document.body.classList.remove('header-light-mode');
    document.body.classList.add('header-dark-mode');
    return () => {
      document.body.classList.remove('header-dark-mode');
    };
  }, []);

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
        {/* Back link */}
        <Link href={`/${locale}/blog`} className="blog-detail-back">
          ← {dict?.blog?.back_to_blog || 'Back to Blog'}
        </Link>

        {/* Header */}
        <header className="blog-detail-header">
          {post.categories && post.categories.length > 0 && (
            <div className="blog-detail-categories">
              {post.categories.map((cat: any) => (
                <span key={cat._id} className="blog-detail-category">
                  {cat.title}
                </span>
              ))}
            </div>
          )}
          <h1 className="blog-detail-title">{post.title}</h1>
          <div className="blog-detail-meta">
            {post.publishedAt && (
              <time className="blog-detail-date" dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            )}
            {post.author?.name && (
              <div className="blog-detail-author">
                {post.author.avatar?.asset?.url && (
                  <Image
                    src={urlForImage(post.author.avatar).width(32).height(32).url()}
                    alt={post.author.name}
                    width={24}
                    height={24}
                    className="blog-detail-avatar"
                  />
                )}
                <span>{post.author.name}</span>
              </div>
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

        {/* Body */}
        {post.body && (
          <div className="blog-detail-body">
            {post.body.map((block: any, idx: number) => {
              if (block._type === 'block') {
                const style = block.style || 'normal';
                if (style === 'h2') {
                  return <h2 key={idx}>{block.children.map((c: any) => c.text).join('')}</h2>;
                }
                if (style === 'h3') {
                  return <h3 key={idx}>{block.children.map((c: any) => c.text).join('')}</h3>;
                }
                if (style === 'blockquote') {
                  return <blockquote key={idx}>{block.children.map((c: any) => c.text).join('')}</blockquote>;
                }
                // Normal paragraph
                const text = block.children.map((c: any) => c.text).join('');
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
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="blog-detail-tags">
            {post.tags.map((tag: string, idx: number) => (
              <span key={idx} className="blog-detail-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Author Bio */}
        {post.author?.bio && (
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
        )}
      </div>

      {/* Related Posts */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <div className="blog-detail-related">
          <div className="blog-detail-container">
            <h2 className="blog-detail-related-title">
              {dict?.blog?.related_posts || 'Related Articles'}
            </h2>
            <div className="blog-detail-related-grid">
              {post.relatedPosts.map((related: any) => (
                <BlogCard key={related._id} post={related} locale={locale} />
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}