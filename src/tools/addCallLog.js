"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCallLog = addCallLog;
const db_1 = require("../db");
async function addCallLog(p) {
    await db_1.db.query('insert into call_logs(venue_slug, direction, caller, callee, transcript, summary, success) values($1,$2,$3,$4,$5,$6,$7)', [p.venue_slug, 'inbound', p.caller || '', '', '', p.summary || '', !!p.success]);
    return { ok: true };
}
//# sourceMappingURL=addCallLog.js.map