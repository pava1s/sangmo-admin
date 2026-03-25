export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { queryGSI1, putItem } from '@/lib/aws/dynamo';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        const response = await queryGSI1('TYPE#CUSTOMER');
        let items = response.Items || [];

        if (search) {
            const lowSearch = search.toLowerCase();
            items = items.filter((c: any) => 
                c.full_name?.toLowerCase().includes(lowSearch) || 
                c.source_id?.includes(lowSearch)
            );
        }

        return NextResponse.json(items);
    } catch (error: any) {
        console.error('[API] Get Customers Error:', error);
        return NextResponse.json({ 
            error: error.message || String(error),
            stack: error.stack,
            code: error.code,
            details: error
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
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
        return NextResponse.json({ success: true, customer: item });
    } catch (error: any) {
        console.error('[API] Create Customer Error:', error);
        return NextResponse.json({ 
            error: error.message || String(error),
            stack: error.stack,
            code: error.code,
            details: error
        }, { status: 500 });
    }
}
