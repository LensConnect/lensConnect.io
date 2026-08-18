import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/app/src'
import { photographer_profiles } from '@/app/src/db/schema'
import { cookies } from 'next/headers';
import { verifyToken, SessionPayload } from '@/lib/auth';
import {eq} from 'drizzle-orm';
import {users, profiles} from '@/app/src/db/schema';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      userId,
      fullname,
      email,
      role,
      phoneNumber,
      hourlyRate,
      experience,
      specialties,
      bio,
      availability,
      location,
      updatedAt,
    } = body

    // Validate required fields
    /* if (!userId || !fullname || !email || !role) {
      return NextResponse.json(
        { error: 'userId, fullname, email, and role are required' },
        { status: 400 }
      )
    }
 */
    await db.insert(photographer_profiles).values({
      userId: Number(userId),
      fullname,
      email,
      role,
      phoneNumber: phoneNumber || null,
      bio: bio || null,
      location: location || null,
      experience: Number(experience) || 0,
      hourlyRate: Number(hourlyRate) || 0,
      specialties: specialties || [],
      availability: availability ?? true,

    })

    return NextResponse.json(
      { message: 'Profile created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Profile creation error:', error)
    const message = error instanceof Error ? error.message : 'Profile creation failed'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}


export async function GET(req: NextRequest){
  try {
    const { searchParams } = new URL(req.url)
    const targetUserId = Number(searchParams.get('userId'))

    const photographer = await db.query.users.findFirst({
      where: (users, { eq, and }) => and(
        eq(users.id, targetUserId),
        eq(users.role, 'photographer')
      ),
      with: {
        photographer_profiles: true,
        profiles: true,
      },
    });

    if (photographer) {
      const pp = photographer.photographer_profiles;
      const p = photographer.profiles;
      return NextResponse.json({
        result: {
          id: photographer.id,
          fullname: pp?.fullname || photographer.fullname,
          email: pp?.email || photographer.email,
          role: photographer.role,
          phoneNumber: pp?.phoneNumber || p?.phoneNumber || '',
          bio: pp?.bio || p?.bio || '',
          location: pp?.location || p?.location || '',
          hourly_rate: pp?.hourlyRate || 0,
          experience: pp?.experience || 0,
          specialties: pp?.specialties || [],
          portfolio_url: pp?.portfolio_image_url?.[0] || '',
          profile_image_url: p?.imageUrl || '',
          website: p?.website || '',
        }
      }, { status: 200 })
    }

    const client = await db.query.users.findFirst({
      where: (users, { eq, and }) => and(
        eq(users.id, targetUserId),
        eq(users.role, 'client')
      ),
      with: {
        profiles: true,
      },
    });

    if (client) {
      const p = client.profiles;
      return NextResponse.json({
        result: {
          id: client.id,
          fullname: client.fullname,
          email: client.email,
          role: client.role,
          phoneNumber: p?.phoneNumber || '',
          bio: p?.bio || '',
          location: p?.location || '',
          website: p?.website || '',
          imageUrl: p?.imageUrl || '',
          profile_image_url: p?.imageUrl || '',
        
        }
      }, { status: 200 })
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
}
  