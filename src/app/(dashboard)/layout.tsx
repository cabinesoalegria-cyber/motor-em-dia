'use client';

import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

function TrialBanner() {
  const { empresa, isTrialExpired } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !empresa) return null;

  if (isTrialExpired) {
    return (
      <div className="bg-red-500 text-white text-xs px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            <strong>Periodo de teste encerrado.</strong> Assine um plano para continuar usando o Motor em Dia.
          </span>
        </div>
        <Link href="/planos" className="bg-white text-red-500 px-3 py-0.5 rounded-lg font-semibold text-xs hover:bg-red-50 transition-colors flex-shrink-0">
          Ver Planos
        </Link>
      </div>
    );
  }

  if (empresa.plano === 'trial' && empresa.trialExpiraEm) {
    const daysLeft = Math.ceil((new Date(empresa.trialExpiraEm).getTime() - Date.now()) / 86400000);
    if (daysLeft > 7) return null; // Only show when 7 days or less remain
    return (
      <div className="bg-orange-500/15 border-b border-orange-500/20 text-xs px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            <strong>{daysLeft} dia{daysLeft !== 1 ? 's' : ''}</strong> restante{daysLeft !== 1 ? 's' : ''} no seu periodo gratuito.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/planos" className="text-orange-500 font-semibold hover:underline text-xs flex-shrink-0">Assinar plano</Link>
          <button onClick={() => setDismissed(true)} className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--background))]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <TrialBanner />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
