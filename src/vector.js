"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertVectors = upsertVectors;
exports.queryVector = queryVector;
const pinecone_1 = require("@pinecone-database/pinecone");
const config_1 = require("./config");
const pc = new pinecone_1.Pinecone({ apiKey: config_1.cfg.pineconeKey });
const index = pc.index(config_1.cfg.pineconeIndex);
async function upsertVectors(pairs) {
    await index.upsert(pairs);
}
async function queryVector(values, topK = 5) {
    return index.query({ vector: values, topK, includeMetadata: true });
}
//# sourceMappingURL=vector.js.map