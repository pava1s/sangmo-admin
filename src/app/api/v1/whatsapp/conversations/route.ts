import { NextRequest, NextResponse } from 'next/server';
import { queryGSI1 } from '@/lib/aws/dynamo';

export async function GET(req: NextRequest) {
    try {
        // Fetch all conversations using GSI1PK = 'TYPE#CONVERSATION'
        const response = await queryGSI1('TYPE#CONVERSATION');
        
        // Sort by last_message_at descending
        const items = (response.Items || []).sort((a: any, b: any) => 
            new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        );

        return NextResponse.json({ conversations: items });
    } catch (error: any) {
        console.error('[API] Get Conversations Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
