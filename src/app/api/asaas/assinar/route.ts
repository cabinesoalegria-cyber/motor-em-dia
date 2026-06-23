import { NextRequest, NextResponse } from 'next/server';
import { asaasPost, asaasGet, PLANOS, PlanoKey } from '@/lib/asaas';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (service role not needed; use anon + RLS bypass via service role if available)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * POST /api/asaas/assinar
 * Body: { empresaId, plano, nome, email, cpfCnpj? }
 *
 * Flow:
 *  1. Cria (ou reutiliza) cliente no Asaas
 *  2. Cria assinatura mensal com trial de 14 dias
 *  3. Retorna a URL de pagamento da 1ª fatura (após o trial)
 */
export async function POST(req: NextRequest) {
  try {
    const { empresaId, plano, nome, email, cpfCnpj } = await req.json();

    if (!empresaId || !plano || !nome || !email) {
      return NextResponse.json({ error: 'Campos obrigatórios: empresaId, plano, nome, email' }, { status: 400 });
    }

    const planoConfig = PLANOS[plano as PlanoKey];
    if (!planoConfig) {
      return NextResponse.json({ error: `Plano inválido: ${plano}` }, { status: 400 });
    }

    // 1. Buscar empresa para ver se já tem asaas_customer_id
    const { data: empresa } = await supabaseAdmin
      .from('empresas')
      .select('asaas_customer_id, assinatura_id')
      .eq('id', empresaId)
      .single();

    let customerId: string = empresa?.asaas_customer_id ?? '';

    // 2. Criar cliente no Asaas se ainda não existe
    if (!customerId) {
      const customerBody: Record<string, string> = { name: nome, email };
      if (cpfCnpj) customerBody.cpfCnpj = cpfCnpj.replace(/\D/g, '');

      const customer = await asaasPost('/customers', customerBody);
      customerId = customer.id;

      // Salvar o customer ID na empresa
      await supabaseAdmin
        .from('empresas')
        .update({ asaas_customer_id: customerId })
        .eq('id', empresaId);
    }

    // 3. Calcular data de início (após trial de 14 dias)
    const trialDays = 14;
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + trialDays);
    const dueDateStr = nextDueDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // 4. Criar assinatura mensal
    const subscription = await asaasPost('/subscriptions', {
      customer: customerId,
      billingType: 'UNDEFINED', // cliente escolhe forma ao pagar
      value: planoConfig.valor,
      nextDueDate: dueDateStr,
      cycle: 'MONTHLY',
      description: `Motor em Dia — Plano ${planoConfig.nome}`,
      externalReference: empresaId,
    });

    const subscriptionId: string = subscription.id;

    // 5. Buscar a primeira fatura gerada para obter a URL de pagamento
    let invoiceUrl: string | null = null;
    try {
      const payments = await asaasGet(`/subscriptions/${subscriptionId}/payments`);
      if (payments?.data?.length > 0) {
        invoiceUrl = payments.data[0].invoiceUrl ?? payments.data[0].bankSlipUrl ?? null;
      }
    } catch {
      // Se não conseguir a fatura, ainda retorna sucesso (usuário pode pagar depois)
    }

    // 6. Atualizar empresa no Supabase
    const trialExpira = new Date();
    trialExpira.setDate(trialExpira.getDate() + trialDays);

    await supabaseAdmin
      .from('empresas')
      .update({
        assinatura_id: subscriptionId,
        plano: plano,
        status: 'trial', // começa em trial, webhook atualiza para 'ativo' após pagamento
        trial_expira_em: trialExpira.toISOString(),
        plano_expira_em: null,
      })
      .eq('id', empresaId);

    return NextResponse.json({
      ok: true,
      subscriptionId,
      invoiceUrl,
      trialExpira: trialExpira.toISOString(),
      plano: planoConfig.nome,
      valor: planoConfig.valor,
    });

  } catch (err: any) {
    console.error('[Asaas/assinar]', err);
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 });
  }
}
