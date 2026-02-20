import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

/**
 * GET  /api/client/vehicle-inquiries/[id]/messages
 * POST /api/client/vehicle-inquiries/[id]/messages
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "CLIENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Verify ownership
        const check = await db.$queryRaw<any[]>`
            SELECT id FROM Inquiry WHERE id = ${id} AND userId = ${user.userId} LIMIT 1
        `
        if (!check || check.length === 0) {
            return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
        }

        const messages = await db.$queryRaw<any[]>`
            SELECT m.id, m.senderType, m.senderId, m.message, m.createdAt, m.replyToId,
                   p.message as replyToText, p.senderType as replyToSenderType
            FROM InquiryMessage m
            LEFT JOIN InquiryMessage p ON m.replyToId = p.id
            WHERE m.inquiryId = ${id}
            ORDER BY m.createdAt ASC
        `

        return NextResponse.json({ messages })
    } catch (error) {
        console.error("GET /api/client/vehicle-inquiries/[id]/messages error:", error)
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "CLIENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const { message, replyToId } = await request.json()

        if (!message?.trim()) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        // Verify ownership
        const check = await db.$queryRaw<any[]>`
            SELECT id FROM Inquiry WHERE id = ${id} AND userId = ${user.userId} LIMIT 1
        `
        if (!check || check.length === 0) {
            return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
        }

        const msgId = randomUUID()
        const now = new Date().toISOString()

        await db.$executeRaw`
            INSERT INTO InquiryMessage (id, inquiryId, senderType, senderId, message, createdAt, replyToId)
            VALUES (${msgId}, ${id}, 'CUSTOMER', ${user.userId}, ${message.trim()}, ${now}, ${replyToId || null})
        `

        return NextResponse.json({
            message: {
                id: msgId,
                senderType: "CUSTOMER",
                message: message.trim(),
                createdAt: now,
                replyToId
            }
        }, { status: 201 })
    } catch (error) {
        console.error("POST /api/client/vehicle-inquiries/[id]/messages error:", error)
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
}
