import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/app/src'
import { job_applications, jobpost } from '@/app/src/db/schema'
import { sql } from 'drizzle-orm'


export async function GET(req: NextRequest) {

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");




    try {

       
        const [job_applications_table_rows] = await db.execute(sql`
  SELECT 
    -- Columns from job_applications
    job_applications.id AS application_id, 
    job_applications.jobId,
    job_applications.photographerId, 
    job_applications.message, 
    job_applications.bidAmount, 
    job_applications.status,
    job_applications.created_at,
    
    -- Columns from photographer_profiles
    photographer_profiles.id AS profileId,
    photographer_profiles.fullname,
    photographer_profiles.hourlyRate, 
    photographer_profiles.location,
    photographer_profiles.bio, 
    photographer_profiles.specialties
  FROM job_applications 
  INNER JOIN photographer_profiles 
    ON job_applications.photographerId = photographer_profiles.userId 
  WHERE job_applications.jobId = ${jobId || ''}
`);



       



        const rows = job_applications_table_rows ;

        return NextResponse.json(rows || [])
    } catch (error) {
        console.error('Error fetching applications', error)
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

}


export async  function PUT(req:NextRequest){

    const body = await req.json();
    const {status} = body;


    const {searchParams} = new URL(req.url);
    const jobId = searchParams.get("jobId");


    try {

        

        


     const [row] =    await db.execute(sql`
  UPDATE job_applications 
  SET status = ${status || ''}
  WHERE jobId = ${jobId || ''}
`);

      return NextResponse.json({message: 'Updated successfully',status:200 , success:true, rows:row})
    } catch (error) {
        console.error('Error updating application', error)
        return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
    }
    
    
}


