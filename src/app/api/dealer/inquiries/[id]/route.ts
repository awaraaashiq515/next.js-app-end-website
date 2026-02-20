import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

/**
 * GET  /api/dealer/inquiries/[id]  — full inquiry + messages
 * PATCH /api/dealer/inquiries/[id] — update status / adminNotes
 */

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Use raw SQL so the query still works even if Prisma types haven't been regenerated
        const rows = await db.$queryRaw<any[]>`
            SELECT
                i.id, i.customerName, i.customerMobile, i.message,
                i.status, i.adminNotes, i.createdAt, i.updatedAt, i.userId,
                v.id AS vehicleId, v.title AS vehicleTitle, v.make AS vehicleMake,
                v.model AS vehicleModel, v.price AS vehiclePrice, v.images AS vehicleImages
            FROM Inquiry i
            JOIN DealerVehicle v ON i.vehicleId = v.id
            WHERE i.id = ${id} AND i.dealerId = ${user.userId}
            LIMIT 1
        `

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
        }

        const inq = rows[0]

        // Fetch messages
        const messages = await db.$queryRaw<any[]>`
            SELECT id, senderType, senderId, message, createdAt
            FROM InquiryMessage
            WHERE inquiryId = ${id}
            ORDER BY createdAt ASC
        `

        const inquiry = {
            id: inq.id,
            customerName: inq.customerName,
            customerMobile: inq.customerMobile,
            message: inq.message,
            status: inq.status,
            adminNotes: inq.adminNotes,
            createdAt: inq.createdAt,
            updatedAt: inq.updatedAt,
            userId: inq.userId,
            vehicle: {
                id: inq.vehicleId,
                title: inq.vehicleTitle,
                make: inq.vehicleMake,
                model: inq.vehicleModel,
                price: inq.vehiclePrice,
                images: inq.vehicleImages,
            },
        }

        return NextResponse.json({ inquiry, messages })
    } catch (error) {
        console.error("GET /api/dealer/inquiries/[id] error:", error)
        return NextResponse.json({ error: "Failed to fetch inquiry" }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { status, adminNotes } = body

        const validStatuses = ["PENDING", "CONTACTED", "CLOSED", "SPAM"]
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const now = new Date().toISOString()

        // Verify ownership and update using raw SQL
        const check = await db.$queryRaw<any[]>`
            SELECT id FROM Inquiry WHERE id = ${id} AND dealerId = ${user.userId} LIMIT 1
        `
        if (!check || check.length === 0) {
            return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
        }

        if (status !== undefined && adminNotes !== undefined) {
            await db.$executeRaw`
                UPDATE Inquiry SET status = ${status}, adminNotes = ${adminNotes}, updatedAt = ${now}
                WHERE id = ${id} AND dealerId = ${user.userId}
            `
        } else if (status !== undefined) {
            await db.$executeRaw`
                UPDATE Inquiry SET status = ${status}, updatedAt = ${now}
                WHERE id = ${id} AND dealerId = ${user.userId}
            `
        } else if (adminNotes !== undefined) {
            await db.$executeRaw`
                UPDATE Inquiry SET adminNotes = ${adminNotes}, updatedAt = ${now}
                WHERE id = ${id} AND dealerId = ${user.userId}
            `
        }

        return NextResponse.json({ message: "Inquiry updated successfully" })
    } catch (error) {
        console.error("PATCH /api/dealer/inquiries/[id] error:", error)
        return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 })
    }
}
