import { NextRequest, NextResponse } from 'next/server';
import { putItem } from '@/lib/aws/dynamo';
import { getAuthSession } from '@/lib/auth';

import { serverEnv } from '@/lib/server-env';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const WHATSAPP_ACCESS_TOKEN = serverEnv.META_TOKEN;
        const WHATSAPP_BUSINESS_ID = serverEnv.META_BIZ_ID;

        console.log("META TOKEN LENGTH (Sync):", WHATSAPP_ACCESS_TOKEN?.length || 0);

        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_BUSINESS_ID) {
            throw new Error('Meta API environment variables (WHATSAPP_ACCESS_TOKEN or WHATSAPP_BUSINESS_ID) are missing.');
        }

        const apiUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_BUSINESS_ID}/message_templates`;
        
        console.log('Syncing templates from Meta API:', apiUrl);
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Meta API Error: ${JSON.stringify(errorData)}`);
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
        console.error('META SYNC ERROR:', error);
        return NextResponse.json({ 
            error: error.message || String(error),
            stack: error.stack,
            code: error.code,
            details: error
        }, { status: 500 });
    }
}
