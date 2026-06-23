/**
 * Limites e configurações de cada plano do Motor em Dia.
 * Fonte única da verdade — usada em toda a aplicação.
 */
export const PLAN_LIMITS = {
  trial: {
    label: 'Trial Gratuito',
    clientes: 30,
    ordens: Infinity,   // sem limite no trial
    pecas: Infinity,
    backup: false,
    whatsapp: false,
    lembretes: false,
    exportPdf: false,
  },
  starter: {
    label: 'Starter',
    clientes: 10,
    ordens: 20,         // 20 OS por mês
    pecas: 50,
    backup: false,
    whatsapp: false,
    lembretes: false,
    exportPdf: false,
  },
  profissional: {
    label: 'Profissional',
    clientes: 60,
    ordens: Infinity,
    pecas: Infinity,
    backup: true,
    whatsapp: true,
    lembretes: true,
    exportPdf: true,
  },
  premium: {
    label: 'Premium',
    clientes: Infinity,
    ordens: Infinity,
    pecas: Infinity,
    backup: true,
    whatsapp: true,
    lembretes: true,
    exportPdf: true,
  },
} as const;

export type PlanoKey = keyof typeof PLAN_LIMITS;

/** Retorna os limites do plano atual ou do trial caso não reconhecido */
export function getPlanLimits(plano: string) {
  return PLAN_LIMITS[plano as PlanoKey] ?? PLAN_LIMITS.trial;
}

/** Retorna texto amigável do limite. Infinity → 'Ilimitados' */
export function limitLabel(val: number): string {
  return val === Infinity ? 'Ilimitados' : String(val);
}
