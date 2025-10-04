"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customAdapter = customAdapter;
const node_fetch_1 = __importDefault(require("node-fetch"));
const base_1 = require("./base");
function customAdapter(conf) {
    return {
        async createReservation(p) {
            if (!conf?.webhookUrl)
                return { ok: false, error: 'custom webhookUrl not configured' };
            const r = await (0, node_fetch_1.default)(conf.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(conf.apiKey ? { 'Authorization': `Bearer ${conf.apiKey}` } : {})
                },
                body: JSON.stringify(p)
            });
            if (!r.ok)
                return { ok: false, error: `webhook ${r.status}` };
            const j = await r.json().catch(() => ({}));
            return j.ok
                ? { ok: true, provider_ref: j.provider_ref || 'custom-ref', confirmation_link: j.confirmation_link }
                : { ok: false, error: j.error || 'webhook error' };
        }
    };
}
//# sourceMappingURL=custom.js.map