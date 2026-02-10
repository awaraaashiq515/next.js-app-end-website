import { NextResponse } from "next/server"
import { loginSchema } from "@/lib/schemas/auth"
import { db } from "@/lib/db"
import { signToken, type Role } from "@/lib/auth/jwt"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 1. Validate input using the SAME schema as the frontend
        const result = loginSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            )
        }

        // 2. Find user in database
        const user = await db.user.findUnique({
            where: { email: body.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }

        // 3. Compare password with hashed password
        const passwordMatch = await bcrypt.compare(body.password, user.password)

        if (!passwordMatch) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }

        // 4. Check if user account is approved
        if (user.status === "PENDING") {
            return NextResponse.json(
                {
                    error: "🚫 Your account is pending admin approval.\nYou will receive an email notification once approved.",
                    status: "PENDING"
                },
                { status: 403 }
            )
        }

        if (user.status === "REJECTED") {
            return NextResponse.json(
                {
                    error: "Your account registration was not approved. Please contact support for more information.",
                    status: "REJECTED"
                },
                { status: 403 }
            )
        }

        if (user.status === "SUSPENDED") {
            return NextResponse.json(
                {
                    error: "Your account has been suspended. Please contact support.",
                    status: "SUSPENDED"
                },
                { status: 403 }
            )
        }

        // 5. Check OTP verification (if OTP is enabled)
        const otpSettings = await db.oTPSettings.findFirst()

        if (otpSettings?.emailOTPEnabled && !user.emailVerified) {
            return NextResponse.json(
                { error: "Please verify your email address before logging in." },
                { status: 403 }
            )
        }

        if (otpSettings?.mobileOTPEnabled && !user.mobileVerified) {
            return NextResponse.json(
                { error: "Please verify your mobile number before logging in." },
                { status: 403 }
            )
        }

        // 6. Generate JWT token with user info and role
        const token = await signToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role
        })

        // 7. Set token in httpOnly cookie
        const cookieStore = await cookies()
        cookieStore.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/"
        })

        // 8. Return user info (without password)
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
