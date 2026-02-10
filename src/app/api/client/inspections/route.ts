import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const inspections = await db.pDIInspection.findMany({
            where: {
                OR: [
                    { userId: user.userId },
                    { customerEmail: user.email }
                ]
            },
            orderBy: { inspectionDate: 'desc' },
            take: 20
        })

        return NextResponse.json({ inspections })

    } catch (error) {
        console.error("Inspections API error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
