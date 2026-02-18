import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';

/**
 * GET /api/dealer/profile
 * Fetch current dealer profile information
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'DEALER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dealer = await db.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                dealerBusinessName: true,
                dealerGstNumber: true,
                dealerCity: true,
                dealerState: true,
                dealerBankName: true,
                dealerAccountNum: true,
                dealerIfscCode: true,
            }
        });

        if (!dealer) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ dealer });
    } catch (error) {
        console.error('Error fetching dealer profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/dealer/profile
 * Update dealer profile information
 */
export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'DEALER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        const updatedDealer = await db.user.update({
            where: { id: user.userId },
            data: {
                name: data.name,
                mobile: data.mobile,
                dealerBusinessName: data.dealerBusinessName,
                dealerGstNumber: data.dealerGstNumber,
                dealerCity: data.dealerCity,
                dealerState: data.dealerState,
                dealerBankName: data.dealerBankName,
                dealerAccountNum: data.dealerAccountNum,
                dealerIfscCode: data.dealerIfscCode,
            }
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            dealer: updatedDealer
        });
    } catch (error) {
        console.error('Error updating dealer profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
