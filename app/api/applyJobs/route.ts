import {NextResponse, NextRequest} from "next/server"
import {db} from '@/app/src'
import { sql } from "drizzle-orm";
import {cookies} from "next/headers"
import { verifyToken, SessionPayload } from "@/lib/auth";

export const POST = async(req: NextRequest,) =>{
    const body = await req.json();
    const {jobId,message,bidAmount} = body;

    try {
        const taken = (await cookies()).get("session")?.value;
        const session: SessionPayload | null = taken ? await verifyToken(taken) : null;

        if(!session){
            return NextResponse.json({
                error: 'Unauthorized',
            }, {status: 401})
        }

        const userIdNum = Number(session.id);
        if (Number.isNaN(userIdNum)) {
            return NextResponse.json(
                { error: 'Invalid user id' },
                { status: 400 }
            );
        }

        const [jobRows]: any = await db.execute(sql`SELECT * FROM jobpost WHERE id = ${jobId}`);

        if(jobRows.length === 0){
            return NextResponse.json({
                error: 'Job not found',
            }, {status: 404})
        }

        const [existingAppRows]: any = await db.execute(
            sql`SELECT * FROM job_applications WHERE jobId = ${jobId} AND photographerId = ${userIdNum}`
        );

        if(existingAppRows.length > 0){
            return NextResponse.json({
                error: 'You have already applied for this job',
            }, {status: 400})
        }

        await db.execute(
            sql`INSERT INTO job_applications (jobId, photographerId, message, bidAmount, status, created_at, isRead) VALUES (${jobId}, ${userIdNum}, ${message}, ${bidAmount}, 'pending', now(), false)`
        );

        return NextResponse.json({message:'Job applied successfully'})
    } catch (error) {
        console.error('Error applying for job', error)
        return NextResponse.json({error: 'Failed to apply for job'}, {status: 500})
    }
}
