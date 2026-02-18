import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

/**
 * GET /api/admin/dealer-vehicles
 * List all dealer vehicles with dealer info (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")
        const featured = searchParams.get("featured")

        const where: Record<string, unknown> = {}
        if (status && status !== "ALL") where.status = status
        if (featured === "true") where.isFeatured = true

        const vehicles = await db.dealerVehicle.findMany({
            where,
            include: {
                dealer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        dealerBusinessName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ vehicles })
    } catch (error) {
        console.error("GET /api/admin/dealer-vehicles error:", error)
        return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
    }
}
