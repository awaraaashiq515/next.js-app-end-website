import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userPackages = await db.userPackage.findMany({
            where: {
                userId: user.userId
            },
            include: {
                package: true
            },
            orderBy: {
                purchasedAt: 'desc'
            }
        })

        return NextResponse.json({ userPackages })

    } catch (error) {
        console.error("Packages API error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
