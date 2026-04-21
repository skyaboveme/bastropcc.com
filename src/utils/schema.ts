// ═══════════════════════════════════════════════════════════════
// JSON-LD Schema Generators for AI & Search Engine Visibility
// ═══════════════════════════════════════════════════════════════

export interface OrganizationSchemaParams {
  name?: string;
  url?: string;
  description?: string;
  sameAs?: string[];
}

/**
 * Primary Organization schema — injected globally via SEO.astro
 * Uses NGO type (closest match for a PAC in Schema.org)
 */
export function generateOrganizationSchema({
  name = 'Bastrop County Conservatives',
  url = 'https://bastropcc.com',
  description = 'Conservative political action committee (PAC) in Bastrop County, Texas. BCC identifies, endorses, and supports conservative candidates at the local level, upholding family values, faith, and traditions.',
  sameAs = [
    'https://www.facebook.com/BastropCountyConservatives',
    'https://www.instagram.com/bastropcountyconservatives/',
    'https://www.youtube.com/bastropcountyconservatives'
  ]
}: OrganizationSchemaParams = {}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    alternateName: 'BCC',
    url,
    description,
    logo: 'https://bastropcc.com/Assets/cropped-BCC-Final-Logo-1-w-Transparent-Background.png',
    image: 'https://bastropcc.com/images/og-default.jpg',
    foundingLocation: {
      '@type': 'Place',
      name: 'Bastrop County, Texas'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bastrop',
      addressRegion: 'TX',
      addressCountry: 'US'
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Bastrop County, Texas'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'General Inquiry',
      email: 'info@bastropcc.com',
      url: 'https://bastropcc.com/contact'
    },
    knowsAbout: [
      'Local politics',
      'Conservative values',
      'Voter engagement',
      'Candidate endorsements',
      'Bastrop County government',
      'Texas Republican politics'
    ],
    sameAs
  });
}

/**
 * WebSite schema with SearchAction — for homepage only
 * Tells AI agents this is a structured, authoritative site
 */
export function generateWebSiteSchema() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bastrop County Conservatives',
    alternateName: 'BCC',
    url: 'https://bastropcc.com',
    description: 'Official website of Bastrop County Conservatives PAC — endorsements, elected officials, voter information, and conservative events in Bastrop County, Texas.',
    publisher: {
      '@type': 'Organization',
      name: 'Bastrop County Conservatives',
      url: 'https://bastropcc.com'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://bastropcc.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  });
}

/**
 * BreadcrumbList schema — enhances page hierarchy visibility
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  });
}

// ═══════════════════════════════════════════════════════════════
// EVENT SCHEMAS
// ═══════════════════════════════════════════════════════════════

export interface EventSchemaParams {
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  description: string;
  url?: string;
  organizer?: string;
}

/**
 * Individual Event schema
 */
export function generateEventSchema(event: EventSchemaParams) {
  return {
    '@type': 'Event',
    name: event.name,
    startDate: event.startDate,
    ...(event.endDate && { endDate: event.endDate }),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'TX',
        addressCountry: 'US'
      }
    },
    description: event.description,
    ...(event.url && { url: event.url }),
    organizer: {
      '@type': 'Organization',
      name: event.organizer || 'Bastrop County Conservatives',
      url: 'https://bastropcc.com'
    }
  };
}

/**
 * Multiple events as an ItemList
 */
export function generateEventsListSchema(events: EventSchemaParams[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Conservative Coalition Calendar — Central Texas Events',
    description: 'Upcoming conservative and Republican events across Bastrop, Travis, Hays, Fayette, and Williamson counties in Central Texas.',
    numberOfItems: events.length,
    itemListElement: events.map((event, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: generateEventSchema(event)
    }))
  });
}

// ═══════════════════════════════════════════════════════════════
// PERSON / ELECTED OFFICIAL SCHEMAS
// ═══════════════════════════════════════════════════════════════

export interface OfficialSchemaParams {
  name: string;
  jobTitle: string;
  affiliation?: string;
  url?: string;
  telephone?: string;
  worksFor?: string;
}

/**
 * Generate a list of GovernmentOfficials for the elected officials page
 */
export function generateElectedOfficialsSchema(officials: OfficialSchemaParams[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bastrop County Elected Officials Directory',
    description: 'Complete directory of elected officials serving Bastrop County, Texas — including county, state, and federal representatives with contact information.',
    numberOfItems: officials.length,
    itemListElement: officials.map((official, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Person',
        name: official.name,
        jobTitle: official.jobTitle,
        ...(official.affiliation && {
          affiliation: {
            '@type': 'PoliticalParty',
            name: official.affiliation
          }
        }),
        ...(official.url && { url: official.url }),
        ...(official.telephone && { telephone: official.telephone }),
        ...(official.worksFor && {
          worksFor: {
            '@type': 'GovernmentOrganization',
            name: official.worksFor
          }
        })
      }
    }))
  });
}

// ═══════════════════════════════════════════════════════════════
// ENDORSEMENT SCHEMAS
// ═══════════════════════════════════════════════════════════════

export interface EndorsementSchemaParams {
  name: string;
  jobTitle: string;
  description?: string;
  url?: string;
}

/**
 * Enhanced endorsement list with VoteAction semantics
 */
export function generateEndorsementsSchema(candidates: EndorsementSchemaParams[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bastrop County Conservatives 2026 Official Endorsements',
    description: 'Candidates officially endorsed by Bastrop County Conservatives PAC for the 2026 election cycle. Each candidate was vetted and approved by BCC membership based on alignment with 15 core conservative values.',
    url: 'https://bastropcc.com/endorsements',
    numberOfItems: candidates.length,
    itemListElement: candidates.map((candidate, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Person',
        name: candidate.name,
        jobTitle: candidate.jobTitle,
        ...(candidate.description && { description: candidate.description }),
        ...(candidate.url && { url: candidate.url }),
        affiliation: {
          '@type': 'PoliticalParty',
          name: 'Republican Party'
        }
      }
    }))
  });
}

// ═══════════════════════════════════════════════════════════════
// FAQ SCHEMA (for About page or FAQ page)
// ═══════════════════════════════════════════════════════════════

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(items: FAQItem[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  });
}
