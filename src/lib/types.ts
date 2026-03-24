// Type definitions for API payloads and shared data structures

/**
 * Payload for the `booking_confirmed` event, as per EVENT_CONTRACT.md.
 */
export type BookingConfirmedPayload = {
    contact: {
        name: string;
        phone: string; // E.164 format
        email?: string;
    };
    trip: {
        bookingId: string;
        name: string;
        destination: string;
        startDate: string; // YYYY-MM-DD format
    };
};

/**
 * Payload for the `payment_pending` event, as per EVENT_CONTRACT.md.
 */
export type PaymentPendingPayload = {
    contact: {
        phone: string; // E.164 format
    };
    payment: {
        amount: number;
        currency: string;
        dueDate: string; // YYYY-MM-DD format
        invoiceId?: string;
    };
};

/**
 * Payload for the `payment_received` event, as per EVENT_CONTRACT.md.
 */
export type PaymentReceivedPayload = {
    contact: {
        phone: string; // E.164 format
    };
    payment: {
        amount: number;
        currency: string;
        receiptId?: string;
    };
};

/**
 * Payload for the `trip_reminder` event, as per EVENT_CONTRACT.md.
 */
export type TripReminderPayload = {
    contact: {
        phone: string; // E.164 format
    };
    trip: {
        name: string;
        startDate: string; // YYYY-MM-DD format
        destination: string;
    };
};


/**
 * Payload for sending a WhatsApp template message via Meta Cloud API.
 */
export type WhatsAppMessagePayload = {
    messaging_product: 'whatsapp';
    to: string;
    type: 'template';
    template: {
        name: string;
        language: {
            code: string;
        };
        components: {
            type: 'body' | 'header' | 'button';
            parameters: {
                type: 'text' | 'currency' | 'date_time' | 'image' | 'document';
                text?: string;
                // Add other parameter types as needed
            }[];
        }[];
    };
};

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export type Deal = {
    id: string;
    customer_id?: string;
    title: string;
    value: number;
    currency: string;
    stage: DealStage;
    expected_close_date?: string;
    assigned_to?: string;
    created_at: string;
    updated_at: string;
    customers?: {
        id: string;
        full_name: string;
        company_name?: string;
    };
    profiles?: {
        id: string;
        full_name: string;
        avatar_url?: string;
    };
};
export type Profile = {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
    role?: 'super_admin' | 'admin' | 'agent' | 'tech_support';
    permissions?: Record<string, boolean>;
    created_at?: string;
};

export type AutomationRule = {
    id: string;
    name: string;
    keywords: string[];
    match_type: 'exact' | 'contains';
    action_type: 'reply' | 'assign' | 'tag';
    action_payload: any;
    is_active: boolean;
    created_at?: string;
};
