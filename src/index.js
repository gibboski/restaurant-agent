"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const db_1 = require("./db");
const kbQuery_1 = require("./tools/kbQuery");
const createBooking_1 = require("./tools/createBooking");
const transferCall_1 = require("./tools/transferCall");
const emailAutoReply_1 = require("./tools/emailAutoReply");
const embeddings_1 = require("./embeddings");
const vector_1 = require("./vector");
const addCallLog_1 = require("./tools/addCallLog");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.get('/health', (_, res) => res.json({ ok: true }));
// Ingest text chunks into KB
app.post('/v1/kb/ingest', async (req, res) => {
    const { venue_slug, texts, source } = req.body; // texts:string[]
    if (!venue_slug || !Array.isArray(texts))
        return res.status(400).json({ ok: false, error: 'bad payload' });
    const vecs = await (0, embeddings_1.embed)(texts);
    const pairs = vecs.map((v, i) => ({
        id: `${venue_slug}-${Date.now()}-${i}`,
        values: v,
        metadata: { chunk: texts[i], venue_slug, source: source || 'upload' }
    }));
    await (0, vector_1.upsertVectors)(pairs);
    await db_1.db.query('insert into kb_chunks(venue_slug, source, chunk) select $1,$2,unnest($3::text[])', [venue_slug, source || 'upload', texts]);
    res.json({ ok: true, upserted: texts.length });
});
app.post('/v1/kb/query', async (req, res) => {
    const { venue_slug, question } = req.body;
    const data = await (0, kbQuery_1.kbQuery)(venue_slug, question);
    res.json(data);
});
app.post('/v1/booking/create', async (req, res) => {
    const data = await (0, createBooking_1.createBooking)(req.body);
    res.json(data);
});
app.post('/v1/transfer', async (req, res) => {
    const { venue_slug, category } = req.body;
    res.json((0, transferCall_1.transferCall)(venue_slug, category));
});
app.post('/v1/email/auto-reply', async (req, res) => {
    const { venue_slug, to, subject, body } = req.body;
    const data = await (0, emailAutoReply_1.emailAutoReply)(venue_slug, to, subject, body);
    res.json(data);
});
// NEW: call log route so Vapi can persist summaries
app.post('/v1/call/log', async (req, res) => {
    const data = await (0, addCallLog_1.addCallLog)(req.body);
    res.json(data);
});
app.listen(config_1.cfg.port, () => console.log(`API on :${config_1.cfg.port}`));
//# sourceMappingURL=index.js.map