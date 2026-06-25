import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/landing', '/oficina-mecanica', '/cadastro', '/login'],
        disallow: ['/dashboard', '/ordens', '/clientes', '/agenda', '/financeiro', '/estoque', '/relatorios', '/configuracoes', '/admin', '/api/'],
      },
    ],
    sitemap: 'https://www.motoremdia.com.br/sitemap.xml',
  };
}
