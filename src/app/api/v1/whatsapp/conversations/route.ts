import { NextRequest, NextResponse } from 'next/server';
import { queryGSI1, scanTable } from '@/lib/aws/dynamo';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let items = [];
        
        // If Super Admin, fetch ALL items via Scan (to ensure we see legacy orphans too)
        if (session.role === 'super_admin') {
            const response = await scanTable();
            items = (response.Items || []).filter(item => item.pk?.startsWith('CONV#'));
        } else {
            // For Organizers: Query GSI1 with tenant_id filter
            // (Note: Currently queryGSI1 doesn't support FilterExpression, so we'll filter in JS for now or update dynamo.ts)
            const response = await queryGSI1('TYPE#CONVERSATION');
            items = (response.Items || []).filter(item => item.tenant_id === session.id || item.tenant_id === session.email);
        }
        
        // Sort by last_message_at descending
        items.sort((a: any, b: any) => 
            new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
        );

        return NextResponse.json({ conversations: items });
    } catch (error: any) {
        console.error('[API] Get Conversations Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
