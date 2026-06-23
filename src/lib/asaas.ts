/**
 * Asaas API helper — wraps fetch with auth header and base URL.
 * All API calls are server-side only (uses ASAAAS_API_KEY env var).
 */
const BASE = process.env.ASAAAS_BASE_URL ?? 'https://sandbox.asaas.com/api/v3';
const KEY  = process.env.ASAAAS_API_KEY ?? '';

export async function asaasGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { access_token: KEY, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Asaas GET ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function asaasPost(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { access_token: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Asaas POST ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function asaasDelete(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { access_token: KEY },
  });
  if (!res.ok) throw new Error(`Asaas DELETE ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Planos configurados */
export const PLANOS = {
  starter: {
    nome: 'Starter',
    valor: 49.00,
    limiteClientes: 10,
    descricao: 'Ideal para oficinas pequenas',
    cor: 'emerald',
  },
  profissional: {
    nome: 'Profissional',
    valor: 99.00,
    limiteClientes: 60,
    descricao: 'Para oficinas em crescimento',
    cor: 'blue',
  },
  premium: {
    nome: 'Premium',
    valor: 149.00,
    limiteClientes: Infinity,
    descricao: 'Clientes ilimitados',
    cor: 'purple',
  },
} as const;

export type PlanoKey = keyof typeof PLANOS;
