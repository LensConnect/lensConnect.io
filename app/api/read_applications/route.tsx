import { NextResponse, NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/app/src";
import { verifyToken, SessionPayload } from '@/lib/auth';
import { cookies } from 'next/headers';


export async function PATCH(req:NextRequest){

    const body = await req.json();
    const {isRead} = body;


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

    const {searchParams} = new URL(req.url);
    const jobId = searchParams.get("jobId");

    try {

        await db.execute(sql`UPDATE job_applications SET isRead = ${isRead} WHERE photographerId = ${userIdNum} AND isRead = false`);


        return NextResponse.json({message: 'Updated successfully',status:200 , success:true});
        
    } catch (error) {
        return NextResponse.json({error:'Failed to update read status',status:500, success:false})
    }
}
