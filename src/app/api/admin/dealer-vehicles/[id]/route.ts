import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

/**
 * DELETE /api/admin/dealer-vehicles/[id]
 * Admin delete any dealer vehicle
 *
 * PATCH /api/admin/dealer-vehicles/[id]
 * Admin update vehicle (set featured, status, etc.)
 */

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const vehicle = await db.dealerVehicle.findUnique({ where: { id } })
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }

        await db.dealerVehicle.delete({ where: { id } })
        return NextResponse.json({ message: "Vehicle deleted successfully" })
    } catch (error) {
        console.error("DELETE /api/admin/dealer-vehicles/[id] error:", error)
        return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        const vehicle = await db.dealerVehicle.findUnique({ where: { id } })
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }

        const updateData: Record<string, unknown> = {}
        if (body.isFeatured !== undefined) {
            updateData.isFeatured = body.isFeatured
            updateData.featuredAt = body.isFeatured ? new Date() : null
        }
        if (body.status !== undefined) updateData.status = body.status

        // PDI Management
        if (body.pdiStatus !== undefined) updateData.pdiStatus = body.pdiStatus
        if (body.pdiType !== undefined) updateData.pdiType = body.pdiType
        if (body.pdiFiles !== undefined) {
            updateData.pdiFiles = body.pdiFiles ? (typeof body.pdiFiles === 'string' ? body.pdiFiles : JSON.stringify(body.pdiFiles)) : null
        }

        const updated = await db.dealerVehicle.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json({ vehicle: updated })
    } catch (error) {
        console.error("PATCH /api/admin/dealer-vehicles/[id] error:", error)
        return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 })
    }
}
