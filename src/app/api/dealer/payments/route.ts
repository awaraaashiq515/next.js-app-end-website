import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { calculateSubscriptionEndDate } from '@/lib/payment-utils';

/**
 * POST /api/dealer/payments
 * Create a new payment record and pending subscription
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'DEALER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { packageId, paymentMethod, upiTransactionId } = data;

        if (!packageId || !paymentMethod) {
            return NextResponse.json({ error: 'Package ID and Payment Method are required' }, { status: 400 });
        }

        // Fetch package details
        const pkg = await db.dealerPackage.findUnique({
            where: { id: packageId }
        });

        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        }

        // Create Payment record
        const payment = await db.payment.create({
            data: {
                packageId: pkg.id,
                amount: pkg.price,
                method: paymentMethod,
                status: paymentMethod === 'UPI' ? 'PAID' : 'PENDING',
                transactionId: upiTransactionId || null,
                paymentDate: paymentMethod === 'UPI' ? new Date() : null,
            }
        });

        // Create Dealer Subscription record
        const startDate = new Date();
        const endDate = calculateSubscriptionEndDate(startDate, pkg.durationDays);

        // If payment is UPI, status is ACTIVE, otherwise PENDING_APPROVAL
        const subscriptionStatus = paymentMethod === 'UPI' ? 'ACTIVE' : 'PENDING_APPROVAL';

        const subscription = await db.dealerSubscription.create({
            data: {
                dealerId: user.userId,
                packageId: pkg.id,
                paymentId: payment.id,
                startDate,
                endDate,
                status: subscriptionStatus,
                autoRenew: true,
            }
        });

        return NextResponse.json({
            message: paymentMethod === 'UPI' ? 'Payment successful and subscription activated!' : 'Payment submitted and awaiting approval.',
            subscription,
            payment,
            requiresApproval: paymentMethod !== 'UPI'
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
        );
    }
}
