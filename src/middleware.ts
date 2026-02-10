import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
)

// Routes that require authentication
const protectedRoutes = ["/admin", "/client"]

// Routes that require ADMIN role
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if route requires protection
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (!isProtectedRoute) {
        return NextResponse.next()
    }

    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
        // Redirect to login if no token
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    try {
        // Verify token
        const { payload } = await jwtVerify(token, JWT_SECRET)

        // Check admin role for admin routes
        if (isAdminRoute && payload.role !== "ADMIN") {
            // Redirect to unauthorized page
            return NextResponse.redirect(new URL("/unauthorized", request.url))
        }

        // Add user info to request headers for use in server components
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set("x-user-id", payload.userId as string)
        requestHeaders.set("x-user-role", payload.role as string)

        return NextResponse.next({
            request: {
                headers: requestHeaders
            }
        })

    } catch (error) {
        // Invalid token, redirect to login
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }
}

export const config = {
    matcher: [
        // Match all admin routes
        "/admin/:path*",
        // Match all client routes
        "/client/:path*",
        // Add more protected routes here as needed
    ]
}
