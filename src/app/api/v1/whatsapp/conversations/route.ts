import { NextRequest, NextResponse } from 'next/server';
import { queryGSI1, scanTable } from '@/lib/aws/dynamo';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // GOD MODE: Raw, unfiltered scan for diagnostic purposes
        const response = await scanTable();
        console.log('DynamoDB Raw Fetch (Conversations):', response.Items?.length || 0);

        // Fetch ALL items from the table, filtering only for conversation type in memory
        const items = (response.Items || []).filter(item => 
            item.pk?.startsWith('CONV#') || item.gsi1pk === 'TYPE#CONVERSATION'
        );

        // Map fields if needed (ensuring compatibility with frontend)
        const mappedItems = items.map(item => ({
            ...item,
            id: item.id || item.pk?.replace('CONV#', ''),
            customer_name: item.customer_name || 'Legacy Customer',
            last_message: item.last_message || item.message_body || 'No content',
        }));
        
        // Sort by last_message_at descending
        mappedItems.sort((a: any, b: any) => 
            new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
        );

        return NextResponse.json({ conversations: mappedItems });
    } catch (error: any) {
        console.error('[API] Get Conversations Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
