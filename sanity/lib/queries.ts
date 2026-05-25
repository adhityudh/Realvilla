import { groq } from 'next-sanity'

export const SEO_SUBFIELDS = groq`
  metaTitle,
  metaDescription,
  ogImage { asset->{ url } },
  noIndex,
  canonicalUrl
`

export const SEO_FIELDS = groq`
  seo {
    ${SEO_SUBFIELDS}
  }
`

export const getLinkProjection = (
  linkTypeField = "linkType",
  internalLinkField = "internalLink",
  externalLinkField = "externalLink",
  componentLinkField = "componentLink",
  sectionLinkField = "sectionLink",
  internalSectionField = "internalSection"
) => `select(
  ${linkTypeField} == "internal" => select(
    ${internalLinkField}->slug.current == "home" => "/" + coalesce(${internalLinkField}->language, $language) + coalesce("#" + ${internalSectionField}, ""),
    "/" + coalesce(${internalLinkField}->language, $language) + "/" + ${internalLinkField}->slug.current + coalesce("#" + ${internalSectionField}, "")
  ),
  ${linkTypeField} == "external" => ${externalLinkField},
  ${linkTypeField} == "component" => ${componentLinkField},
  ${linkTypeField} == "section" => ${sectionLinkField}
)`

export const INTERNAL_LINK_PROJECTION = getLinkProjection('linkType', 'internalLink', 'externalLink', 'componentLink', 'sectionLink', 'internalSection')

export const SECONDARY_INTERNAL_LINK_PROJECTION = getLinkProjection('secondaryLinkType', 'secondaryInternalLink', 'secondaryExternalLink', 'secondaryComponentLink', 'secondarySectionLink', 'secondaryInternalSection')

// Reusable property card projection (for listings, cards, carousels)
export const PROPERTY_CARD_FIELDS = groq`
  _id,
  language,
  "title": coalesce(title[$language], title.en, title),
  "address": coalesce(
    select(
      defined(location.complexName) && location.complexName != "" => location.streetAddress + ", " + location.complexName + ", " + location.municipality + ", " + location.postalCode,
      location.streetAddress + ", " + location.municipality + ", " + location.postalCode
    ),
    location.streetAddress,
    location.municipality,
    address
  ),
  propertyCode,
  "locationMunicipality": location.municipality,
  "locationPostalCode": location.postalCode,
  "coordinates": select(
    coordinateMethod == "url" && defined(lat) && defined(lng) => { "_type": "geopoint", "lat": lat, "lng": lng },
    defined(location.coordinates) => location.coordinates,
    null
  ),
  price,
  status,
  "slug": propertyCode,
  image { asset->{ _id, url, metadata { lqip, dimensions } } },
  // Gallery for card carousel
  gallery[] {
    _type,
    _type == "galleryGroup" => {
      mediaType,
      items[] {
        _type,
        _type == "image" => {
          asset->{ _id, url, metadata { lqip, dimensions } },
          alt
        }
      }
    },
    _type == "image" => {
      asset->{ _id, url, metadata { lqip, dimensions } },
      alt
    }
  },
  // Legacy fields for backward compat
  beds,
  baths,
  sqft,
  "category": category-> { 
    _id, 
    "title": coalesce(title[$language], title.en), 
    "icon": icon.asset->url, 
    "slug": slug.current,
    highlightedMetas[] {
      "metaId": metaKey->_id,
      hideLabel
    }
  },
  // New dynamic meta (resolved inline)
  meta[] {
    "metaId": metaKey->_id,
    "shortLabel": coalesce(metaKey->shortLabel[$language], metaKey->shortLabel.en),
    "valueType": metaKey->valueType,
    "unit": coalesce(metaKey->unit[$language], metaKey->unit.en),
    "icon": metaKey->icon.asset->url,
    numberValue,
    stringValue,
    booleanValue,
    selectValue,
    selectArrayValue,
    "selectOptions": coalesce(
      metaKey->selectOptions[] { 
        "value": en, 
        "label": coalesce(@[$language], en),
        "icon": icon.asset->url 
      },
      []
    )
  }
`

