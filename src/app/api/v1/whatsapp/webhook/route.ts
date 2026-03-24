import { NextRequest, NextResponse } from 'next/server';
import { normalizePhone } from '@/lib/normalization';
import { sendWhatsAppTextMessage } from '@/lib/whatsapp';
import { putItem, getItem, queryGSI1, TABLE_NAME, docClient } from '@/lib/aws/dynamo';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

export const dynamic = 'force-dynamic';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('[Webhook GET] Query:', { mode, token, expected: VERIFY_TOKEN });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            // 1. Handle Status Updates
            if (value?.statuses && value.statuses.length > 0) {
                const statusUpdate = value.statuses[0];
                const waMessageId = statusUpdate.id;
                const newStatus = statusUpdate.status;
                console.log(`[Webhook] Status Update: ${waMessageId} -> ${newStatus}`);
                // Status update logic for DynamoDB (UpdateItem with GSI search if needed, or by ID)
                // For now, logging to console.
            }

            // 2. Handle Incoming Messages
            const message = value?.messages?.[0];
            if (message) {
                const rawPhone = message.from;
                const phoneWithPlus = `+${rawPhone}`;
                const normalizedPhone = normalizePhone(rawPhone);
                const textBody = message.text?.body || '';
                const senderName = value.contacts?.[0]?.profile?.name || phoneWithPlus;

                // A. Check for Conversation
                const convPk = `CONV#${normalizedPhone}`;
                const convSk = 'METADATA';
                
                const { Item: existingConv } = await getItem(convPk, convSk);
                
                const now = new Date().toISOString();
                const unread = (existingConv?.unread || 0) + 1;

                const convItem = {
                    pk: convPk,
                    sk: convSk,
                    gsi1pk: 'TYPE#CONVERSATION',
                    gsi1sk: now,
                    id: normalizedPhone,
                    phone: phoneWithPlus,
                    name: senderName,
                    last_message: textBody,
                    last_message_at: now,
                    last_inbound_message_at: now,
                    unread: unread,
                    status: 'open',
                    is_paused: false,
                    platform: 'Whatsapp'
                };

                await putItem(convItem);

                // B. Save Message
                const msgId = message.id;
                const msgItem = {
                    pk: `MSG#${normalizedPhone}`,
                    sk: `${now}#${msgId}`,
                    gsi1pk: 'TYPE#MESSAGE',
                    gsi1sk: now,
                    id: msgId,
                    content: textBody,
                    direction: 'inbound',
                    type: 'text',
                    status: 'delivered',
                    created_at: now,
                    sender_type: 'user',
                    whatsapp_id: msgId
                };

                await putItem(msgItem);
                
                console.log(`[Webhook] Saved message from ${phoneWithPlus}`);
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('[Webhook] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
