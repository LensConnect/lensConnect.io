import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/src";
import { sql } from "drizzle-orm";
import { photographer_profiles } from "@/app/src/db/schema";


export async function POST (req:NextRequest){

     
    try {

        const body = await req.json();

        const {photographerId, title,description,imageUrl,category,location} = body;

       

        if(!photographerId) return NextResponse.json({message:'Photographer Id is required',status:400})

        const [profileRow] = await db.select({ id: photographer_profiles.id }).from(photographer_profiles).where(sql`${photographer_profiles.userId} = ${Number(photographerId)}`);

        if (!profileRow) {
          return NextResponse.json({message: 'Photographer profile not found', status: 404, success: false});
        }else{
             await db.execute(sql`INSERT INTO photographer_portfolios (photographerId, title, description, imageUrl, category, location) values (${profileRow.id},${title},${description},${JSON.stringify(imageUrl)},${JSON.stringify(category)},${location}) `)

        return NextResponse.json({message: 'Portfolio created successfully',status:201 , success:true})
        }

       

    } catch (error) {
        return NextResponse.json({message: 'Failed to create portfolio',status:500, success:false})
    }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const photographerId = searchParams.get("photographerId");

    if (!photographerId) {
      return NextResponse.json({ message: "photographerId query parameter is required", status: 400, success: false });
    }

    const [profileRow] = await db.select({ id: photographer_profiles.id }).from(photographer_profiles).where(sql`${photographer_profiles.userId} = ${Number(photographerId)}`).limit(1);

    if (!profileRow) {
      return NextResponse.json({ message: "Photographer profile not found", status: 404, success: false });
    }

    const [portfolios] = await db.execute(sql`
      SELECT *
      FROM photographer_portfolios
      WHERE photographerId = ${profileRow.id}
      ORDER BY created_at DESC;
    `);

    const rows = Array.isArray(portfolios)
      ? portfolios.map((row: any) => ({
          ...row,
          imageUrl: typeof row.imageUrl === "string" ? JSON.parse(row.imageUrl) : row.imageUrl,
          category: typeof row.category === "string" ? JSON.parse(row.category) : row.category,
        }))
      : [];
    return NextResponse.json({ portfolios: rows, success: true });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch portfolios", status: 500, success: false });
  }
}