export const SECTION_PROJECTION = groq`
      _type,
      _key,
      id,
      disableEntranceAnimation,
      disableHeaderEntranceAnimation,
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
        "ctaLink": ${INTERNAL_LINK_PROJECTION},
        showSecondaryCta,
        secondaryCtaLabel,
        "secondaryCtaLink": ${SECONDARY_INTERNAL_LINK_PROJECTION}
      },
      _type == "buyMortgageSimSection" => {
        tagline,
        headline,
        body,
        disclaimerText,
        ctaLabel,
        // Price range
        priceMin,
        priceMax,
        priceStep,
        defaultPrice,
        // Savings range
        savingsMin,
        savingsMax,
        savingsStep,
        defaultSavings,
        minSavingsWarning,
        minSavingsWarningText,
        // Loan term
        loanTermMin,
        loanTermMax,
        defaultLoanTerm,
        // Interest rates
        fixedRate,
        variableRate,
        rateStep,
        rateMin,
        rateMax,
        defaultRateType,
        interestTooltip,
        // Property condition & taxes
        enablePropertyCondition,
        defaultCondition,
        newBuildTaxRate,
        newBuildStampDutyRate,
        resaleTaxRate,
        notaryCost,
        registryCost,
        gestoriaCost,
        valuationCost,
        // Labels
        labelPrice,
        labelSavings,
        labelTerm,
        labelInterestType,
        labelFixed,
        labelVariable,
        labelCondition,
        labelNew,
        labelResale,
        labelMonthlyInstallment,
        labelMortgageAmount,
        labelFinancingPercent,
        labelPropertyPrice,
        labelPurchaseCosts,
        labelTotalPropertyCost,
        labelSavingsResult,
        labelMortgageResult,
        labelInterestResult,
        labelTotalWithMortgage,
        labelViewAmortization,
        // Tooltips
        tooltipMortgageAmount,
        tooltipFinancingPercent,
        tooltipPurchaseCosts,
        // Modal
        modalTitle,
        modalSubtitle,
        modalPurchaseCostsTitle,
        modalMortgageCostsTitle,
        modalLabelNotary,
        modalLabelRegistry,
        modalLabelGestoria,
        modalLabelTax,
        modalLabelValuation,
        modalValuationNote,
        modalTotalLabel,
        modalDisclaimer,
        // Chart
        chartLabelSavings,
        chartLabelMortgage,
        chartLabelInterest,
        // Amortization
        amortTableTitle,
        amortLabelYear,
        amortLabelInstallment,
        amortLabelCapital,
        amortLabelInterest,
        amortLabelBalance,
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
        showSold,
        "ctaLink": ${INTERNAL_LINK_PROJECTION},
        "properties": select(
          selectionType == "manual" => manualProperties[]-> {
            ${PROPERTY_CARD_FIELDS}
          },
          selectionType == "dynamic" || !selectionType => *[_type == "property" && (language == $language || (!defined(language) && $language == "en")) && (^.showSold == true || (status != "sold" && status != "reserved"))] | order(select(status == "reserved" => 1, status == "sold" => 2, 0) asc, _createdAt desc) [0...10] {
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
        subtitle,
        "backgroundImage": backgroundImage.asset->url,
        "backgroundImageMobile": backgroundImageMobile.asset->url,
        mode,
        contactList[] {
          label,
          "icon": icon.asset->{ _id, url },
          "link": externalLink
        },
        formTitle,
        formSubtitle,
        showIntentWhatsApp,
        intentWhatsappMessageTemplate,
        initialStep,
        nextStepAsModal,
        generalTitle,
        generalSubtitle,
        hideGeneralWhatsApp,
        sellTitle,
        sellSubtitle,
        hideSellWhatsApp,
        sellWhatsappMessageTemplate,
        mortgageTitle,
        mortgageSubtitle,
        hideMortgageWhatsApp,
        mortgageWhatsappMessageTemplate,
        presetMessage,
        whatsappMessageTemplate,
        marketData[] {
          value,
          prefix,
          unit,
          label
        }
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
        ctaLabel,
        secondaryCtaLabel,
        faqs[] {
          question,
          answer
        },
        "ctaLink": ${INTERNAL_LINK_PROJECTION},
        "secondaryCtaLink": ${SECONDARY_INTERNAL_LINK_PROJECTION}
      },
      _type == "buyHeroSection" => {
        title,
        "backgroundImage": backgroundImage.asset->url,
        "backgroundImageMobile": backgroundImageMobile.asset->url,
        searchPlaceholder,
        trendingSearches,
        jumpLinks[] {
          label,
          "link": ${INTERNAL_LINK_PROJECTION}
        }
      },
      _type == "sellHeroSection" => {
        title,
        subtitle,
        "backgroundImage": backgroundImage.asset->url,
        "backgroundImageMobile": backgroundImageMobile.asset->url,
        searchPlaceholder,
        modalTitle,
        modalSubtitle,
        hideWhatsApp,
        jumpLinks[] {
          label,
          "link": ${INTERNAL_LINK_PROJECTION}
        }
      },
      _type == "generalHeroSection" => {
        title,
        subtitle,
        desktopLayout,
        primaryButton {
          label,
          "link": ${INTERNAL_LINK_PROJECTION}
        },
        secondaryButton {
          label,
          "link": ${INTERNAL_LINK_PROJECTION}
        },
        "backgroundImage": backgroundImage.asset->url,
        "backgroundImageMobile": backgroundImageMobile.asset->url,
        jumpLinks[] {
          label,
          "link": ${INTERNAL_LINK_PROJECTION}
        }
      },
      _type == "buyPropertiesSection" => {
        title,
        selectionType,
        "manualIds": manualProperties[]->_id,
        itemsPerPage,
        itemsPerPageMobile,
        orderBy,
        showSold,
        showQuickFilters,
        quickFilterSelection,
        "quickFilterCategories": quickFilterCategories[]-> {
          "value": _id,
          "label": coalesce(title[$language], title.en),
          "icon": icon.asset->url
        }
      },
      _type == "buyingProcessSection" => {
        tagline,
        headline,
        intro,
        imageOrder,
        steps[] {
          number,
          title,
          description,
          image { asset->{ _id, url, metadata { lqip, dimensions } } },
          quickFacts[] {
            label,
            value
          }
        }
      },
      _type == "generalProcessSection" => {
        tagline,
        headline,
        intro,
        timelineMode,
        imageOrder,
        steps[] {
          number,
          title,
          description,
          image { asset->{ _id, url, metadata { lqip, dimensions } } },
          icon { asset->{ _id, url } }
        }
      },
      _type == "sellProcessSection" => {
        tagline,
        headline,
        intro,
        imageOrder,
        steps[] {
          number,
          title,
          description,
          image { asset->{ _id, url, metadata { lqip, dimensions } } }
        }
      },
      _type == "documentLedgerSection" => {
        tagline,
        headline,
        intro,
        cta {
          label,
          "link": ${INTERNAL_LINK_PROJECTION}
        },
        items[] {
          number,
          title,
          hint
        }
      },
      _type == "financingCardsSection" => {
        mainDescription,
        backgroundImage { asset-> { _id, url } },
        cta {
          label,
          "link": ${INTERNAL_LINK_PROJECTION}
        },
        cards[] {
          heading,
          copy
        }
      },
      _type == "statsSection" => {
        heading,
        body,
        stats[] {
          prefix,
          value,
          suffix,
          label
        }
      }
`

