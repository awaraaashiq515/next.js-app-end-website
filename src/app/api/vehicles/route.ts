import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/vehicles
 * Public endpoint to list vehicles with filters
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type") // CAR, BIKE
        const make = searchParams.get("make")
        const minPrice = searchParams.get("minPrice")
        const maxPrice = searchParams.get("maxPrice")
        const minYear = searchParams.get("minYear")
        const isFeatured = searchParams.get("isFeatured") === "true"

        const now = new Date()

        // Filter for active dealers with active subscriptions
        const activeDealers = await db.dealerSubscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: { gte: now },
            },
            select: { dealerId: true },
        })

        const dealerIds = activeDealers.map(d => d.dealerId)

        const where: any = {
            status: "ACTIVE",
            dealerId: { in: dealerIds },
        }

        if (type) where.vehicleType = type
        if (make) where.make = { contains: make, mode: 'insensitive' }
        if (isFeatured) where.isFeatured = true

        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = parseFloat(minPrice)
            if (maxPrice) where.price.lte = parseFloat(maxPrice)
        }

        if (minYear) {
            where.year = { gte: parseInt(minYear) }
        }

        const vehicles = await db.dealerVehicle.findMany({
            where,
            include: {
                dealer: {
                    select: {
                        id: true,
                        name: true,
                        dealerBusinessName: true,
                        dealerCity: true,
                    }
                }
            },
            orderBy: isFeatured ? { featuredAt: 'desc' } : { createdAt: 'desc' },
            take: 50,
        })

        return NextResponse.json({ vehicles })
    } catch (error) {
        console.error("GET /api/vehicles error:", error)
        return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
    }
}
