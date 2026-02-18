import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';

/**
 * GET /api/dealer/packages/[packageId]
 * Get single package details
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ packageId: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'DEALER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Await params (Next.js 15 requirement)
        const { packageId } = await params;

        const packageData = await db.dealerPackage.findUnique({
            where: { id: packageId },
        });

        if (!packageData) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ package: packageData });
    } catch (error) {
        console.error('Error fetching package:', error);
        return NextResponse.json(
            { error: 'Failed to fetch package' },
            { status: 500 }
        );
    }
}
