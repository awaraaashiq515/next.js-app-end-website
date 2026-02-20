import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

/**
 * GET /api/client/vehicle-inquiries
 * Returns all vehicle inquiries submitted by the currently-logged-in client.
 * Uses $queryRaw because the Prisma generated types may not yet include the
 * newly-added `userId` column until `prisma generate` is run.
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "CLIENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Use raw SQL to query and join vehicle + dealer info, as Prisma types
        // may not yet reflect the newly added userId column.
        const rows = await db.$queryRaw<any[]>`
            SELECT
                i.id,
                i.customerName,
                i.customerMobile,
                i.message,
                i.status,
                i.createdAt,
                i.updatedAt,
                v.id         AS vehicleId,
                v.title      AS vehicleTitle,
                v.make       AS vehicleMake,
                v.model      AS vehicleModel,
                v.year       AS vehicleYear,
                v.price      AS vehiclePrice,
                v.images     AS vehicleImages,
                u.name       AS dealerName,
                u.dealerBusinessName AS dealerBusinessName,
                u.dealerCity AS dealerCity
            FROM Inquiry i
            JOIN DealerVehicle v ON i.vehicleId = v.id
            JOIN User u ON i.dealerId = u.id
            WHERE i.userId = ${user.userId}
            ORDER BY i.createdAt DESC
        `

        // Shape the rows into the expected structure
        const inquiries = rows.map((r: any) => ({
            id: r.id,
            customerName: r.customerName,
            customerMobile: r.customerMobile,
            message: r.message,
            status: r.status,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            vehicle: {
                id: r.vehicleId,
                title: r.vehicleTitle,
                make: r.vehicleMake,
                model: r.vehicleModel,
                year: r.vehicleYear,
                price: r.vehiclePrice,
                images: r.vehicleImages,
            },
            dealer: {
                name: r.dealerName,
                dealerBusinessName: r.dealerBusinessName,
                dealerCity: r.dealerCity,
            },
        }))

        return NextResponse.json({ inquiries })
    } catch (error) {
        console.error("GET /api/client/vehicle-inquiries error:", error)
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
    }
}
