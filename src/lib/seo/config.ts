/**
 * SEO Configuration for X Open Network
 * 
 * This file contains all SEO-related configurations including:
 * - Meta tags templates
 * - Open Graph configurations
 * - Schema.org structured data
 * - Sitemap generation settings
 */

// Base SEO Configuration
export const seoConfig = {
  // Site Information
  siteName: "X Open Network",
  siteDescription: "Connect with talented creators for music production, video editing, graphic design, and more. Book verified professionals for your creative projects.",
  siteUrl: process.env.NODE_ENV === 'production' 
    ? 'https://x-open-network.vercel.app' 
    : 'http://localhost:3000',
  
  // Default Meta Tags
  defaultTitle: "X Open Network - Connect with Creative Professionals",
  titleTemplate: "%s | X Open Network",
  defaultDescription: "Discover and book talented creators for your projects. From music producers to video editors, find verified professionals ready to bring your vision to life.",
  
  // Social Media
  social: {
    twitter: "@xopennetwork",
    facebook: "xopennetwork",
    instagram: "@xopennetwork",
    linkedin: "company/x-open-network",
    youtube: "@xopennetwork"
  },
  
  // Open Graph Defaults
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'X Open Network',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'X Open Network - Connect with Creative Professionals'
      }
    ]
  },
  
  // Twitter Card Defaults
  twitter: {
    card: 'summary_large_image',
    site: '@xopennetwork',
    creator: '@xopennetwork'
  }
};

// Page-specific SEO configurations
export const pageConfigs = {
  home: {
    title: "X Open Network - Connect with Creative Professionals",
    description: "Find and book talented creators for music production, video editing, graphic design, and more. Join thousands of clients and creators on the leading creative platform.",
    keywords: ["creative professionals", "freelance creators", "music producers", "video editors", "graphic designers", "creative marketplace", "book creators", "creative services"],
    openGraph: {
      title: "X Open Network - Connect with Creative Professionals",
      description: "Find and book talented creators for music production, video editing, graphic design, and more.",
      type: "website"
    }
  },
  
  search: {
    title: "Search Creative Professionals",
    description: "Browse thousands of verified creators across music, video, design, and more. Find the perfect professional for your project with advanced filtering and reviews.",
    keywords: ["search creators", "find freelancers", "creative professionals directory", "hire creators", "book services"],
    openGraph: {
      title: "Search Creative Professionals - X Open Network",
      description: "Browse thousands of verified creators across music, video, design, and more."
    }
  },
  
  creatorProfile: {
    titleTemplate: "%s - Creative Professional | X Open Network",
    descriptionTemplate: "Book %s for your next project. View portfolio, read reviews, and schedule sessions with this verified creative professional.",
    keywords: ["creator profile", "freelance professional", "book creator", "creative services", "portfolio"],
    openGraph: {
      type: "profile"
    }
  },
  
  pricing: {
    title: "Pricing - Transparent Rates for Creative Services",
    description: "Discover competitive rates for creative services. Our platform connects you with professionals at every budget level with transparent, upfront pricing.",
    keywords: ["pricing", "creative services cost", "freelance rates", "booking fees", "transparent pricing"],
    openGraph: {
      title: "Pricing - Transparent Rates for Creative Services",
      description: "Discover competitive rates for creative services. Transparent, upfront pricing for all creative professionals."
    }
  },
  
  about: {
    title: "About X Open Network - Connecting Creativity",
    description: "Learn about our mission to connect talented creators with clients worldwide. Discover how we're building the future of creative collaboration.",
    keywords: ["about us", "creative platform", "company mission", "creative collaboration", "freelance marketplace"],
    openGraph: {
      title: "About X Open Network - Connecting Creativity",
      description: "Learn about our mission to connect talented creators with clients worldwide."
    }
  },
  
  categories: {
    music: {
      title: "Music Producers & Audio Professionals",
      description: "Find top music producers, sound engineers, and audio professionals. From beat making to mixing and mastering, connect with verified music creators.",
      keywords: ["music producers", "beat makers", "sound engineers", "audio professionals", "music production", "mixing", "mastering"]
    },
    video: {
      title: "Video Editors & Motion Graphics Artists",
      description: "Hire skilled video editors, motion graphics artists, and videographers. From YouTube content to commercials, find video professionals for any project.",
      keywords: ["video editors", "motion graphics", "videographers", "video production", "YouTube editors", "commercial video"]
    },
    design: {
      title: "Graphic Designers & Visual Artists",
      description: "Connect with talented graphic designers, illustrators, and visual artists. Logo design, branding, digital art, and more from verified professionals.",
      keywords: ["graphic designers", "logo design", "branding", "visual artists", "digital art", "illustration"]
    }
  }
};

