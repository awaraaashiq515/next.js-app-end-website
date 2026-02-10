import { NextResponse } from 'next/server'
import * as pdiService from '@/services/pdi-service'
import { getCurrentUser } from '@/lib/auth/jwt'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const inspection = await pdiService.getPDIInspection(id)

        if (!inspection) {
            return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
        }

        // Security check: Ensure the inspection belongs to the current user
        // (Either via userId or customerEmail matching)
        if (inspection.userId !== user.userId && inspection.customerEmail !== user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json(inspection)
    } catch (error) {
        console.error('Failed to fetch client PDI inspection:', error)
        return NextResponse.json(
            { error: 'Failed to load inspection details' },
            { status: 500 }
        )
    }
}
