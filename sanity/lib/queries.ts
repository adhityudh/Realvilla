import { groq } from 'next-sanity'

export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current == $slug][0] {
    title,
    sections[] {
      _type,
      _key,
      _type == "heroSection" => {
        title,
        subtitle,
        "desktopVideo": desktopVideo.asset->url,
        "mobileVideo": mobileVideo.asset->url,
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
          selectionType == "dynamic" || !selectionType => *[_type == "property" && (showSold == true || status != "sold")] | order(_createdAt desc) [0...10] {
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
        bgImage { asset->{ _id, url, metadata { lqip, dimensions } } },
        mobileBgImage { asset->{ _id, url, metadata { lqip, dimensions } } }
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
      }
    }
  }
`
