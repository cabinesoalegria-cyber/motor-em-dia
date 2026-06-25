import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.motoremdia.com.br';
  const now = new Date();
  return [
    { url: `${base}/landing`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/oficina-mecanica`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/cadastro`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
