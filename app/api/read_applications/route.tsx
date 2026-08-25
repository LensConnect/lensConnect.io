import { NextResponse, NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/app/src";


export async function PATCH(req:NextRequest){

    const body = await req.json();
    const {isRead} = body;

    const {searchParams} = new URL(req.url);
    const jobId = searchParams.get("jobId");

    try {

        await db.execute(sql`UPDATE job_applications SET isRead = ${isRead} WHERE jobId = ${jobId}`);


        return NextResponse.json({message: 'Updated successfully',status:200 , success:true});
        
    } catch (error) {
        
    }
}
