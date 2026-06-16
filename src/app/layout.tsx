import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { DynamicFavicon } from '@/components/dynamic-favicon';
import { AuthProvider } from '@/lib/auth-context';
import { SupabaseStoreProvider } from '@/lib/supabase-store';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Motor em Dia',
  description:
    'O sistema mais simples do Brasil para pequenas oficinas mecânicas. Controle ordens de serviço, histórico de veículos, financeiro e agenda em um só lugar.',
  keywords: 'oficina mecânica, ordem de serviço, sistema para oficina, gestão de oficina',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <DynamicFavicon />
          <AuthProvider>
            <SupabaseStoreProvider>
              {children}
              <Toaster richColors position="top-right" />
            </SupabaseStoreProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
