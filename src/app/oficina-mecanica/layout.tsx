import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sistema para Oficina Mecânica | Aumente o Retorno de Clientes | Motor em Dia',
  description: 'Nunca mais perca uma revisão por esquecimento. O Motor em Dia avisa quando cada cliente precisa retornar. Teste grátis por 14 dias. Sem cartão.',
  keywords: [
    'software para oficina mecânica',
    'sistema para oficina mecânica',
    'gestão de oficina mecânica',
    'controle de manutenção automotiva',
    'programa para oficina mecânica',
    'gestão de revisões automotivas',
    'retorno de clientes oficina',
    'faturamento oficina mecânica',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.motoremdia.com.br/oficina-mecanica',
    siteName: 'Motor em Dia',
    title: 'Sistema para Oficina Mecânica | Motor em Dia',
    description: 'Nunca mais perca uma revisão por esquecimento. Lembretes automáticos de manutenção para sua oficina.',
    images: [{ url: 'https://www.motoremdia.com.br/og-image.png', width: 1200, height: 630, alt: 'Motor em Dia' }],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.motoremdia.com.br/oficina-mecanica' },
};

export default function OficinaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
