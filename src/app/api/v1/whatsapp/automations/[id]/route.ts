import { NextRequest, NextResponse } from 'next/server';
import { getItem, putItem, deleteItem } from '@/lib/aws/dynamo';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const updates = await req.json();
        const { Item } = await getItem(`AUTO#${id}`, 'METADATA');
        if (!Item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const updatedItem = { ...Item, ...updates };
        await putItem(updatedItem);
        return NextResponse.json(updatedItem);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await deleteItem(`AUTO#${id}`, 'METADATA');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
