import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software para Oficina Mecânica | Lembretes Automáticos de Revisão | Motor em Dia',
  description: 'Transforme clientes ocasionais em clientes recorrentes com lembretes automáticos de manutenção. Teste grátis por 14 dias. Sem cartão de crédito.',
  keywords: [
    'software para oficina mecânica',
    'sistema para oficina mecânica',
    'gestão de oficina mecânica',
    'controle de manutenção automotiva',
    'programa para oficina mecânica',
    'gestão de revisões automotivas',
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
    title: 'Software para Oficina Mecânica | Motor em Dia',
    description: 'Transforme clientes ocasionais em clientes recorrentes com lembretes automáticos de manutenção. Teste grátis por 14 dias.',
    images: [{
      url: 'https://www.motoremdia.com.br/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Motor em Dia - Software para Oficina Mecânica',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software para Oficina Mecânica | Motor em Dia',
    description: 'Transforme clientes ocasionais em clientes recorrentes com lembretes automáticos.',
    images: ['https://www.motoremdia.com.br/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: 'https://www.motoremdia.com.br/landing',
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
