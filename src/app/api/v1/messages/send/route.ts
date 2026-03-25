export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppTemplateMessage } from '@/lib/whatsapp';
import { putItem } from '@/lib/aws/dynamo';
import { normalizePhone } from '@/lib/normalization';

export async function POST(req: NextRequest) {
    try {
        const apiKey = req.headers.get('x-api-key');
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key is required in x-api-key header' }, { status: 401 });
        }

        // TODO: In a production environment, verify the apiKey against DynamoDB
        // For now, we allow authorized testing as requested by the user's documentation sync.

        const body = await req.json();
        const { to, templateName, variables } = body;

        if (!to || !templateName) {
            return NextResponse.json({ error: 'Missing required fields: to, templateName' }, { status: 400 });
        }

        const normalizedTo = normalizePhone(to);

        // 1. Send via WhatsApp
        const result = await sendWhatsAppTemplateMessage(
            normalizedTo.startsWith('+') ? normalizedTo : `+${normalizedTo}`,
            templateName,
            variables || []
        );

        const now = new Date().toISOString();
        const waId = result.messages?.[0]?.id || `tmp_${Date.now()}`;

        // 2. Log Message to DynamoDB
        const msgItem = {
            pk: `MSG#${normalizedTo}`,
            sk: `${now}#${waId}`,
            gsi1pk: 'TYPE#MESSAGE',
            gsi1sk: now,
            id: waId,
            content: `Template: ${templateName}`,
            direction: 'outbound',
            type: 'template',
            status: 'sent',
            created_at: now,
            sender_type: 'api',
            template_name: templateName,
            variables: variables || [],
            tenant_id: 'pavansrinivas64@gmail.com' // Defaulting for partner API
        };
        await putItem(msgItem);

        return NextResponse.json({ 
            success: true, 
            messageId: waId,
            status: 'sent'
        });

    } catch (error: any) {
        console.error('[API] Message Send Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
