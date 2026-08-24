import {NextResponse, NextRequest} from "next/server"
import {db} from '@/app/src'
import { sql } from "drizzle-orm";
import {cookies} from "next/headers"
import { verifyToken, SessionPayload } from "@/lib/auth";


interface applications{
    id:string;
    jobId:string;
    photographerId:string;
    bidAmount:number;
    status:string;
    isRead:boolean;
}

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


export async function GET(req: NextRequest) {
    try {
        const token = (await cookies()).get("session")?.value;
        const session: SessionPayload | null = token ? await verifyToken(token) : null;

        if (!session) {
            return NextResponse.json({
                error: 'Unauthorized',
            }, { status: 401 });
        }

        const userIdNum = Number(session.id);
        if (Number.isNaN(userIdNum)) {
            return NextResponse.json(
                { error: 'Invalid user id' },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');

        if (jobId) {
            const [jobRows]: any = await db.execute(sql`SELECT * FROM jobpost WHERE id = ${jobId}`);

            if (!jobRows || jobRows.length === 0) {
                return NextResponse.json({
                    error: 'Job not found',
                }, { status: 404 });
            }

            const [applicationRows]: any = await db.execute(
                sql`SELECT * FROM job_applications WHERE jobId = ${jobId} AND photographerId = ${userIdNum}`
            );

            const application = applicationRows?.[0] || null;

            if (!application) {
                return NextResponse.json({ error: 'No application found for this job' }, { status: 404 });
            }

            return NextResponse.json({
                message: "Application fetched successfully",
                application
            });
        }

        const [rows]: any = await db.execute(sql`
            SELECT 
                ja.id,
                ja.jobId,
                ja.photographerId,
                ja.message,
                ja.bidAmount,
                ja.status,
                ja.isRead,
                ja.created_at,
                jp.id AS job_id,
                jp.clientId AS job_clientId,
                jp.title AS job_title,
                jp.description AS job_description,
                jp.location AS job_location,
                jp.category AS job_category,
                jp.date AS job_date,
                jp.duration_hours AS job_duration_hours,
                jp.totalPrice AS job_totalPrice,
                jp.status AS job_status,
                jp.created_at AS job_createdAt
            FROM job_applications ja
            LEFT JOIN jobpost jp ON ja.jobId = jp.id
            WHERE ja.photographerId = ${userIdNum}
            ORDER BY ja.created_at DESC
        `);

        const applications = (rows || []).map((row: any) => ({
            id: String(row.id),
            jobId: String(row.jobId),
            photographerId: String(row.photographerId),
            message: row.message,
            bidAmount: Number(row.bidAmount) || 0,
            status: row.status,
            isRead: Boolean(row.isRead),
            created_at: row.created_at,
            jobs: row.job_id ? {
                id: String(row.job_id),
                clientId: String(row.job_clientId),
                title: row.job_title,
                description: row.job_description,
                location: row.job_location,
                category: row.job_category,
                date: row.job_date,
                durationHours: Number(row.job_duration_hours) || 0,
                totalPrice: Number(row.job_totalPrice) || 0,
                status: row.job_status,
                createdAt: row.job_createdAt,
            } : null,
        }));

        return NextResponse.json(applications);
    } catch (error) {
        console.error('Error fetching applications', error);
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
}
