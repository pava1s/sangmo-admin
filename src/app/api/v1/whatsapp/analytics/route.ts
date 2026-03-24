export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { queryGSI1 } from '@/lib/aws/dynamo';

export async function GET() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const isoThreshold = sevenDaysAgo.toISOString();

        // 1. Fetch Messages
        const msgRes = await queryGSI1('TYPE#MESSAGE');
        const messages = (msgRes.Items || []).filter((m: any) => m.created_at >= isoThreshold);

        // Aggregate volume
        const volumeMap = new Map();
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            volumeMap.set(dateStr, { date: dateStr, incoming: 0, outgoing: 0 });
        }

        messages.forEach((msg: any) => {
            const date = msg.created_at.split('T')[0];
            if (volumeMap.has(date)) {
                const entry = volumeMap.get(date);
                if (msg.direction === 'inbound') entry.incoming++;
                else entry.outgoing++;
            }
        });

        const volumeData = Array.from(volumeMap.values()).sort((a: any, b: any) => a.date.localeCompare(b.date));

        // 2. Fetch Conversations
        const convRes = await queryGSI1('TYPE#CONVERSATION');
        const conversations = convRes.Items || [];

        let openCount = 0;
        let closedCount = 0;
        const teamStats: any = { Sales: 0, Support: 0, Tech: 0, Unassigned: 0 };

        conversations.forEach((conv: any) => {
            if (conv.status === 'open') openCount++;
            else closedCount++;

            const team = conv.assigned_team || 'Unassigned';
            if (teamStats[team] !== undefined) teamStats[team]++;
            else teamStats.Unassigned++;
        });

        const teamData = Object.entries(teamStats).map(([name, value]) => ({ name, value }));

        return NextResponse.json({
            volume: volumeData,
            teamDistribution: teamData,
            totalMessages: messages.length,
            openConversations: openCount,
            closedConversations: closedCount
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
