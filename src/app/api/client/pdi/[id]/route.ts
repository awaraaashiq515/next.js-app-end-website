import { NextResponse } from "next/server"
import { getPDIInspection } from "@/services/pdi-service"
import { getCurrentUser } from "@/lib/auth/jwt"

// GET /api/client/pdi/[id] - Get single PDI inspection for client view
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const inspection = await getPDIInspection(id)

        if (!inspection) {
            return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
        }

        // If user is not admin, they can only view their own inspections
        if (user.role !== "ADMIN" && inspection.userId !== user.userId) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        return NextResponse.json(inspection)
    } catch (error) {
        console.error("Error fetching inspection:", error)
        return NextResponse.json(
            { error: "Failed to fetch inspection" },
            { status: 500 }
        )
    }
}
