export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { scanTable, updateTenantId } from '@/lib/aws/dynamo';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (session?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const scanRes = await scanTable();
        const items = scanRes.Items || [];
        const orphanItems = items.filter(item => !item.tenant_id);

        console.log(`[Patch] Found ${orphanItems.length} orphan items out of ${items.length}`);

        const results = [];
        for (const item of orphanItems) {
            try {
                await updateTenantId(item.pk, item.sk, 'pavansrinivas64@gmail.com');
                results.push({ pk: item.pk, sk: item.sk, status: 'SUCCESS' });
            } catch (err: any) {
                results.push({ pk: item.pk, sk: item.sk, status: 'FAILED', error: err.message });
            }
        }

        return NextResponse.json({
            message: `Patch completed. Processed ${orphanItems.length} items.`,
            totalItems: items.length,
            patchedCount: results.filter(r => r.status === 'SUCCESS').length,
            details: results
        });
    } catch (error: any) {
        console.error('[API] Patch Data Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
