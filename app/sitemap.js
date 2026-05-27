export const dynamic = 'force-static';
const BASE_URL = 'https://clearledger.app';
export default function sitemap() {
  return [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/products/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/diagnostic/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/legal/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
