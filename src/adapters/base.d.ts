export type BookingPayload = {
    venue_slug: string;
    date: string;
    time: string;
    partySize: number;
    guestName: string;
    phone: string;
    email?: string;
    notes?: string;
};
export type BookingResult = {
    ok: true;
    provider_ref: string;
    confirmation_link?: string;
} | {
    ok: false;
    error: string;
};
export interface BookingAdapter {
    createReservation(p: BookingPayload): Promise<BookingResult>;
}
//# sourceMappingURL=base.d.ts.map