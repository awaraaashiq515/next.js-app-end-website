import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { getDealerCapabilities } from "@/lib/dealer-subscription"

/**
 * GET /api/dealer/vehicles
 * List all vehicles for the authenticated dealer
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check dealer account status from DB
        const dbUser = await db.user.findUnique({ where: { id: user.userId }, select: { status: true } })
        if (dbUser?.status !== "APPROVED") {
            return NextResponse.json({ error: "Account not approved" }, { status: 403 })
        }

        const vehicles = await db.dealerVehicle.findMany({
            where: { dealerId: user.userId },
            orderBy: { createdAt: "desc" },
        })

        const caps = await getDealerCapabilities(user.userId)

        return NextResponse.json({ vehicles, capabilities: caps })
    } catch (error) {
        console.error("GET /api/dealer/vehicles error:", error)
        return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
    }
}

/**
 * POST /api/dealer/vehicles
 * Create a new vehicle listing
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const dbUser = await db.user.findUnique({ where: { id: user.userId }, select: { status: true } })
        if (dbUser?.status !== "APPROVED") {
            return NextResponse.json({ error: "Account not approved" }, { status: 403 })
        }

        const caps = await getDealerCapabilities(user.userId)
        if (!caps.canAddVehicles) {
            return NextResponse.json(
                { error: "You need an active Vehicle Add or Combo plan to list vehicles." },
                { status: 403 }
            )
        }

        // Check vehicle count limit
        const existingCount = await db.dealerVehicle.count({
            where: { dealerId: user.userId, status: { not: "SOLD" } },
        })
        if (existingCount >= caps.maxVehicles) {
            return NextResponse.json(
                { error: `You have reached your vehicle limit (${caps.maxVehicles}). Upgrade your plan to add more.` },
                { status: 403 }
            )
        }

        const body = await request.json()
        const {
            title, make, model, year, price, mileage, fuelType,
            transmission, color, description, vehicleType, city, state, images,
            ownerType, registrationNumber, insuranceDetails, overallCondition,
            accidentHistory, serviceHistory, healthStatus, modifications, videoUrl, engineCC,
            bodyType, seatingCapacity, driveType, insuranceCompany, insuranceExpiry, rtoLocation, metadata,
            lastServiceDate, lastServiceKM, serviceCount, spareKey,
            tyreLife, batteryStatus, engineGrade, transmissionGrade, exteriorGrade, interiorGrade,
            accidentFree, floodAffected, safetyFeatures, comfortFeatures
        } = body

        if (!title || !make || !model || !year || !price) {
            return NextResponse.json({ error: "Title, make, model, year, and price are required." }, { status: 400 })
        }

        const vehicle = await db.dealerVehicle.create({
            data: {
                dealerId: user.userId,
                title,
                make,
                model,
                year: parseInt(year),
                price: parseFloat(price),
                mileage: mileage ? parseInt(mileage) : null,
                fuelType: fuelType || null,
                transmission: transmission || null,
                color: color || null,
                description: description || null,
                vehicleType: vehicleType || "CAR",
                engineCC: engineCC ? parseInt(engineCC) : null,
                ownerType: ownerType || null,
                registrationNumber: registrationNumber || null,
                insuranceDetails: insuranceDetails || null,
                overallCondition: overallCondition || null,
                accidentHistory: accidentHistory || null,
                serviceHistory: serviceHistory || null,
                healthStatus: healthStatus || null,
                bodyType: bodyType || null,
                seatingCapacity: seatingCapacity ? parseInt(seatingCapacity) : null,
                driveType: driveType || null,
                insuranceCompany: insuranceCompany || null,
                insuranceExpiry: insuranceExpiry || null,
                rtoLocation: rtoLocation || null,
                lastServiceDate: lastServiceDate || null,
                lastServiceKM: lastServiceKM ? parseInt(lastServiceKM) : null,
                serviceCount: serviceCount ? parseInt(serviceCount) : 0,
                spareKey: spareKey || "Yes",
                tyreLife: tyreLife || null,
                batteryStatus: batteryStatus || null,
                engineGrade: engineGrade || null,
                transmissionGrade: transmissionGrade || null,
                exteriorGrade: exteriorGrade || null,
                interiorGrade: interiorGrade || null,
                accidentFree: accidentFree === true || accidentFree === 'true',
                floodAffected: floodAffected === true || floodAffected === 'true',
                metadata: JSON.stringify({
                    ...(typeof metadata === 'string' ? JSON.parse(metadata) : (metadata || {})),
                    safetyFeatures: typeof safetyFeatures === 'string' ? JSON.parse(safetyFeatures) : (safetyFeatures || []),
                    comfortFeatures: typeof comfortFeatures === 'string' ? JSON.parse(comfortFeatures) : (comfortFeatures || [])
                }),
                modifications: modifications ? (typeof modifications === 'string' ? modifications : JSON.stringify(modifications)) : null,
                videoUrl: videoUrl || null,
                city: city || null,
                state: state || null,
                images: images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null,
                status: "DRAFT",
            },
        })

        return NextResponse.json({ vehicle }, { status: 201 })
    } catch (error) {
        console.error("POST /api/dealer/vehicles error:", error)
        return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
    }
}
