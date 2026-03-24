import { NextRequest, NextResponse } from 'next/server';
import { queryByPk, putItem, getItem } from '@/lib/aws/dynamo';
import { sendWhatsAppTextMessage } from '@/lib/whatsapp';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await queryByPk(`MSG#${id}`);
        let items = response.Items || [];

        // If not super_admin, filter by tenant_id
        if (session.role !== 'super_admin') {
            items = items.filter(item => item.tenant_id === session.id || item.tenant_id === session.email);
        }
        
        items.sort((a: any, b: any) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        return NextResponse.json({ messages: items });
    } catch (error: any) {
        console.error('[API] Get Messages Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, type } = await req.json();

        // 1. Send to Meta
        const waId = await sendWhatsAppTextMessage(`+${id}`, content);

        const now = new Date().toISOString();

        // 2. Save Message to DynamoDB
        const msgItem = {
            pk: `MSG#${id}`,
            sk: `${now}#${waId}`,
            gsi1pk: 'TYPE#MESSAGE',
            gsi1sk: now,
            id: waId,
            content,
            direction: 'outbound',
            type: type || 'text',
            status: 'sent',
            created_at: now,
            sender_type: 'agent',
            whatsapp_id: waId,
            tenant_id: session.email // Defaulting to email as tenant_id
        };
        await putItem(msgItem);

        // 3. Update Conversation Last Message
        const convPk = `CONV#${id}`;
        const convSk = 'METADATA';
        const { Item: conv } = await getItem(convPk, convSk);
        
        if (conv) {
            await putItem({
                ...conv,
                last_message: content,
                last_message_at: now,
                tenant_id: conv.tenant_id || session.email // Ensure tenant_id persists
            });
        }

        return NextResponse.json({ success: true, message: msgItem });
    } catch (error: any) {
        console.error('[API] Send Message Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
