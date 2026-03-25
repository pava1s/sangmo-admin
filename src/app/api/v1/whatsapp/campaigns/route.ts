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

        const response = await queryGSI1('TYPE#CAMPAIGN');
        const items = response.Items || [];

        return NextResponse.json(items);
    } catch (error: any) {
        console.error('DYNAMODB FETCH ERROR (Campaigns):', error);
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
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const id = uuidv4();
        const now = new Date().toISOString();

        const item = {
            pk: `CAMP#${id}`,
            sk: 'METADATA',
            gsi1pk: 'TYPE#CAMPAIGN',
            gsi1sk: now,
            id,
            name: data.name,
            templateName: data.templateName,
            templateContent: data.templateContent,
            variables: data.variables || {},
            targetTags: data.targetTags || [],
            status: 'Draft',
            sent: 0,
            failed: 0,
            audienceCount: 0,
            createdAt: now
        };

        await putItem(item);
        return NextResponse.json({ success: true, campaign: item });
    } catch (error: any) {
        console.error('DYNAMODB POST ERROR (Campaigns):', error);
        return NextResponse.json({ 
            error: error.message || String(error),
            stack: error.stack,
            code: error.code,
            details: error
        }, { status: 500 });
    }
}
