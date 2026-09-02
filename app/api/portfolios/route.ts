import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/src";
import { sql } from "drizzle-orm";
import { photographer_portfolios } from "@/app/src/db/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const photographerId = searchParams.get("photographerId");

    if (!photographerId) {
      return NextResponse.json(
        { message: "photographerId is required", status: 400, success: false },
        { status: 400 }
      );
    }

    const rows = await db
      .select()
      .from(photographer_portfolios)
      .where(
        sql`${photographer_portfolios.photographerId} = ${Number(photographerId)}`
      )
      .orderBy(sql`${photographer_portfolios.createdAt} DESC`);

    const portfolios = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      location: row.location,
      category: row.category,
      image_url: row.imageUrl,
    }));

    return NextResponse.json({ portfolios, success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch portfolios", status: 500, success: false },
      { status: 500 }
    );
  }
}
