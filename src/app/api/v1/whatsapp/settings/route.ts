import { NextRequest, NextResponse } from 'next/server';
import { getItem, putItem } from '@/lib/aws/dynamo';

export async function GET(req: NextRequest) {
    try {
        const { Item } = await getItem('SETTINGS#SYSTEM', 'METADATA');
        return NextResponse.json(Item || { api_v1_enabled: true });
    } catch (error: any) {
        return NextResponse.json({ api_v1_enabled: true });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const updates = await req.json();
        const { Item } = await getItem('SETTINGS#SYSTEM', 'METADATA');
        
        const updatedItem = { 
            pk: 'SETTINGS#SYSTEM',
            sk: 'METADATA',
            gsi1pk: 'TYPE#SETTING',
            ...(Item || {}), 
            ...updates 
        };
        await putItem(updatedItem);
        return NextResponse.json(updatedItem);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