export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current == $slug && (language == $language || (!defined(language) && $language == "en"))][0] {
    title,
    footerPaddingHigh,
    ${SEO_FIELDS},
    "_translations": *[_type == "translation.metadata" && references(^._id)][0].translations[].value->{
      "language": language,
      "slug": slug.current
    },
    sections[] {
      ${SECTION_PROJECTION}
    },
    pageComponents[] {
      _key,
      _type,
      _type == "contactModalComponent" => {
        "componentId": componentId.current,
        formType,
        title,
        subtitle,
        hideWhatsApp,
        whatsappMessageTemplate,
        presetMessage
      }
    }
  }
`

export const SETTINGS_QUERY = groq`
  *[_type == "settings" && (language == $language || (!defined(language) && $language == "en"))][0] {
    ${SEO_FIELDS},
    "favicon": favicon.asset->url,
    contactWhatsAppNumber,
    mortgageCalculator {
      priceMin,
      priceMax,
      defaultPrice,
      minSavingsPct,
      savingsStep,
      defaultSavingsPct,
      minSavingsWarning,
      minSavingsWarningText,
      loanTermMin,
      loanTermMax,
      defaultLoanTerm,
      fixedRate,
      variableRate,
      rateStep,
      rateMin,
      rateMax,
      defaultRateType,
      interestTooltip,
      enablePropertyCondition,
      defaultCondition,
      newBuildTaxRate,
      newBuildStampDutyRate,
      resaleTaxRate,
      notaryCost,
      registryCost,
      gestoriaCost,
      valuationCost,
      labelPrice,
      labelSavings,
      labelTerm,
      unitYears,
      labelInterestType,
      labelFixed,
      labelVariable,
      labelCondition,
      labelNew,
      labelResale,
      labelMonthlyInstallment,
      labelMortgageAmount,
      labelFinancingPercent,
      labelPropertyPrice,
      labelPurchaseCosts,
      labelTotalPropertyCost,
      labelSavingsResult,
      labelMortgageResult,
      labelInterestResult,
      labelTotalWithMortgage,
      labelViewAmortization,
      tooltipMortgageAmount,
      tooltipFinancingPercent,
      tooltipPurchaseCosts,
      modalTitle,
      modalSubtitle,
      modalPurchaseCostsTitle,
      modalMortgageCostsTitle,
      modalLabelNotary,
      modalLabelRegistry,
      modalLabelGestoria,
      modalLabelTax,
      modalLabelValuation,
      modalValuationNote,
      modalTotalLabel,
      modalDisclaimer,
      chartLabelSavings,
      chartLabelMortgage,
      chartLabelInterest,
      amortTableTitle,
      amortTableSubtitle,
      amortLabelYear,
      amortLabelInstallment,
      amortLabelCapital,
      amortLabelInterest,
      amortLabelBalance
    },
    contactPresetMessageTemplate,
    propertyContactPresetMessage,
    "propertiesPageSeo": propertiesPageSeo {
      ${SEO_SUBFIELDS}
    },
    \"propertyDetailSections\": propertyDetailSections[] {
      ${SECTION_PROJECTION}
    },
    propertyDetailFooterPaddingHigh,
    propertyOfferEnabled,
    propertyOfferDepositAmount,
    propertyOfferConditionsTitle,
    propertyOfferConditionsIntro,
    propertyOfferConditionsTerms,
    propertyOfferConditionsAccept,
    propertyOfferPriceHelper,
    propertyOfferConditionsHelper,
    filterSidebar,
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
  *[_type == "property" && propertyCode == $slug && (language == $language || (!defined(language) && $language == "en"))][0] {
    _id,
    ${SEO_FIELDS},
    title,
    subtitle,
    "address": coalesce(
      select(
        defined(location.complexName) && location.complexName != "" => location.streetAddress + ", " + location.complexName + ", " + location.municipality + ", " + location.postalCode,
        location.streetAddress + ", " + location.municipality + ", " + location.postalCode
      ),
      location.streetAddress,
      location.municipality,
      address
    ),
    propertyCode,
    price,
    status,
    "slug": propertyCode,
    _updatedAt,
    description,
    location {
      streetAddress,
      complexName,
      municipality,
      postalCode,
      coordinateMethod,
      "coordinates": select(
        coordinateMethod == "url" && defined(lat) && defined(lng) => { "_type": "geopoint", "lat": lat, "lng": lng },
        defined(coordinates) => coordinates,
        null
      )
    },
    image { asset->{ _id, url, metadata { lqip, dimensions } } },
    secondaryImage { asset->{ _id, url, metadata { lqip, dimensions } } },
    gallery[] {
      _type,
      _type == "galleryGroup" => {
        title,
        mediaType,
        floorfyUrl,
        thumbnail { asset->{ _id, url, metadata { lqip, dimensions } } },
        items[] {
          _type,
          _type == "image" => {
            asset->{ _id, url, metadata { lqip, dimensions } },
            alt,
            caption
          },
          _type == "videoItem" => {
            url,
            thumbnail { asset->{ _id, url, metadata { lqip, dimensions } } },
            alt
          }
        }
      },
      _type == "image" => {
        asset->{ _id, url, metadata { lqip, dimensions } },
        alt,
        caption
      },
      _type == "videoItem" => {
        url,
        thumbnail { asset->{ _id, url, metadata { lqip, dimensions } } },
        alt
      }
    },
    // Legacy fields
    beds,
    baths,
    sqft,
    "category": category-> { 
      _id, 
      "title": coalesce(title[$language], title.en), 
      "icon": icon.asset->url, 
      "slug": slug.current,
      highlightedMetas[] {
        "metaId": metaKey->_id,
        hideLabel
      }
    },
    // Dynamic meta
    meta[] {
      "metaId": metaKey->_id,
      "shortLabel": coalesce(metaKey->shortLabel[$language], metaKey->shortLabel.en),
      "longLabel": coalesce(metaKey->longLabel[$language], metaKey->longLabel.en),
      "valueType": metaKey->valueType,
      "unit": coalesce(metaKey->unit[$language], metaKey->unit.en),
      "category": coalesce(metaKey->category->title[$language], metaKey->category->title.en),
      "categoryOrder": metaKey->category->filterGroupDisplayOrder,
      "icon": metaKey->icon.asset->url,
      numberValue,
      stringValue,
      booleanValue,
      selectValue,
      selectArrayValue,
      "selectOptions": coalesce(
        metaKey->selectOptions[] { 
          "value": en, 
          "label": coalesce(@[$language], en),
          "icon": icon.asset->url 
        },
        []
      )
    },
    "seo": {
      "metaTitle": title + " | REALVILLA",
      "metaDescription": pt::text(description),
      "ogImage": image { asset->{ url } }
    },
    "_translations": *[_type == "translation.metadata" && references(^._id)][0].translations[].value->{
      "language": language,
      "slug": select(
        language == "es" => "propiedades/" + propertyCode,
        "properties/" + propertyCode
      )
    }
  }
