export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { queryByPk, putItem, getItem } from '@/lib/aws/dynamo';
import { sendWhatsAppTextMessage } from '@/lib/whatsapp';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        /*
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        */

        // RECOVERY MODE: Use QueryCommand for efficiency while maintaining relaxed filtering for legacy data
        const convPk = `CONV#${id}`;
        const response = await queryByPk(convPk);
        
        console.log(`[API] Query for ${convPk} returned ${response.Items?.length || 0} items`);

        // Filter and map fields for migration compatibility
        const items = (response.Items || []).filter(item => 
            item.pk === `MSG#${id}` || // Support old PK format if it exists in the same partition
            item.pk === `CONV#${id}` || // Legacy match
            item.gsi1pk === 'TYPE#MESSAGE' || 
            item.type === 'message' || 
            item.sk?.startsWith('MSG#') ||
            item.sk?.includes('MESSAGE') ||
            item.message_body // Direct check for legacy content field
        );

        const mappedItems = items.map(item => ({
            ...item,
            content: item.content || item.message_body || item.text || 'No content',
            created_at: item.created_at || item.timestamp || new Date().toISOString(),
            direction: item.direction || (item.sender_type === 'agent' ? 'outbound' : 'inbound'),
            type: item.type || 'text',
            status: item.status || 'read'
        }));
        
        mappedItems.sort((a: any, b: any) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        return NextResponse.json({ messages: mappedItems });
    } catch (error: any) {
        console.error('[API] Get Messages Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        /*
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        */

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
            tenant_id: 'pavansrinivas64@gmail.com' // Defaulting to email as tenant_id
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
                tenant_id: conv.tenant_id || 'pavansrinivas64@gmail.com' // Ensure tenant_id persists
            });
        }

        return NextResponse.json({ success: true, message: msgItem });
    } catch (error: any) {
        console.error('[API] Send Message Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
