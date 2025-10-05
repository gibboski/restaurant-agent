// src/mock/provider.ts
import { Request, Response } from "express";

export function mockBooking(req: Request, res: Response) {
  const { guestName, date, time, partySize } = (req.body as any) || {};
  const ref = `mock-${Date.now()}`;
  res.json({
    ok: true,
    provider_ref: ref,
    confirmation_link: `https://example.com/confirm/${ref}`,
    echo: { guestName, date, time, partySize }
  });
}

