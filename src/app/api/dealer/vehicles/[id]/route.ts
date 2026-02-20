import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { getDealerCapabilities } from "@/lib/dealer-subscription"

/**
 * GET /api/dealer/vehicles/[id]
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
        const vehicle = await db.dealerVehicle.findFirst({
            where: { id, dealerId: user.userId },
        })
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }
        return NextResponse.json({ vehicle })
    } catch (error) {
        console.error("GET /api/dealer/vehicles/[id] error:", error)
        return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 })
    }
}

/**
 * PATCH /api/dealer/vehicles/[id]
 * Edit vehicle details, status, or featured flag
 */
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
        const vehicle = await db.dealerVehicle.findFirst({
            where: { id, dealerId: user.userId },
        })
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }

        const body = await request.json()
        const { isFeatured, ...rest } = body

        // If trying to set featured, check capability
        if (isFeatured === true) {
            const caps = await getDealerCapabilities(user.userId)
            if (!caps.canFeatureVehicles) {
                return NextResponse.json(
                    { error: "You need an active Featured or Combo plan to mark vehicles as featured." },
                    { status: 403 }
                )
            }
            // Check featured count limit
            const featuredCount = await db.dealerVehicle.count({
                where: { dealerId: user.userId, isFeatured: true, id: { not: id } },
            })
            if (featuredCount >= caps.maxFeaturedCars) {
                return NextResponse.json(
                    { error: `You have reached your featured vehicle limit (${caps.maxFeaturedCars}).` },
                    { status: 403 }
                )
            }
        }

        const updateData: Record<string, unknown> = { ...rest }
        if (isFeatured !== undefined) {
            updateData.isFeatured = isFeatured
            updateData.featuredAt = isFeatured ? new Date() : null
        }
        if (rest.year) updateData.year = parseInt(rest.year)
        if (rest.price) updateData.price = parseFloat(rest.price)
        if (rest.mileage) updateData.mileage = parseInt(rest.mileage)
        if (rest.engineCC) updateData.engineCC = parseInt(rest.engineCC)

        if (rest.modifications) {
            updateData.modifications = typeof rest.modifications === 'string' ? rest.modifications : JSON.stringify(rest.modifications)
        }
        if (rest.images) {
            updateData.images = typeof rest.images === 'string' ? rest.images : JSON.stringify(rest.images)
        }

        // Add remaining detailed fields
        if (rest.ownerType) updateData.ownerType = rest.ownerType
        if (rest.registrationNumber) updateData.registrationNumber = rest.registrationNumber
        if (rest.insuranceDetails) updateData.insuranceDetails = rest.insuranceDetails
        if (rest.overallCondition) updateData.overallCondition = rest.overallCondition
        if (rest.accidentHistory) updateData.accidentHistory = rest.accidentHistory
        if (rest.serviceHistory) updateData.serviceHistory = rest.serviceHistory
        if (rest.healthStatus) updateData.healthStatus = rest.healthStatus
        if (rest.videoUrl) updateData.videoUrl = rest.videoUrl
        if (rest.city) updateData.city = rest.city
        if (rest.state) updateData.state = rest.state

        // Professional Listing Extensions
        if (rest.tyreLife) updateData.tyreLife = rest.tyreLife
        if (rest.batteryStatus) updateData.batteryStatus = rest.batteryStatus
        if (rest.serviceCount) updateData.serviceCount = parseInt(rest.serviceCount as string)
        if (rest.lastServiceKM) updateData.lastServiceKM = parseInt(rest.lastServiceKM as string)
        if (rest.lastServiceDate) updateData.lastServiceDate = rest.lastServiceDate
        if (rest.spareKey) updateData.spareKey = rest.spareKey

        // Grading Matrix
        if (rest.engineGrade) updateData.engineGrade = rest.engineGrade
        if (rest.transmissionGrade) updateData.transmissionGrade = rest.transmissionGrade
        if (rest.exteriorGrade) updateData.exteriorGrade = rest.exteriorGrade
        if (rest.interiorGrade) updateData.interiorGrade = rest.interiorGrade

        // Booleans
        if (rest.accidentFree !== undefined) updateData.accidentFree = rest.accidentFree === true || rest.accidentFree === 'true'
        if (rest.floodAffected !== undefined) updateData.floodAffected = rest.floodAffected === true || rest.floodAffected === 'true'

        // Professional Specs
        if (rest.bodyType) updateData.bodyType = rest.bodyType
        if (rest.seatingCapacity) updateData.seatingCapacity = parseInt(rest.seatingCapacity as string)
        if (rest.driveType) updateData.driveType = rest.driveType
        if (rest.insuranceCompany) updateData.insuranceCompany = rest.insuranceCompany
        if (rest.insuranceExpiry) updateData.insuranceExpiry = rest.insuranceExpiry
        if (rest.rtoLocation) updateData.rtoLocation = rest.rtoLocation

        // PDI Fields
        if (rest.pdiStatus) updateData.pdiStatus = rest.pdiStatus
        if (rest.pdiType) updateData.pdiType = rest.pdiType
        if (rest.pdiFiles) {
            updateData.pdiFiles = typeof rest.pdiFiles === 'string' ? rest.pdiFiles : JSON.stringify(rest.pdiFiles)
        }

        // RC Available
        if (rest.rcAvailable !== undefined) updateData.rcAvailable = rest.rcAvailable

        const updated = await db.dealerVehicle.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json({ vehicle: updated })
    } catch (error) {
        console.error("PATCH /api/dealer/vehicles/[id] error:", error)
        return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 })
    }
}

/**
 * DELETE /api/dealer/vehicles/[id]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { id } = await params
        const vehicle = await db.dealerVehicle.findFirst({
            where: { id, dealerId: user.userId },
        })
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }
        await db.dealerVehicle.delete({ where: { id } })
        return NextResponse.json({ message: "Vehicle deleted successfully" })
    } catch (error) {
        console.error("DELETE /api/dealer/vehicles/[id] error:", error)
        return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
    }
}
