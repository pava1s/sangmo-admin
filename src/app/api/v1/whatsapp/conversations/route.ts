import { NextRequest, NextResponse } from 'next/server';
import { queryGSI1, scanTable } from '@/lib/aws/dynamo';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // FETCH OVERRIDE: Raw scan to recover all 302 legacy items
        const response = await scanTable();
        const items = response.Items || [];
        console.log('RECOVERY SCAN: Exposed', items.length, 'raw items.');
        
        if (items.length > 0) {
            console.log('RAW DYNAMO DATA (First Item):', JSON.stringify(items[0], null, 2));
        }

        // Map minimum fields so frontend doesn't crash on undefined attributes
        const mappedItems = items.map(item => ({
            ...item,
            id: item.id || item.pk || `LEGACY-${Math.random().toString(36).substr(2, 9)}`,
            customer_name: item.customer_name || item.from_name || item.wa_name || item.display_name || item.name || 'Legacy Contact',
            last_message: item.last_message || item.message_body || item.msg_body || item.text || item.body || item.content || 'No preview available',
            last_message_at: item.last_message_at || item.created_at || item.timestamp || new Date(0).toISOString(),
        }));
        
        // Sort by last_message_at descending
        mappedItems.sort((a: any, b: any) => 
            new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
        );

        return NextResponse.json({ conversations: mappedItems });
    } catch (error: any) {
        console.error('DYNAMODB FETCH ERROR (Conversations):', error);
        return NextResponse.json({ 
            error: error.message || String(error),
            stack: error.stack,
            code: error.code,
            details: error
        }, { status: 500 });
    }
}

