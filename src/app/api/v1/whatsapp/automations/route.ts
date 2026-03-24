import { NextRequest, NextResponse } from 'next/server';
import { queryGSI1, putItem, deleteItem } from '@/lib/aws/dynamo';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    try {
        const response = await queryGSI1('TYPE#AUTOMATION');
        return NextResponse.json(response.Items || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const id = data.id || uuidv4();
        const now = new Date().toISOString();

        const item = {
            pk: `AUTO#${id}`,
            sk: 'METADATA',
            gsi1pk: 'TYPE#AUTOMATION',
            gsi1sk: now,
            ...data,
            id,
            created_at: now
        };

        await putItem(item);
        return NextResponse.json(item);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
