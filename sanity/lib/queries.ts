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

export const INTERNAL_LINK_PROJECTION = `select(
  linkType == "internal" => select(
    internalLink->slug.current == "home" => "/" + coalesce(internalLink->language, $language),
    "/" + coalesce(internalLink->language, $language) + "/" + internalLink->slug.current
  ),
  linkType == "external" => externalLink
)`

// Reusable property card projection (for listings, cards, carousels)
export const PROPERTY_CARD_FIELDS = groq`
  _id,
  title,
  "address": coalesce(location.fullAddress, address),
  price,
  status,
  featured,
  "slug": slug.current,
  image { asset->{ _id, url, metadata { lqip, dimensions } } },
  secondaryImage { asset->{ _id, url, metadata { lqip, dimensions } } },
  // Legacy fields for backward compat
  beds,
  baths,
  sqft,
  // New dynamic meta (resolved inline)
  meta[] {
    "metaId": metaKey->_id,
    "shortLabel": coalesce(metaKey->shortLabel[$language], metaKey->shortLabel.en),
    "valueType": metaKey->valueType,
    "unit": coalesce(metaKey->unit[$language], metaKey->unit.en),
    "isHighlighted": metaKey->isHighlighted,
    "highlightOrder": metaKey->highlightOrder,
    "icon": metaKey->icon.asset->url,
    numberValue,
    stringValue,
    booleanValue
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
          "link": ${INTERNAL_LINK_PROJECTION}
        }
      },
      _type == "valuationSection" => {
        tagline,
        headline,
        body,
        trustText,
        ctaLabel,
        iframeUrl,
        "ctaLink": ${INTERNAL_LINK_PROJECTION}
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
          "link": ${INTERNAL_LINK_PROJECTION}
        }
      },
      _type == "propertiesSection" => {
        tagline,
        headline,
        selectionType,
        limit,
        limitMobile,
        ctaLabel,
        "ctaLink": ${INTERNAL_LINK_PROJECTION},
        "properties": select(
          selectionType == "manual" => manualProperties[]-> {
            ${PROPERTY_CARD_FIELDS}
          },
          selectionType == "dynamic" || !selectionType => *[_type == "property" && (language == $language || (!defined(language) && $language == "en")) && (showSold == true || status != "sold")] | order(_createdAt desc) [0...10] {
            ${PROPERTY_CARD_FIELDS}
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
        formTitle,
        formSubtitle,
        marketData[] {
          value,
          prefix,
          unit,
          label
        },
        ctaLabel,
        "ctaLink": ${INTERNAL_LINK_PROJECTION}
      },
      _type == "partnerSection" => {
        title,
        partners[] {
          name,
          "logo": logo.asset->url,
          "link": ${INTERNAL_LINK_PROJECTION}
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
          ctaPrimaryLinkType == "internal" => select(
            ctaPrimaryInternalLink->slug.current == "home" => "/" + coalesce(ctaPrimaryInternalLink->language, $language),
            "/" + coalesce(ctaPrimaryInternalLink->language, $language) + "/" + ctaPrimaryInternalLink->slug.current
          ),
          ctaPrimaryLinkType == "external" => ctaPrimaryExternalLink
        ),
        "ctaSecondaryLink": select(
          ctaSecondaryLinkType == "internal" => select(
            ctaSecondaryInternalLink->slug.current == "home" => "/" + coalesce(ctaSecondaryInternalLink->language, $language),
            "/" + coalesce(ctaSecondaryInternalLink->language, $language) + "/" + ctaSecondaryInternalLink->slug.current
          ),
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
      },
      _type == "buyPropertiesSection" => {
        title,
        selectionType,
        "manualIds": manualProperties[]->_id,
        itemsPerPage,
        itemsPerPageMobile,
        orderBy,
        showSold
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
      "link": ${INTERNAL_LINK_PROJECTION}
    },
    mainNav[] {
      label,
      "link": ${INTERNAL_LINK_PROJECTION}
    },
    mobileNav[] {
      label,
      "link": ${INTERNAL_LINK_PROJECTION}
    },
    headerCta {
      label,
      "link": ${INTERNAL_LINK_PROJECTION}
    },
    footer {
      columns[] {
        title,
        subgroups[] {
          title,
          links[] {
            label,
            "link": ${INTERNAL_LINK_PROJECTION}
          }
        }
      },
      legalLinks[] {
        label,
          "link": ${INTERNAL_LINK_PROJECTION}
      },
      copyright,
      disclaimer,
      socialLinks[] {
        label,
        "icon": icon.asset->url,
          "link": ${INTERNAL_LINK_PROJECTION}
      }
    }
  }
`

