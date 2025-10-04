import type { BookingPayload, BookingResult } from './base';

export function customAdapter(conf: any) {
  return {
    async createReservation(p: BookingPayload): Promise<BookingResult> {
      if (!conf?.webhookUrl) {
        return { ok: false, error: 'custom webhookUrl not configured' };
      }

      const r = await fetch(conf.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(conf.apiKey ? { Authorization: `Bearer ${conf.apiKey}` } : {}),
        },
        body: JSON.stringify(p),
      });

      if (!r.ok) {
        return { ok: false, error: `webhook ${r.status}` };
      }

      // Explicitly type the JSON as 'any' to avoid TS18046
      const j: any = await r.json().catch(() => ({}));

      if (j && j.ok) {
        return {
          ok: true,
          provider_ref: j.provider_ref || 'custom-ref',
          confirmation_link: j.confirmation_link,
        };
      }
      return { ok: false, error: (j && j.error) || 'webhook error' };
    },
  };
}
