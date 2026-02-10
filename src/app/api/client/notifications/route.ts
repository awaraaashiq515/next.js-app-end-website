import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/insurance-service'

/**
 * GET - Get user's notifications
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const unreadOnly = searchParams.get('unreadOnly') === 'true'
        const limit = parseInt(searchParams.get('limit') || '20')

        const notifications = await getUserNotifications(user.userId, unreadOnly, limit)

        return NextResponse.json(notifications)
    } catch (error: any) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 })
    }
}

/**
 * PATCH - Mark notification(s) as read
 */
export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { notificationId, markAll } = body

        if (markAll) {
            await markAllNotificationsAsRead(user.userId)
            return NextResponse.json({ success: true, message: 'All notifications marked as read' })
        }

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
        }

        await markNotificationAsRead(notificationId)
        return NextResponse.json({ success: true, message: 'Notification marked as read' })
    } catch (error: any) {
        console.error('Error marking notification:', error)
        return NextResponse.json({ error: error.message || 'Failed to update notification' }, { status: 500 })
    }
}
