"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kbQuery = kbQuery;
const embeddings_1 = require("../embeddings");
const vector_1 = require("../vector");
async function kbQuery(venue_slug, question) {
    const [vec] = await (0, embeddings_1.embed)([question]);
    const hits = await (0, vector_1.queryVector)(vec, 5);
    return {
        ok: true,
        contexts: hits.matches?.map(m => ({
            chunk: m.metadata?.chunk || '',
            score: m.score
        })) || []
    };
}
//# sourceMappingURL=kbQuery.js.map