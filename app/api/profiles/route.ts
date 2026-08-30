import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/app/src'
import { photographer_profiles, users } from '@/app/src/db/schema'


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
    } = body

    // Validate required fields explicitly
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

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
      portfolio_image_url: [], // explicit default
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



export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawUserId = searchParams.get('userId')

    // 1. Defend against missing or empty userId query parameter
    if (!rawUserId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    const targetUserId = Number(rawUserId)

    // 2. Fetch Photographer using unified Drizzle v2 functional API style
    const photographer = await db.query.users.findFirst({
    where: {
        id: targetUserId,
        role: 'photographer',
      },
      with: {
        photographer_profiles: true,
        profiles: true,
      },
    });

    if (photographer) {
      // Drizzle v2 handles 1-to-1 relationships safely; fallbacks kept for safety
      const pp = Array.isArray(photographer.photographer_profiles) 
        ? photographer.photographer_profiles[0] 
        : photographer.photographer_profiles;

      const p = Array.isArray(photographer.profiles) 
        ? photographer.profiles[0] 
        : photographer.profiles;

      // Extract portfolio URL safely from stringified or direct JSON structures
      let portfolioUrl = '';
      if (pp?.portfolio_image_url) {
        const images = typeof pp.portfolio_image_url === 'string' 
          ? JSON.parse(pp.portfolio_image_url) 
          : pp.portfolio_image_url;
        if (Array.isArray(images) && images.length > 0) {
          portfolioUrl = images[0];
        }
      }
      
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
          portfolio_url: portfolioUrl,
          profile_image_url: p?.imageUrl || '',
          website: p?.website || '',
        }
      }, { status: 200 })
    }

    // 3. Fetch Client using unified Drizzle v2 functional API style
    const client = await db.query.users.findFirst({
     where: {
        id: targetUserId,
        role: 'client',
      },
      with: {
        profiles: true,
      },
    });

    if (client) {
      const p = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles;
      
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
