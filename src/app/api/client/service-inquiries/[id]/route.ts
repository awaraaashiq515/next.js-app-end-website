import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

// GET /api/client/service-inquiries/[id] - get a single inquiry for the current client
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { id } = await params

        const inquiry = await db.serviceInquiry.findFirst({
            where: { id, userId: user.userId },
        })

        if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })

        return NextResponse.json({ inquiry })
    } catch (error) {
        console.error("GET /api/client/service-inquiries/[id] error:", error)
        return NextResponse.json({ error: "Failed to fetch inquiry" }, { status: 500 })
    }
}
