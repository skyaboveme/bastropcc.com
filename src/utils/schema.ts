export interface OrganizationSchemaParams {
  name?: string;
  url?: string;
  description?: string;
  sameAs?: string[];
}

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
