import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';

/**
 * GET /api/dealer/packages
 * List all active dealer packages
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const packages = await db.dealerPackage.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { price: 'asc' },
        });

        const activeSub = await db.dealerSubscription.findFirst({
            where: {
                dealerId: user.userId,
                status: 'ACTIVE',
                endDate: { gte: new Date() }
            },
            include: { package: true }
        });

        return NextResponse.json({
            packages,
            activeSubscription: activeSub
        });
    } catch (error) {
        console.error('Error fetching dealer packages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch packages' },
            { status: 500 }
        );
    }
}
