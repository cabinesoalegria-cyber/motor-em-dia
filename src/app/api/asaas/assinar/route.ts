import { NextRequest, NextResponse } from 'next/server';
import { asaasPost, asaasGet, asaasDelete, PLANOS, PlanoKey } from '@/lib/asaas';
import { createClient } from '@supabase/supabase-js';

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
 *  2. Se já tem assinatura ativa → cancela a antiga (upgrade/troca)
 *  3. Cria nova assinatura mensal
 *  4. Retorna URL de pagamento da 1ª fatura
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

    // 1. Buscar empresa
    const { data: empresa } = await supabaseAdmin
      .from('empresas')
      .select('asaas_customer_id, assinatura_id, plano')
      .eq('id', empresaId)
      .single();

    let customerId: string = empresa?.asaas_customer_id ?? '';
    const assinaturaAntigaId: string = empresa?.assinatura_id ?? '';
    const planoAntigo: string = empresa?.plano ?? 'trial';

    // 2. Criar cliente no Asaas se ainda não existe
    if (!customerId) {
      const customerBody: Record<string, string> = { name: nome, email };
      if (cpfCnpj) customerBody.cpfCnpj = cpfCnpj.replace(/\D/g, '');

      const customer = await asaasPost('/customers', customerBody);
      customerId = customer.id;

      await supabaseAdmin
        .from('empresas')
        .update({ asaas_customer_id: customerId })
        .eq('id', empresaId);
    }

    // 3. Cancelar assinatura antiga se existir (upgrade/troca de plano)
    if (assinaturaAntigaId && planoAntigo !== 'trial') {
      try {
        await asaasDelete(`/subscriptions/${assinaturaAntigaId}`);
        console.log(`[Asaas] Assinatura antiga ${assinaturaAntigaId} cancelada (troca de plano: ${planoAntigo} → ${plano})`);
      } catch (e) {
        // Se falhar ao cancelar, loga mas não bloqueia a criação da nova
        console.warn('[Asaas] Aviso: não foi possível cancelar assinatura antiga:', e);
      }
    }

    // 4. Data de vencimento = hoje (cobrança imediata — trial já foi dado no onboarding)
    const nextDueDate = new Date();
    const dueDateStr = nextDueDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // 5. Criar nova assinatura mensal
    const subscription = await asaasPost('/subscriptions', {
      customer: customerId,
      billingType: 'UNDEFINED', // cliente escolhe (PIX, cartão, boleto)
      value: planoConfig.valor,
      nextDueDate: dueDateStr,
      cycle: 'MONTHLY',
      description: `Motor em Dia — Plano ${planoConfig.nome}`,
      externalReference: empresaId,
    });

    const subscriptionId: string = subscription.id;

    // 6. Buscar URL de pagamento da 1ª fatura
    let invoiceUrl: string | null = null;
    try {
      const payments = await asaasGet(`/subscriptions/${subscriptionId}/payments`);
      if (payments?.data?.length > 0) {
        invoiceUrl = payments.data[0].invoiceUrl ?? payments.data[0].bankSlipUrl ?? null;
      }
    } catch {
      // Fatura ainda não gerada — ok, usuário pode pagar depois
    }

    // 7. Atualizar empresa no Supabase
    const planoExpira = new Date();
    planoExpira.setDate(planoExpira.getDate() + 30);

    await supabaseAdmin
      .from('empresas')
      .update({
        assinatura_id: subscriptionId,
        plano: plano,
        status: 'ativo',
        trial_expira_em: null,
        plano_expira_em: planoExpira.toISOString(),
        inadimplente: false,
      })
      .eq('id', empresaId);

    const isUpgrade = planoAntigo !== 'trial' && planoConfig.valor > (PLANOS[planoAntigo as PlanoKey]?.valor ?? 0);

    return NextResponse.json({
      ok: true,
      subscriptionId,
      invoiceUrl,
      plano: planoConfig.nome,
      valor: planoConfig.valor,
      isUpgrade,
      planoAntigo,
    });

  } catch (err: any) {
    console.error('[Asaas/assinar]', err);
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 });
  }
}
