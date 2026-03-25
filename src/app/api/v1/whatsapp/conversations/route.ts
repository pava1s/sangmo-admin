import { NextRequest, NextResponse } from 'next/server';
import { scanTable } from '@/lib/aws/dynamo';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        /* 
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        */

        // FETCH OVERRIDE: Unfiltered ScanCommand to recovery ALL data
        const response = await scanTable();
        const items = response.Items || [];
        
        console.log('UNFILTERED SCAN RECOVERY:', items.length, 'total items found.');
        if (items.length > 0) {
            console.log('DATA PROBE (Item 0):', JSON.stringify(items[0], null, 2));
        }

        // Map every potential legacy field to the UI structure
        const mappedItems = items.map(item => {
            // Find the most likely message body
            const messageBody = item.last_message || 
                               item.message_body || 
                               item.msg_body || 
                               item.text || 
                               item.body || 
                               item.content || 
                               item.message || 
                               'No preview available';

            // Find the most likely customer name
            const customerName = item.customer_name || 
                                item.from_name || 
                                item.wa_name || 
                                item.display_name || 
                                item.name || 
                                (item.pk?.startsWith('CONV#') ? item.pk.replace('CONV#', '') : 'Legacy Contact');

            return {
                ...item, // Spread raw data as fallback per user request
                id: item.id || item.pk || `ID-${Math.random().toString(36).substr(2, 9)}`,
                customer_name: customerName,
                last_message: messageBody,
                message: messageBody, // Redundant field for UI compatibility
                last_message_at: item.last_message_at || item.created_at || item.timestamp || new Date(0).toISOString(),
                raw_data: item, // Explicit raw_data field for emergency UI debugging
            };
        });
        
        // Sort by last_message_at descending
        mappedItems.sort((a: any, b: any) => 
            new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
        );

        return NextResponse.json({ conversations: mappedItems });
    } catch (error: any) {
        console.error('CONVERSATIONS FETCH CRITICAL ERROR:', error);
        return NextResponse.json({ 
            error: error.message || String(error),
            stack: error.stack,
            details: error
        }, { status: 500 });
    }
}