`

// ─── Property Meta Query ───
// Fetches all meta categories and definitions for building filter UIs
export const PROPERTY_META_QUERY = groq`
  {
    "maxPrice": math::max(*[_type == "property"].price),
    "categories": *[_type == "propertyMetaCategory"] | order(filterGroupDisplayOrder asc) {
      _id,
      "title": coalesce(title[$language], title.en),
      filterGroupDisplayOrder,
      filterSortOrder,
      ungroupFilters
    },
    "standaloneCategories": *[_type == "propertyCategory"] | order(order asc) {
      _id,
      "label": coalesce(title[$language], title.en),
      "icon": icon.asset->url,
      order
    },
    "definitions": *[_type == "propertyMeta"] {
      _id,
      "shortLabel": coalesce(shortLabel[$language], shortLabel.en),
      "longLabel": coalesce(longLabel[$language], longLabel.en),
      valueType,
      selectDisplayType,
      showOnSearchModal,
      "unit": coalesce(unit[$language], unit.en),
      "icon": icon.asset->url,
      "category": coalesce(category->title[$language], category->title.en),
      isHighlighted,
      highlightOrder,
      hideLabelOnHighlight,
      "children": children[]._ref,
      "autoMax": math::max(*[_type == "property"].meta[metaKey._ref == ^._id || metaKey._ref == "drafts." + ^._id || ^._id == "drafts." + metaKey._ref].numberValue),
      filter {
        isFilterable,
        filterType,
        filterOrder,
        isDoubleSlider,
        rangeMin,
        useAutomaticMax,
        rangeMax,
        rangeStep,
        "rangePrefix": coalesce(rangePrefix[$language], rangePrefix.en),
        "rangeSuffix": coalesce(rangeSuffix[$language], rangeSuffix.en),
        prefixOptions[] {
          label,
          isAny,
          operator,
          value
        },
        "selectOptions": coalesce(
          select(^.valueType == "select" => ^.selectOptions, selectOptions)[] {
            "value": en,
            "label": coalesce(@[$language], en),
            "icon": icon.asset->url
          },
          []
        )
      }
    }
  }
`

// ─── Properties List Query (for /buy page with filtering) ───
export const PROPERTIES_LIST_QUERY = groq`
  *[_type == "property" && (language == $language || (!defined(language) && $language == "en"))] | order(select(status == "reserved" => 1, status == "sold" => 2, 0) asc, _createdAt desc) {
    ${PROPERTY_CARD_FIELDS}
  }
`

export const INITIAL_PROPERTIES_QUERY = groq`
  {
    "items": *[_type == "property" && (language == $language || (!defined(language) && $language == "en"))] | order(select(status == "reserved" => 1, status == "sold" => 2, 0) asc, _createdAt desc) [0...12] {
      ${PROPERTY_CARD_FIELDS}
    },
    "total": count(*[_type == "property" && (language == $language || (!defined(language) && $language == "en"))])
  }
`
