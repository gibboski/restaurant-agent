"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
const db_1 = require("../db");
const base_1 = require("../adapters/base");
const adapters_1 = require("../adapters");
async function createBooking(p) {
    const v = await db_1.db.query('select booking_provider, booking_provider_config from venues where slug=$1', [p.venue_slug]);
    if (!v.rows.length)
        return { ok: false, error: 'Unknown venue' };
    const provider = v.rows[0].booking_provider;
    const conf = v.rows[0].booking_provider_config;
    const adapter = (0, adapters_1.getAdapter)(provider, conf);
    const res = await adapter.createReservation(p);
    await db_1.db.query(`insert into bookings(venue_slug,date,time,party_size,guest_name,phone,email,notes,status,provider_ref,confirmation_link)
     values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [p.venue_slug, p.date, p.time, p.partySize, p.guestName, p.phone, p.email || '', p.notes || '',
        res.ok ? 'created' : 'failed', res.provider_ref || '', res.confirmation_link || '']);
    return res;
}
//# sourceMappingURL=createBooking.js.map