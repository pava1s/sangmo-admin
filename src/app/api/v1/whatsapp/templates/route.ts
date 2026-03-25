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

        const response = await queryGSI1('TYPE#TEMPLATE');
        const items = response.Items || [];

        // Map DynamoDB items to the expected Template interface
        const templates = items.map(item => ({
            id: item.id || item.pk?.replace('TEMP#', ''),
            name: item.name || item.template_name,
            category: item.category || 'MARKETING',
            language: item.language || 'en_US',
            status: item.status || 'Approved',
            content: item.content || item.body_text || 'No content preview available'
        }));

        return NextResponse.json(templates);
    } catch (error: any) {
        console.error('DYNAMODB FETCH ERROR (Templates):', error);
        return NextResponse.json({ 
            error: error.message || String(error),
            stack: error.stack,
            code: error.code,
            details: error
        }, { status: 500 });
    }
}
