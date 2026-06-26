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
 */
export async function POST(req: NextRequest) {
  try {
    const { empresaId, plano, nome, email, cpfCnpj } = await req.json();

    if (!empresaId || !plano || !nome || !email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: empresaId, plano, nome, email' },
        { status: 400 }
      );
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

    // 2. Criar ou atualizar cliente no Asaas
    if (!customerId) {
      const customerBody: Record<string, string> = { name: nome, email };
      if (cpfCnpj) customerBody.cpfCnpj = cpfCnpj.replace(/\D/g, '');
      const customer = await asaasPost('/customers', customerBody);
      customerId = customer.id;
    } else if (cpfCnpj) {
      try {
        await fetch(
          `${process.env.ASAAAS_BASE_URL}/customers/${customerId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'access_token': process.env.ASAAAS_API_KEY!,
            },
            body: JSON.stringify({ name: nome, email, cpfCnpj: cpfCnpj.replace(/\D/g, '') }),
          }
        );
      } catch { /* ignora */ }
    }

    // 3. Cancelar assinatura antiga (upgrade/troca)
    if (assinaturaAntigaId && planoAntigo !== 'trial') {
      try {
        await asaasDelete(`/subscriptions/${assinaturaAntigaId}`);
        console.log(`[Asaas] Assinatura ${assinaturaAntigaId} cancelada (${planoAntigo} → ${plano})`);
      } catch (e) {
        console.warn('[Asaas] Aviso: não cancelou assinatura antiga:', e);
      }
    }

    // 4. Criar nova assinatura
    const dueDateStr = new Date().toISOString().split('T')[0];
    const subscription = await asaasPost('/subscriptions', {
      customer:          customerId,
      billingType:       'UNDEFINED',
      value:             planoConfig.valor,
      nextDueDate:       dueDateStr,
      cycle:             'MONTHLY',
      description:       `Motor em Dia — Plano ${planoConfig.nome}`,
      externalReference: empresaId,
    });
    const subscriptionId: string = subscription.id;

    // 5. Buscar URL de pagamento com até 2 tentativas (máx 2s total)
    let invoiceUrl: string | null = null;
    for (let attempt = 0; attempt < 2 && !invoiceUrl; attempt++) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const payments = await asaasGet(`/subscriptions/${subscriptionId}/payments`);
        const first = payments?.data?.[0];
        invoiceUrl = first?.invoiceUrl ?? first?.bankSlipUrl ?? null;
      } catch { /* próxima tentativa */ }
    }

    // 6. Fallback: URL direto do painel Asaas sandbox / produção
    const isSandbox = process.env.ASAAAS_SANDBOX === 'true';
    const asaasPortalUrl = isSandbox
      ? 'https://sandbox.asaas.com/customerAccount'
      : 'https://asaas.com/customerAccount';
    const finalInvoiceUrl = invoiceUrl ?? asaasPortalUrl;

    // 7. Atualizar empresa via RPC (SECURITY DEFINER — bypassa RLS)
    const { error: rpcError } = await supabaseAdmin.rpc('atualizar_plano_empresa', {
      p_empresa_id:        empresaId,
      p_plano:             plano,
      p_assinatura_id:     subscriptionId,
      p_asaas_customer_id: customerId,
      p_invoice_url:       finalInvoiceUrl,
    });

    if (rpcError) {
      console.error('[Asaas] Erro RPC:', rpcError.message);
      // Fallback direto — pendente_pagamento (NÃO ativo)
      await supabaseAdmin
        .from('empresas')
        .update({
          assinatura_id:     subscriptionId,
          asaas_customer_id: customerId,
          asaas_invoice_url: finalInvoiceUrl,
          plano_anterior:    planoAntigo,   // ← guarda plano confirmado antes da troca
          plano,
          status:            'pendente_pagamento',
          trial_expira_em:   null,
          inadimplente:      false,
        })
        .eq('id', empresaId);
    }

    const isUpgrade = planoAntigo !== 'trial'
      && planoConfig.valor > (PLANOS[planoAntigo as PlanoKey]?.valor ?? 0);

    return NextResponse.json({
      ok: true,
      subscriptionId,
      invoiceUrl:  finalInvoiceUrl,
      plano:       planoConfig.nome,
      valor:       planoConfig.valor,
      isUpgrade,
      planoAntigo,
    });

  } catch (err: any) {
    console.error('[Asaas/assinar]', err);
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 });
  }
}
