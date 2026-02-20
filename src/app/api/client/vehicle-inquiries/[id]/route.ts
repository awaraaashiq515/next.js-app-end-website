import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

/**
 * GET /api/client/vehicle-inquiries/[id]
 * Returns inquiry details + chat messages for the logged-in client.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "CLIENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Fetch inquiry (must belong to this client via userId)
        const rows = await db.$queryRaw<any[]>`
            SELECT
                i.id, i.customerName, i.customerMobile, i.message,
                i.status, i.adminNotes, i.createdAt, i.updatedAt,
                v.id AS vehicleId, v.title AS vehicleTitle, v.make AS vehicleMake,
                v.model AS vehicleModel, v.price AS vehiclePrice, v.images AS vehicleImages,
                u.name AS dealerName, u.dealerBusinessName AS dealerBusinessName,
                u.dealerCity AS dealerCity, u.mobile AS dealerMobile
            FROM Inquiry i
            JOIN DealerVehicle v ON i.vehicleId = v.id
            JOIN User u ON i.dealerId = u.id
            WHERE i.id = ${id} AND i.userId = ${user.userId}
            LIMIT 1
        `

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
        }

        const inq = rows[0]

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
            createdAt: inq.createdAt,
            vehicle: {
                id: inq.vehicleId,
                title: inq.vehicleTitle,
                make: inq.vehicleMake,
                model: inq.vehicleModel,
                price: inq.vehiclePrice,
                images: inq.vehicleImages,
            },
            dealer: {
                name: inq.dealerName,
                businessName: inq.dealerBusinessName,
                city: inq.dealerCity,
                mobile: inq.dealerMobile,
            },
        }

        return NextResponse.json({ inquiry, messages })
    } catch (error) {
        console.error("GET /api/client/vehicle-inquiries/[id] error:", error)
        return NextResponse.json({ error: "Failed to fetch inquiry" }, { status: 500 })
    }
}
