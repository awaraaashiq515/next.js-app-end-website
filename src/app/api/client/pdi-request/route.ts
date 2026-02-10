import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db as prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
    try {
        // @ts-ignore - user type might differ in dev vs prod, ensuring runtime safety if property exists
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Access userId correctly based on JWTPayload interface
        // Note: If JWTPayload has userId, use it. If it has id, use that.
        // The file src/lib/auth/jwt.ts showed "userId".
        // We will cast/check safely if needed, but for now assuming userId matches JWT definition.
        const userId = user.userId || (user as any).id

        // Check if model exists on prisma instance (detect stale client)
        if (!prisma.pDIConfirmationRequest) {
            console.error("❌ Prisma Client is stale. pDIConfirmationRequest is undefined. RESTART SERVER.")
            return NextResponse.json({
                error: "Server update required. Please restart your dev server to load new database changes.",
                code: "STALE_CLIENT"
            }, { status: 500 })
        }

        try {
            const request = await prisma.pDIConfirmationRequest.findFirst({
                where: { userId: userId },
                orderBy: { createdAt: "desc" },
            })

            return NextResponse.json({ request })
        } catch (dbError: any) {
            // Handle case where migration hasn't been run yet
            if (dbError.message?.includes('no such column') || dbError.message?.includes('vehicleName')) {
                console.error("❌ Database migration required. Please run: npx prisma migrate dev")
                return NextResponse.json({
                    error: "Database migration required. Please run the migration script.",
                    code: "MIGRATION_REQUIRED"
                }, { status: 500 })
            }
            throw dbError
        }
    } catch (error) {
        console.error("Error fetching PDI request:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = user.userId || (user as any).id

        // Check system settings to see if packages are required
        const { arePackagesEnabled } = await import("@/services/settings.service")
        const packagesRequired = await arePackagesEnabled()

        let activePackage = null

        if (packagesRequired) {
            // Packages are enabled - check for active package
            activePackage = await prisma.userPackage.findFirst({
                where: {
                    userId: userId,
                    status: "ACTIVE",
                },
                include: { package: true }
            })

            if (!activePackage) {
                return NextResponse.json({
                    error: "Package required. Please select a package to submit your PDI request.",
                    code: "PACKAGE_REQUIRED"
                }, { status: 403 })
            }
        }
        // If packages are disabled, skip package validation

        // Check for existing pending request
        const existingRequest = await prisma.pDIConfirmationRequest.findFirst({
            where: { userId: userId, status: "PENDING" }
        })

        if (existingRequest) {
            return NextResponse.json({ error: "You already have a pending request." }, { status: 400 })
        }

        const body = await req.json()

        // Validate required fields
        if (!body.vehicleName || !body.vehicleModel || !body.location) {
            return NextResponse.json({
                error: "Vehicle name, model, and location are required"
            }, { status: 400 })
        }

        const request = await prisma.pDIConfirmationRequest.create({
            data: {
                userId: userId,
                vehicleName: body.vehicleName,
                vehicleModel: body.vehicleModel,
                location: body.location,
                preferredDate: body.preferredDate ? new Date(body.preferredDate) : null,
                notes: body.notes || "",
                status: "PENDING",
            }
        })

        return NextResponse.json({ request })

    } catch (error) {
        console.error("Error creating PDI request:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}


