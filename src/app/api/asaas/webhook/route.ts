import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * POST /api/asaas/webhook
 *
 * Recebe notificações do Asaas e atualiza o status do plano da empresa.
 *
 * Eventos relevantes:
 *  - PAYMENT_CONFIRMED / PAYMENT_RECEIVED → ativa plano
 *  - PAYMENT_OVERDUE                       → marca como inadimplente
 *  - SUBSCRIPTION_CANCELLED               → cancela plano
 */
export async function POST(req: NextRequest) {
  try {
    // Validate Asaas authentication token
    const webhookToken = process.env.ASAAAS_WEBHOOK_TOKEN;
    if (webhookToken) {
      const authHeader = req.headers.get('asaas-access-token') ?? req.headers.get('authorization') ?? '';
      if (authHeader !== webhookToken) {
        console.warn('[Asaas webhook] Token inválido recebido:', authHeader?.slice(0, 10));
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const event = await req.json();
    console.log('[Asaas webhook]', event.event, event.payment?.id ?? event.subscription?.id);

    const eventType: string = event.event ?? '';
    const payment   = event.payment;
    const subscription = event.subscription;

    // Helper: buscar empresa pelo assinatura_id ou externalReference
    async function findEmpresa(assinaturaId?: string, externalRef?: string) {
      if (assinaturaId) {
        const { data } = await supabaseAdmin
          .from('empresas')
          .select('id, plano, status')
          .eq('assinatura_id', assinaturaId)
          .single();
        if (data) return data;
      }
      if (externalRef) {
        const { data } = await supabaseAdmin
          .from('empresas')
          .select('id, plano, status')
          .eq('id', externalRef)
          .single();
        if (data) return data;
      }
      return null;
    }

    if (eventType === 'PAYMENT_CONFIRMED' || eventType === 'PAYMENT_RECEIVED') {
      const assinaturaId = payment?.subscription;
      const externalRef  = payment?.externalReference;
      const empresa = await findEmpresa(assinaturaId, externalRef);

      if (empresa) {
        // Tenta via RPC primeiro (bypassa RLS)
        const { error } = await supabaseAdmin.rpc('atualizar_status_pagamento', {
          p_assinatura_id: assinaturaId ?? empresa.id,
          p_status:        'ativo',
          p_inadimplente:  false,
        });
        if (error) {
          // Fallback direto
          await supabaseAdmin
            .from('empresas')
            .update({ status: 'ativo', inadimplente: false })
            .eq('id', empresa.id);
        }
        console.log(`[Webhook] Empresa ${empresa.id} → ATIVO`);
      }
    }

    else if (eventType === 'PAYMENT_OVERDUE') {
      const assinaturaId = payment?.subscription;
      const externalRef  = payment?.externalReference;
      const empresa = await findEmpresa(assinaturaId, externalRef);

      if (empresa) {
        const { error } = await supabaseAdmin.rpc('atualizar_status_pagamento', {
          p_assinatura_id: assinaturaId ?? empresa.id,
          p_status:        'inadimplente',
          p_inadimplente:  true,
        });
        if (error) {
          await supabaseAdmin
            .from('empresas')
            .update({ inadimplente: true })
            .eq('id', empresa.id);
        }
        console.log(`[Webhook] Empresa ${empresa.id} → INADIMPLENTE`);
      }
    }


    else if (eventType === 'SUBSCRIPTION_CANCELLED' || eventType === 'SUBSCRIPTION_DELETED') {
      const assinaturaId = subscription?.id;
      const empresa = await findEmpresa(assinaturaId);

      if (empresa) {
        await supabaseAdmin
          .from('empresas')
          .update({ status: 'inativo', plano: 'trial', assinatura_id: null })
          .eq('id', empresa.id);

        console.log(`[Webhook] Empresa ${empresa.id} → CANCELADO`);
      }
    }

    // Sempre retornar 200 para o Asaas
    return NextResponse.json({ received: true });

  } catch (err: any) {
    console.error('[Asaas webhook error]', err);
    // Retornar 200 mesmo em erro para evitar retentativas desnecessárias
    return NextResponse.json({ received: true, warning: err.message });
  }
}
