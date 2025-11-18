import { paymentsConfig } from '@/config/payments';

type CreateIntentResult = { client_secret: string; intent_id: string };

export async function createPaymentIntent(orderId: string): Promise<CreateIntentResult> {
  if (!paymentsConfig.enabled) {
    return { client_secret: `pi_mock_${orderId}_secret_123`, intent_id: `pi_mock_${orderId}` };
  }
  const res = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  if (!res.ok) throw new Error('Failed to create PaymentIntent');
  return await res.json();
}

export async function releaseToSeller(orderId: string) {
  if (!paymentsConfig.enabled) {
    return { ok: true, transfer_id: `tr_mock_${orderId}` };
  }
  const res = await fetch('/api/payments/release', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  if (!res.ok) throw new Error('Failed to release escrow');
  return await res.json();
}


