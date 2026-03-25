import { NextRequest, NextResponse } from 'next/server';
import { queryGSI1, putItem } from '@/lib/aws/dynamo';
import { getAuthSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        const response = await queryGSI1('TYPE#CUSTOMER');
        let items = response.Items || [];

        // Filter if search provided
        if (search) {
            const lowSearch = search.toLowerCase();
            items = items.filter((c: any) => 
                c.full_name?.toLowerCase().includes(lowSearch) || 
                c.source_id?.includes(lowSearch) ||
                c.phone?.includes(lowSearch)
            );
        }

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

export async function POST(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const id = uuidv4();
        const now = new Date().toISOString();

        const item = {
            pk: `CUST#${id}`,
            sk: 'METADATA',
            gsi1pk: 'TYPE#CUSTOMER',
            gsi1sk: now,
            id,
            source_id: data.source_id, // Phone
            full_name: data.full_name,
            email: data.email,
            location: data.location,
            tags: data.tags || [],
            custom_data: data.custom_data || {},
            created_at: now
        };

        await putItem(item);
        return NextResponse.json({ success: true, contact: item });
    } catch (error: any) {
        console.error('[API] Create Contact Error:', error);
        return NextResponse.json({ 
            error: error.message || String(error),
            stack: error.stack
        }, { status: 500 });
    }
}
