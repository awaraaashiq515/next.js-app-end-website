import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

// JWT Secret - In production, use environment variable
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
)

// Valid roles
export type Role = "ADMIN" | "CLIENT" | "DEALER" | "AGENT"

export interface JWTPayload {
    userId: string
    email: string
    name: string
    role: Role
}

// Sign a new JWT token
export async function signToken(payload: JWTPayload): Promise<string> {
    const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(JWT_SECRET)

    return token
}

// Verify and decode JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as unknown as JWTPayload
    } catch (error) {
        return null
    }
}

// Get token from cookies
export async function getTokenFromCookies(): Promise<string | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")
    return token?.value || null
}

// Get current user from token
export async function getCurrentUser(): Promise<JWTPayload | null> {
    const token = await getTokenFromCookies()
    if (!token) return null
    return verifyToken(token)
}

// Check if user has admin role
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === "ADMIN"
}

// Check if user has specific role
export async function hasRole(role: Role): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === role
}
