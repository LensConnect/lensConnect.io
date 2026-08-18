import {db} from '@/app/src'
import{NextRequest, NextResponse} from 'next/server'
import {jobpost} from '@/app/src/db/schema'




export async function GET(req: NextRequest):Promise<NextResponse>{
    try {   
        const jobs = await db
        .select()
        .from(jobpost)

        return NextResponse.json(jobs)
    } catch (error) {
        console.error('Error fetching jobs', error)
        return NextResponse.json({error: 'Failed to fetch jobs'}, {status: 500})
    }
}