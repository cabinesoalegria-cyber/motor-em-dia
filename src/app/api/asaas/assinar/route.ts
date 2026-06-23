import { NextRequest, NextResponse } from 'next/server';
import { asaasPost, asaasGet, asaasDelete, PLANOS, PlanoKey } from '@/lib/asaas';
import { createClient } from '@supabase/supabase-js';

// Usa service role se disponível, senão usa anon (RPC com SECURITY DEFINER bypassa RLS)
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
 *  4. Atualiza empresa via RPC (bypassa RLS — funciona mesmo sem service role key)
 *  5. Retorna URL de pagamento da 1ª fatura
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
    const { data: empresa, error: empresaErr } = await supabaseAdmin
      .from('empresas')
      .select('asaas_customer_id, assinatura_id, plano')
      .eq('id', empresaId)
      .single();

    if (empresaErr) {
      console.error('[Asaas] Erro ao buscar empresa:', empresaErr);
    }

    let customerId: string = empresa?.asaas_customer_id ?? '';
    const assinaturaAntigaId: string = empresa?.assinatura_id ?? '';
    const planoAntigo: string = empresa?.plano ?? 'trial';

    // 2. Criar ou atualizar cliente no Asaas
    if (!customerId) {
      const customerBody: Record<string, string> = { name: nome, email };
      if (cpfCnpj) customerBody.cpfCnpj = cpfCnpj.replace(/\D/g, '');
      const customer = await asaasPost('/customers', customerBody);
      customerId = customer.id;
    } else {
      // Garante que o CPF/CNPJ está atualizado no cliente existente
      try {
        if (cpfCnpj) {
          await asaasPost(`/customers/${customerId}`, {
            name: nome,
            email,
            cpfCnpj: cpfCnpj.replace(/\D/g, ''),
          });
        }
      } catch { /* ignora erro de update */ }
    }

    // 3. Cancelar assinatura antiga se existir (upgrade/troca de plano)
    if (assinaturaAntigaId && planoAntigo !== 'trial') {
      try {
        await asaasDelete(`/subscriptions/${assinaturaAntigaId}`);
        console.log(`[Asaas] Assinatura antiga ${assinaturaAntigaId} cancelada (${planoAntigo} → ${plano})`);
      } catch (e) {
        console.warn('[Asaas] Não foi possível cancelar assinatura antiga:', e);
      }
    }

    // 4. Data de vencimento = hoje (cobrança imediata)
    const dueDateStr = new Date().toISOString().split('T')[0];

    // 5. Criar nova assinatura mensal
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

    // 6. Buscar URL de pagamento da 1ª fatura
    let invoiceUrl: string | null = null;
    try {
      await new Promise(r => setTimeout(r, 1500)); // aguarda Asaas gerar a fatura
      const payments = await asaasGet(`/subscriptions/${subscriptionId}/payments`);
      if (payments?.data?.length > 0) {
        invoiceUrl = payments.data[0].invoiceUrl
          ?? payments.data[0].bankSlipUrl
          ?? null;
      }
    } catch {
      // Fatura ainda não gerada — ok
    }

    // 7. Atualizar empresa via RPC com SECURITY DEFINER (bypassa RLS)
    const { error: rpcError } = await supabaseAdmin.rpc('atualizar_plano_empresa', {
      p_empresa_id:       empresaId,
      p_plano:            plano,
      p_assinatura_id:    subscriptionId,
      p_asaas_customer_id: customerId,
    });

    if (rpcError) {
      console.error('[Asaas] Erro ao atualizar plano via RPC:', rpcError);
      // Tenta update direto como fallback
      await supabaseAdmin
        .from('empresas')
        .update({
          assinatura_id:    subscriptionId,
          asaas_customer_id: customerId,
          plano:            plano,
          status:           'ativo',
          trial_expira_em:  null,
          inadimplente:     false,
        })
        .eq('id', empresaId);
    }

    const isUpgrade = planoAntigo !== 'trial'
      && planoConfig.valor > (PLANOS[planoAntigo as PlanoKey]?.valor ?? 0);

    return NextResponse.json({
      ok: true,
      subscriptionId,
      invoiceUrl,
      plano:      planoConfig.nome,
      valor:      planoConfig.valor,
      isUpgrade,
      planoAntigo,
    });

  } catch (err: any) {
    console.error('[Asaas/assinar]', err);
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 });
  }
}
