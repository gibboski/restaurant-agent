"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailAutoReply = emailAutoReply;
const db_1 = require("../db");
const gmail_1 = require("../gmail");
const kbQuery_1 = require("./kbQuery");
async function emailAutoReply(venue_slug, to, subject, body) {
    const q = body.slice(0, 500);
    const kb = await (0, kbQuery_1.kbQuery)(venue_slug, q);
    const answer = kb.contexts?.length
        ? `Hi,\n\n${kb.contexts[0].chunk}\n\nBest,\n${venue_slug} Team`
        : `Hi,\n\nThanks for reaching out—I've escalated this to the team.\n\nBest,\n${venue_slug} Team`;
    await (0, gmail_1.sendMail)({ to, subject: `Re: ${subject}`, text: answer });
    await db_1.db.query(`insert into email_logs(venue_slug, direction, sender, recipient, subject, body, summary, success)
     values($1,$2,$3,$4,$5,$6,$7,$8)`, [venue_slug, 'out', 'bot', to, subject, answer, 'auto-reply', true]);
    return { ok: true };
}
//# sourceMappingURL=emailAutoReply.js.map