import { createClient } from '@supabase/supabase-js';

// Used by Frontend
export interface LogEntry {
  id: number;
  timestamp: string;
  actor_id: string;
  event: string;
  recipient: string;
  details: any;
  status: string;
  error?: string;
}

export type LogAction =
  | 'send_message'
  | 'update_customer'
  | 'bulk_import_customers'
  | 'update_conversation_status'
  | 'pause_conversation'
  | 'resume_conversation'
  | 'resume_conversation'
  | 'assign_conversation'
  | 'add_note'
  | 'update_user'
  | 'delete_user';

interface LogPayload {
  actor_id: string; // The user ID performing the action
  action: LogAction;
  entity: string; // 'conversation', 'customer', 'message'
  entity_id: string; // The ID of the affected entity
  metadata?: Record<string, any>; // Extra details (e.g. diff, status change)
}

/**
 * Centralized logging helper.
 * Writes to the 'event_logs' table.
 * Uses Service Role to ensure logs are written regardless of user session (e.g. from API).
 */
export async function logActivity(payload: LogPayload) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('event_logs').insert({
      timestamp: new Date().toISOString(),
      actor_id: payload.actor_id,
      event: payload.action, // Mapping 'action' to 'event' column usually
      recipient: payload.entity_id, // Mapping entity_id to recipient often used in this app's logs
      details: {
        entity: payload.entity,
        ...payload.metadata
      },
      status: 'SUCCESS',
      apiKeyId: payload.metadata?.apiKeyId,
      businessId: payload.metadata?.businessId
    });

    if (error) {
      console.error('LOGGING FAILED:', error);
    }
  } catch (err) {
    console.error('LOGGING EXCEPTION:', err);
  }
}

// --- LEGACY / HELPER SUPPORTS FOR BUILD FIX ---

export async function logMessageEvent(payload: any) {
  // Adapter for v1 routes
  await logActivity({
    actor_id: 'system',
    action: 'send_message',
    entity: 'message',
    entity_id: payload.recipient || payload.to || 'unknown', // FIX: Save Phone Number as recipient column
    metadata: payload
  });
}

export async function hasProcessedBookingId(bookingId: string) {
  // Idempotency stub
  // For now return false to allow processing
  return false;
}

export async function hasProcessedInvoiceId(invoiceId: string) {
  return false;
}