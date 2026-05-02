import { groq } from 'next-sanity'

export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current == $slug][0] {
    title,
    sections[] {
      ...,
      _type == "heroSection" => {
        ...,
        "desktopVideo": desktopVideo.asset->url,
        "mobileVideo": mobileVideo.asset->url,
        "ctas": ctas[] {
          ...,
          "icon": icon.asset->url,
          "link": select(
            linkType == "internal" => "/" + internalLink->slug.current,
            linkType == "external" => externalLink
          )
        }
      },
      _type == "valuationSection" => {
        ...,
        "ctaLink": select(
          linkType == "internal" => "/" + internalLink->slug.current,
          linkType == "external" => externalLink
        )
      },
      _type == "aboutSection" => {
        ...,
        bgImage { ..., asset-> },
        objectImage { ..., asset-> },
        certificates[] { ..., asset-> },
        "socialLinks": socialLinks[] {
          ...,
          "icon": icon.asset->url,
          "link": select(
            linkType == "internal" => "/" + internalLink->slug.current,
            linkType == "external" => externalLink
          )
        }
      },
      _type == "propertiesSection" => {
        ...,
        "properties": select(
          selectionType == "manual" => manualProperties[]-> {
            ...,
            image { ..., asset-> },
            secondaryImage { ..., asset-> }
          },
          selectionType == "dynamic" || !selectionType => *[_type == "property" && (showSold == true || status != "sold")] | order(_createdAt desc) [0...10] {
            ...,
            image { ..., asset-> },
            secondaryImage { ..., asset-> }
          }
        )
      },
      _type == "testimonialsSection" => {
        ...,
        overlapImage { ..., asset-> }
      },
      _type == "contactSection" => {
        ...,
        bgImage { ..., asset-> },
        mobileBgImage { ..., asset-> }
      },
      _type == "partnerSection" => {
        ...,
        partners[] {
          ...,
          "logo": logo.asset->url,
          "link": select(
            linkType == "internal" => "/" + internalLink->slug.current,
            linkType == "external" => externalLink
          )
        }
      },
      _type == "mortgageFAQSection" => {
        ...,
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
