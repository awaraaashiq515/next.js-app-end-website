import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Count active packages
        const activePackagesCount = await db.userPackage.count({
            where: {
                userId: user.userId,
                status: "ACTIVE"
            }
        })

        // Calculate total PDIs remaining
        const userPackages = await db.userPackage.findMany({
            where: {
                userId: user.userId,
                status: "ACTIVE"
            }
        })
        const totalPdiRemaining = userPackages.reduce((acc, curr) => acc + curr.pdiRemaining, 0)

        // Count inspections (linked by email for now as per schema)
        const inspectionsCount = await db.pDIInspection.count({
            where: {
                customerEmail: user.email
            }
        })

        // In a real app, we'd have an Appointment model
        const appointmentsCount = 0

        return NextResponse.json({
            stats: [
                { label: "Active Packages", value: activePackagesCount.toString() },
                { label: "PDI Balance", value: totalPdiRemaining.toString() },
                { label: "Total Inspections", value: inspectionsCount.toString() },
                { label: "Appointments", value: appointmentsCount.toString() }
            ]
        })

    } catch (error) {
        console.error("Stats API error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