// Structured Data Templates
export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    SCHEMA_FIELDS.USER.NAME: "X Open Network",
    "url": seoConfig.siteUrl,
    "logo": `${seoConfig.siteUrl}/images/logo.png`,
    SCHEMA_FIELDS.SERVICE.DESCRIPTION: seoConfig.defaultDescription,
    "sameAs": [
      `https://twitter.com/${seoConfig.social.twitter.replace('@', '')}`,
      `https://facebook.com/${seoConfig.social.facebook}`,
      `https://instagram.com/${seoConfig.social.instagram.replace('@', '')}`,
      `https://linkedin.com/company/${seoConfig.social.linkedin.replace('company/', '')}`
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-0123",
      "contactType": "customer service",
      SCHEMA_FIELDS.USER.EMAIL: "support@x-open-network.com",
      "availableLanguage": "English"
    }
  },
  
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    SCHEMA_FIELDS.USER.NAME: seoConfig.siteName,
    "url": seoConfig.siteUrl,
    SCHEMA_FIELDS.SERVICE.DESCRIPTION: seoConfig.defaultDescription,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${seoConfig.siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  },
  
  service: {
    "@context": "https://schema.org",
    "@type": "Service",
    SCHEMA_FIELDS.USER.NAME: "Creative Professional Marketplace",
    SCHEMA_FIELDS.SERVICE.DESCRIPTION: "Platform connecting clients with verified creative professionals including music producers, video editors, and graphic designers",
    "provider": {
      "@type": "Organization",
      SCHEMA_FIELDS.USER.NAME: "X Open Network"
    },
    "serviceType": "Creative Services Marketplace",
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      SCHEMA_FIELDS.USER.NAME: "Creative Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            SCHEMA_FIELDS.USER.NAME: "Music Production Services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            SCHEMA_FIELDS.USER.NAME: "Video Editing Services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            SCHEMA_FIELDS.USER.NAME: "Graphic Design Services"
          }
        }
      ]
    }
  },
  
  // Profile structured data template
  generatePersonSchema: (creator) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    SCHEMA_FIELDS.USER.NAME: creator.name,
    SCHEMA_FIELDS.SERVICE.DESCRIPTION: creator.bio,
    "url": `${seoConfig.siteUrl}/profile/${creator.uid}`,
    "image": creator.photoURL,
    "jobTitle": creator.primarySkill,
    "worksFor": {
      "@type": "Organization",
      SCHEMA_FIELDS.USER.NAME: "X Open Network"
    },
    "knowsAbout": creator.skills,
    "aggregateRating": creator.rating ? {
      "@type": "AggregateRating",
      "ratingValue": creator.rating.average,
      SCHEMA_FIELDS.USER.REVIEW_COUNT: creator.rating.count,
      "bestRating": 5,
      "worstRating": 1
    } : undefined
  }),
  
  // Review structured data template
  generateReviewSchema: (review, creator) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": 5,
      "worstRating": 1
    },
    "author": {
      "@type": "Person",
      SCHEMA_FIELDS.USER.NAME: review.clientName
    },
    "reviewBody": review.comment,
    "itemReviewed": {
      "@type": "Person",
      SCHEMA_FIELDS.USER.NAME: creator.name
    },
    "datePublished": review.createdAt
  })
};

// Sitemap configuration
export const sitemapConfig = {
  // Static pages
  staticPages: [
    {
      url: '/',
      changefreq: 'daily',
      priority: 1.0
    },
    {
      url: '/search',
      changefreq: 'daily',
      priority: 0.9
    },
    {
      url: '/pricing',
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      url: '/about',
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      url: '/terms',
      changefreq: 'monthly',
      priority: 0.5
    },
    {
      url: '/privacy',
      changefreq: 'monthly',
      priority: 0.5
    }
  ],
  
  // Dynamic page configurations
  dynamicPages: {
    creators: {
      changefreq: 'weekly',
      priority: 0.8,
      pathTemplate: '/profile'
    },
    categories: {
      changefreq: 'weekly',
      priority: 0.7,
      pathTemplate: '/search'
    }
  }
};

// Meta tag generation helpers
export const generateMetaTags = (pageConfig, dynamicData = {}) => {
  const title = dynamicData.title || pageConfig.title || seoConfig.defaultTitle;
  const description = dynamicData.description || pageConfig.description || seoConfig.defaultDescription;
  const keywords = pageConfig.keywords || [];
  const ogImage = dynamicData.image || seoConfig.openGraph.images[0].url;
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: dynamicData.url || seoConfig.siteUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      type: pageConfig.openGraph?.type || 'website',
      siteName: seoConfig.siteName
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      site: seoConfig.twitter.site
    }
  };
};

// Robots.txt configuration
export const robotsConfig = {
  rules: [
    {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api',
        '/dashboard/private',
        '/_next',
        '/temp',
        '*.json$'
      ]
    }
  ],
  sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  host: seoConfig.siteUrl
};

export default seoConfig;