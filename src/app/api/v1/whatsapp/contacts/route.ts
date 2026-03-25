import { NextRequest, NextResponse } from 'next/server';
import { queryGSI1 } from '@/lib/aws/dynamo';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await queryGSI1('TYPE#CUSTOMER');
        const items = response.Items || [];

        // Robust mapping for legacy contact fields
        const mappedItems = items.map(item => ({
            ...item,
            id: item.id || item.pk?.replace('CUST#', '') || item.source_id,
            full_name: item.full_name || item.name || item.wa_name || item.display_name || 'Legacy Contact',
            source_id: item.source_id || item.phone || item.pk?.replace('CUST#', ''),
            email: item.email || 'N/A',
            created_at: item.created_at || item.timestamp || new Date(0).toISOString()
        }));

        return NextResponse.json(mappedItems);
    } catch (error: any) {
        console.error('CONTACTS FETCH CRITICAL ERROR:', error);
        return NextResponse.json({ 
            error: error.message || String(error),
            stack: error.stack
        }, { status: 500 });
    }
}
