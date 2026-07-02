'use client';

import Link from 'next/link';
import { Lock, BarChart2 } from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <div className="max-w-lg mx-auto mt-20 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
        <BarChart2 className="w-8 h-8 text-orange-500" />
      </div>
      <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-3">
        Relatórios Gerais
      </h1>
      <p className="text-[rgb(var(--muted-foreground))] mb-2">
        Os Relatórios Gerais foram movidos para dentro do <strong>Financeiro</strong> e estão protegidos pela senha administrativa.
      </p>
      <p className="text-sm text-[rgb(var(--muted-foreground))] mb-8 flex items-center justify-center gap-1.5">
        <Lock className="w-3.5 h-3.5" />
        Acesso restrito — apenas administradores
      </p>
      <Link
        href="/financeiro"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
      >
        Ir para o Financeiro →
      </Link>
    </div>
  );
}
