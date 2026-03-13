export interface OrganizationSchemaParams {
  name?: string;
  url?: string;
  description?: string;
  sameAs?: string[];
}

export function generateOrganizationSchema({
  name = 'Bastrop County Conservatives',
  url = 'https://bastropcc.com',
  description = 'Conservative political organization in Bastrop County, Texas.',
  sameAs = [
    'https://www.facebook.com/BastropCountyConservatives',
    'https://www.instagram.com/bastropcountyconservatives/',
    'https://www.youtube.com/bastropcountyconservatives'
  ]
}: OrganizationSchemaParams = {}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'PoliticalParty',
    name,
    url,
    description,
    sameAs
  });
}
