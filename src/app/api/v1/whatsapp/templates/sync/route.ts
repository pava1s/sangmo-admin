import { NextRequest, NextResponse } from 'next/server';
import { putItem } from '@/lib/aws/dynamo';
import { getAuthSession } from '@/lib/auth';
import { serverEnv } from '@/lib/server-env';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const WHATSAPP_ACCESS_TOKEN = "EAATyOGZBsHbkBQQ3KfYe7IlX5NCrttSDOiiaEj9EfdJL93qSGlh7XeMAvdU3oRGkpQZAgpfkcUdC0UXZBWuiLm6QWveezYbIXtbOWtdT9POy7daz8cL1ClZCkpZCvAKy4oBzcPDNwxG12ufb1NNIPFkzjInUgFGDGYVtYxBc7NoWBQrbCnFqNywbUbZAzpiQZDZD";
        const WHATSAPP_BUSINESS_ID = serverEnv.META_BIZ_ID || "1525236985361051";

        const apiUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_BUSINESS_ID}/message_templates?limit=1000`;
        
        console.log('MIRROR SYNC START (HARDCODE):', apiUrl);
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
            }
        });

        if (!response.ok) {
            const rawError = await response.text();
            console.error('MIRROR SYNC RAW ERROR:', rawError);
            return NextResponse.json({ error: rawError }, { status: 400 });
        }

        const data = await response.json();

        const templates = data.data || [];
        let count = 0;

        for (const tmpl of templates) {
            const now = new Date().toISOString();
            const bodyComponent = tmpl.components?.find((c: any) => c.type === 'BODY');
            const content = bodyComponent?.text || 'No content';

            const item = {
                pk: `TEMP#${tmpl.id}`,
                sk: 'METADATA',
                gsi1pk: 'TYPE#TEMPLATE',
                gsi1sk: now,
                id: tmpl.id,
                name: tmpl.name,
                category: tmpl.category,
                language: tmpl.language,
                status: tmpl.status,
                content: content,
                updated_at: now
            };

            await putItem(item);
            count++;
        }

        return NextResponse.json({ success: true, count, timestamp: new Date().toISOString() });
    } catch (error: any) {
        console.error('CRITICAL SYNC FAILURE:', error);
        return NextResponse.json({ 
            error: error.message || String(error),
            stack: error.stack
        }, { status: 500 });
    }
}