// ─── Property Detail Query ───
export const PROPERTY_DETAIL_QUERY = groq`
  *[_type == "property" && slug.current == $slug && (language == $language || (!defined(language) && $language == "en"))][0] {
    _id,
    title,
    subtitle,
    "address": coalesce(location.fullAddress, address),
    price,
    status,
    featured,
    "slug": slug.current,
    description,
    location {
      fullAddress,
      city,
      state,
      zip,
      country,
      googleMapsUrl,
      coordinates
    },
    image { asset->{ _id, url, metadata { lqip, dimensions } } },
    secondaryImage { asset->{ _id, url, metadata { lqip, dimensions } } },
    gallery[] {
      asset->{ _id, url, metadata { lqip, dimensions } },
      alt,
      caption
    },
    // Legacy fields
    beds,
    baths,
    sqft,
    // Dynamic meta
    meta[] {
      "metaId": metaKey->_id,
      "shortLabel": coalesce(metaKey->shortLabel[$language], metaKey->shortLabel.en),
      "longLabel": coalesce(metaKey->longLabel[$language], metaKey->longLabel.en),
      "valueType": metaKey->valueType,
      "unit": coalesce(metaKey->unit[$language], metaKey->unit.en),
      "category": coalesce(metaKey->category->title[$language], metaKey->category->title.en),
      "isHighlighted": metaKey->isHighlighted,
      "highlightOrder": metaKey->highlightOrder,
      "icon": metaKey->icon.asset->url,
      numberValue,
      stringValue,
      booleanValue
    },
    "seo": {
      "metaTitle": title + " | Realvilla",
      "metaDescription": pt::text(description),
      "ogImage": image { asset->{ url } }
    },
    "_translations": *[_type == "translation.metadata" && references(^._id)][0].translations[].value->{
      "language": language,
      "slug": slug.current
    }
  }
`

// ─── Property Meta Query ───
// Fetches all meta categories and definitions for building filter UIs
export const PROPERTY_META_QUERY = groq`
  {
    "categories": *[_type == "propertyMetaCategory"] | order(order asc) {
      _id,
      "title": coalesce(title[$language], title.en),
      order
    },
    "definitions": *[_type == "propertyMeta"] {
      _id,
      "shortLabel": coalesce(shortLabel[$language], shortLabel.en),
      "longLabel": coalesce(longLabel[$language], longLabel.en),
      valueType,
      "unit": coalesce(unit[$language], unit.en),
      "icon": icon.asset->url,
      "category": coalesce(category->title[$language], category->title.en),
      isHighlighted,
      highlightOrder,
      filter {
        isFilterable,
        filterType,
        filterOrder,
        rangeMin,
        rangeMax,
        rangeStep,
        "rangePrefix": coalesce(rangePrefix[$language], rangePrefix.en),
        "rangeSuffix": coalesce(rangeSuffix[$language], rangeSuffix.en),
        prefixOptions,
        selectOptions
      }
    }
  }
`

// ─── Properties List Query (for /buy page with filtering) ───
export const PROPERTIES_LIST_QUERY = groq`
  *[_type == "property" && (language == $language || (!defined(language) && $language == "en")) && status != "sold"] | order(_createdAt desc) {
    ${PROPERTY_CARD_FIELDS}
  }
`
