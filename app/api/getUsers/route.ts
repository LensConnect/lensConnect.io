import {NextResponse, NextRequest} from 'next/server'
import {db} from '@/app/src'
import {users, profiles} from '@/app/src/db/schema'
import {eq} from 'drizzle-orm'

export async function GET(req:NextRequest) {
    try {
        // 1. In GET requests, you should read variables from the URL search params, not the body
        const searchParams = req.nextUrl.searchParams
        const userId = searchParams.get('id')

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        // 2. Perform a LEFT JOIN to fetch both the user data AND their profile data
        const [result] = await db
            .select({
                id: users.id,
                email: users.email,
                fullname: users.fullname,
                role: users.role,
                // Profile fields
                userId: profiles.userId,
                phoneNumber: profiles.phoneNumber,
                imageUrl: profiles.imageUrl,
                bio: profiles.bio,
                website: profiles.website,
                location: profiles.location,
            })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.userId))
            .where(eq(users.id, Number(userId)))

        if (!result) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({
            message: "Profile fetched successfully",
            result
        })

    } catch(error) {
        console.error("Error fetching user profile:", error)
        return NextResponse.json({
            error: "Profile fetch failed"
        }, { status: 500 })
    }
}