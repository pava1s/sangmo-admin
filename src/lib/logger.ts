// MOCK LOGGER: Bypasses Supabase for the standalone admin dashboard.

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
  | 'assign_conversation'
  | 'add_note'
  | 'update_user'
  | 'delete_user';

interface LogPayload {
  actor_id: string;
  action: LogAction;
  entity: string;
  entity_id: string;
  metadata?: Record<string, any>;
}

export async function logActivity(payload: LogPayload) {
  console.log('MOCK LOG:', payload);
}

export async function logMessageEvent(payload: any) {
  await logActivity({
    actor_id: 'system',
    action: 'send_message',
    entity: 'message',
    entity_id: payload.recipient || payload.to || 'unknown',
    metadata: payload
  });
}

export async function hasProcessedBookingId(bookingId: string) {
  return false;
}

export async function hasProcessedInvoiceId(invoiceId: string) {
  return false;
}