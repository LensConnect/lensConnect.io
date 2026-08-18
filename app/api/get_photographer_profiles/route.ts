import {db} from '@/app/src'
import{NextRequest, NextResponse} from 'next/server'
import {photographer_profiles, users} from '@/app/src/db/schema'
import { sql } from 'drizzle-orm'


interface photographer{
   id:string;
   userId:string;
   bio:string;
   fullname:string;
   hourlyRate:number;
   specialties:string[];
   profile_image_url: string;
   availability:boolean;
   role:string;
   rating:string;

}


export async function GET(req: NextRequest):Promise<NextResponse>{
    try {   
         const [rows] = await db.execute<photographer>(sql`
             SELECT
             id,
             userId,
             fullname,
             location,
             bio,
             hourlyRate,
             specialties,
             profile_image_url,
             role
             FROM photographer_profiles
             WHERE role = 'photographer'
         `)
        return NextResponse.json(rows || [])
    } catch (error) {
        console.error('Error fetching photographers profile', error)
        return NextResponse.json({error: 'Failed to fetch jobs'}, {status: 500})
    }
}