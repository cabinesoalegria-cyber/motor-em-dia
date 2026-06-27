import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './lovable.css';

/* Plus Jakarta Sans — igual ao Lovable (font-display) */
const pjs = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-pjs',
});

export const metadata: Metadata = {
  title: 'Motor em Dia — Nunca mais perca uma revisão por esquecimento',
  description:
    'SaaS para oficinas mecânicas: lembretes automáticos, OS digitais, histórico de veículos e dashboard gerencial. Teste grátis por 14 dias.',
  keywords: [
    'software para oficina mecânica',
    'sistema para oficina mecânica',
    'gestão de oficina mecânica',
    'controle de manutenção automotiva',
    'programa para oficina mecânica',
    'lembretes automáticos manutenção',
    'ordem de serviço oficina',
    'motor em dia',
  ],
  authors: [{ name: 'Motor em Dia' }],
  creator: 'Motor em Dia',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.motoremdia.com.br/landing',
    siteName: 'Motor em Dia',
    title: 'Motor em Dia — Gestão para oficinas mecânicas',
    description:
      'Transforme cada serviço em cliente recorrente com lembretes automáticos e ordens de serviço digitais.',
    images: [{ url: 'https://www.motoremdia.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motor em Dia — Software para Oficina Mecânica',
    description: 'Transforme clientes ocasionais em clientes recorrentes com lembretes automáticos.',
    images: ['https://www.motoremdia.com.br/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: 'https://www.motoremdia.com.br/landing' },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  /* A variável CSS --font-pjs fica disponível apenas dentro desta árvore */
  return <div className={pjs.variable}>{children}</div>;
}
