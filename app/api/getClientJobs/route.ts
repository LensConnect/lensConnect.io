import {db} from '@/app/src'
import{NextRequest, NextResponse} from 'next/server'
import {jobpost} from '@/app/src/db/schema'
import {eq} from 'drizzle-orm'
import { verifyToken, SessionPayload } from '@/lib/auth';
import { cookies } from 'next/headers';


export async function GET(req: NextRequest):Promise<NextResponse>{
    try {
       
        
        const token = (await cookies()).get('session')?.value;
        console.log(token)
        const user: SessionPayload | null = token ? await verifyToken(token) : null;

        if(!user){
            return NextResponse.json({
                error: 'Unauthorized',
            })
        }

         const userIdNum = Number(user.id);
    if (Number.isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'Invalid user id' },
        { status: 400 }
      );
    }
        
        const jobs = await db
        .select()
        .from(jobpost)
        .where(eq(jobpost.clientId, userIdNum))

        return NextResponse.json(jobs)
    } catch (error) {
        console.error('Error fetching jobs', error)
        return NextResponse.json({error: 'Failed to fetch jobs'}, {status: 500})
    }
}