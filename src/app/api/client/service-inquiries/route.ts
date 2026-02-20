import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

// GET /api/client/service-inquiries - list all inquiries for the current client
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const inquiries = await db.serviceInquiry.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: "desc" },
            include: {
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
                _count: { select: { messages: true } },
            },
        })

        return NextResponse.json({ inquiries })
    } catch (error) {
        console.error("GET /api/client/service-inquiries error:", error)
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
    }
}

// POST /api/client/service-inquiries - create a new inquiry
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await request.json()
        const { subject, description } = body

        if (!subject?.trim() || !description?.trim()) {
            return NextResponse.json({ error: "Subject and description are required" }, { status: 400 })
        }

        const inquiry = await db.serviceInquiry.create({
            data: {
                userId: user.userId,
                subject: subject.trim(),
                description: description.trim(),
                status: "PENDING",
            },
        })

        return NextResponse.json({ inquiry, message: "Inquiry submitted successfully" }, { status: 201 })
    } catch (error) {
        console.error("POST /api/client/service-inquiries error:", error)
        return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 })
    }
}
