import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/jwt'

/**
 * Get PDI reports for the authenticated client user
 * Route: /api/client/pdi-reports
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Only allow CLIENT users to access this endpoint
        if (user.role !== 'CLIENT') {
            return NextResponse.json(
                { error: 'Access denied. This endpoint is for clients only.' },
                { status: 403 }
            )
        }

        // Fetch all PDI inspections for this client
        const inspections = await (prisma as any).pDIInspection.findMany({
            where: {
                userId: user.userId
            },
            select: {
                id: true,
                vehicleMake: true,
                vehicleModel: true,
                vehicleColor: true,
                vehicleYear: true,
                vin: true,
                customerName: true,
                inspectionDate: true,
                inspectedBy: true,
                status: true,
                pdfUrl: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({
            success: true,
            count: inspections.length,
            inspections
        })
    } catch (error: any) {
        console.error('Error fetching client PDI reports:', error)
        return NextResponse.json(
            { error: 'Failed to fetch reports', details: error.message },
            { status: 500 }
        )
    }
}
