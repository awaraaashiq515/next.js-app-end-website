import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "DEALER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const inquiries = await db.inquiry.findMany({
            where: {
                dealerId: user.userId
            },
            include: {
                vehicle: {
                    select: {
                        title: true,
                        make: true,
                        model: true,
                        price: true,
                        images: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ inquiries })
    } catch (error) {
        console.error("GET /api/dealer/inquiries error:", error)
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
    }
}
