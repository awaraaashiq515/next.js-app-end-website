import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { vehicleId, customerName, customerMobile, message } = body

        if (!vehicleId || !customerName || !customerMobile) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Verify vehicle exists and get dealerId
        const vehicle = await db.dealerVehicle.findUnique({
            where: { id: vehicleId },
            select: { dealerId: true }
        })

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }

        const inquiry = await db.inquiry.create({
            data: {
                vehicleId,
                dealerId: vehicle.dealerId,
                customerName,
                customerMobile,
                message: message || null,
                status: "PENDING"
            }
        })

        return NextResponse.json({ inquiry, message: "Inquiry sent successfully" }, { status: 201 })
    } catch (error) {
        console.error("POST /api/inquiries error:", error)
        return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 })
    }
}
