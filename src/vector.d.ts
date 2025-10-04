export declare function upsertVectors(pairs: {
    id: string;
    values: number[];
    metadata: any;
}[]): Promise<void>;
export declare function queryVector(values: number[], topK?: number): Promise<import("@pinecone-database/pinecone").QueryResponse<import("@pinecone-database/pinecone").RecordMetadata>>;
//# sourceMappingURL=vector.d.ts.map