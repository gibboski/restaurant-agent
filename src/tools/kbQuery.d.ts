export declare function kbQuery(venue_slug: string, question: string): Promise<{
    ok: boolean;
    contexts: {
        chunk: any;
        score: number | undefined;
    }[];
}>;
//# sourceMappingURL=kbQuery.d.ts.map