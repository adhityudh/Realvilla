import { groq } from 'next-sanity'

export const SEO_FIELDS = groq`
  seo {
    metaTitle,
    metaDescription,
    ogImage { asset->{ url } },
    noIndex,
    canonicalUrl
  }
`

export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current == $slug && (language == $language || (!defined(language) && $language == "en"))][0] {
    title,
    ${SEO_FIELDS},
    "_translations": *[_type == "translation.metadata" && references(^._id)][0].translations[].value->{
      "language": language,
      "slug": slug.current
    },
    sections[] {
      _type,
      _key,
      _type == "heroSection" => {
        title,
        subtitle,
        "desktopVideoMP4": desktopVideoMP4.asset->url,
        "desktopVideoWebM": desktopVideoWebM.asset->url,
        "mobileVideoMP4": mobileVideoMP4.asset->url,
        "mobileVideoWebM": mobileVideoWebM.asset->url,
        "ctas": ctas[] {
          label,
          "icon": icon.asset->url,
          "link": select(
            linkType == "internal" => "/" + internalLink->slug.current,
            linkType == "external" => externalLink
          )
        }
      },
      _type == "valuationSection" => {
        tagline,
        headline,
        body,
        trustText,
        ctaLabel,
        iframeUrl,
        "ctaLink": select(
          linkType == "internal" => "/" + internalLink->slug.current,
          linkType == "external" => externalLink
        )
      },
      _type == "aboutSection" => {
        tagline,
        headline,
        body,
        profileName,
        bgImage { 
          asset->{ _id, url, metadata { lqip, dimensions } } 
        },
        objectImage { 
          asset->{ _id, url, metadata { lqip, dimensions } } 
        },
        certificates[] { 
          asset->{ _id, url, metadata { lqip, dimensions } } 
        },
        "socialLinks": socialLinks[] {
          platform,
          label,
          "icon": icon.asset->url,
          "link": select(
            linkType == "internal" => "/" + internalLink->slug.current,
            linkType == "external" => externalLink
          )
        }
      },
      _type == "propertiesSection" => {
        tagline,
        headline,
        selectionType,
        limit,
        ctaLabel,
        "ctaLink": select(
          linkType == "internal" => "/" + internalLink->slug.current,
          linkType == "external" => externalLink
        ),
        "properties": select(
          selectionType == "manual" => manualProperties[]-> {
            _id,
            address,
            price,
            beds,
            baths,
            sqft,
            status,
            image { asset->{ _id, url, metadata { lqip, dimensions } } },
            secondaryImage { asset->{ _id, url, metadata { lqip, dimensions } } }
          },
          selectionType == "dynamic" || !selectionType => *[_type == "property" && (language == $language || (!defined(language) && $language == "en")) && (showSold == true || status != "sold")] | order(_createdAt desc) [0...10] {
            _id,
            address,
            price,
            beds,
            baths,
            sqft,
            status,
            image { asset->{ _id, url, metadata { lqip, dimensions } } },
            secondaryImage { asset->{ _id, url, metadata { lqip, dimensions } } }
          }
        )
      },
      _type == "testimonialsSection" => {
        title,
        testimonials[] {
          name,
          title,
          stars,
          text
        },
        overlapImage { asset->{ _id, url, metadata { lqip, dimensions } } }
      },
      _type == "contactSection" => {
        headline,
        subtitle,
        marketData[] {
          value,
          prefix,
          unit,
          label
        },
        ctaLabel,
        "ctaLink": select(
          linkType == "internal" => "/" + internalLink->slug.current,
          linkType == "external" => externalLink
        )
      },
      _type == "partnerSection" => {
        title,
        partners[] {
          name,
          "logo": logo.asset->url,
          "link": select(
            linkType == "internal" => "/" + internalLink->slug.current,
            linkType == "external" => externalLink
          )
        }
      },
      _type == "mortgageFAQSection" => {
        tagline,
        title,
        description,
        showSecondaryCta,
        ctaPrimaryLabel,
        ctaSecondaryLabel,
        faqs[] {
          question,
          answer
        },
        "ctaPrimaryLink": select(
          ctaPrimaryLinkType == "internal" => "/" + ctaPrimaryInternalLink->slug.current,
          ctaPrimaryLinkType == "external" => ctaPrimaryExternalLink
        ),
        "ctaSecondaryLink": select(
          ctaSecondaryLinkType == "internal" => "/" + ctaSecondaryInternalLink->slug.current,
          ctaSecondaryLinkType == "external" => ctaSecondaryExternalLink
        )
      },
      _type == "buyHeroSection" => {
        title,
        "backgroundImage": backgroundImage.asset->url,
        searchPlaceholder,
        jumpLinks[] {
          label,
          link
        }
      }
    }
  }
`

export const SETTINGS_QUERY = groq`
  *[_type == "settings" && (language == $language || (!defined(language) && $language == "en"))][0] {
    ${SEO_FIELDS},
    "favicon": favicon.asset->url,
    socialLinks[] {
      label,
      "icon": icon.asset->url,
      "link": select(
        linkType == "internal" => "/" + internalLink->slug.current,
        linkType == "external" => externalLink
      )
    },
    mainNav[] {
      label,
      "link": select(
        linkType == "internal" => "/" + internalLink->slug.current,
        linkType == "external" => externalLink
      )
    },
    mobileNav[] {
      label,
      "link": select(
        linkType == "internal" => "/" + internalLink->slug.current,
        linkType == "external" => externalLink
      )
    },
    headerCta {
      label,
      "link": select(
        linkType == "internal" => "/" + internalLink->slug.current,
        linkType == "external" => externalLink
      )
    },
    footer {
      columns[] {
        title,
        subgroups[] {
          title,
          links[] {
            label,
            "link": select(
              linkType == "internal" => "/" + internalLink->slug.current,
              linkType == "external" => externalLink
            )
          }
        }
      },
      legalLinks[] {
        label,
        "link": select(
          linkType == "internal" => "/" + internalLink->slug.current,
          linkType == "external" => externalLink
        )
      },
      copyright,
      disclaimer,
      socialLinks[] {
        label,
        "icon": icon.asset->url,
        "link": select(
          linkType == "internal" => "/" + internalLink->slug.current,
          linkType == "external" => externalLink
        )
      }
    }
  }
`
