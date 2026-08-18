import { NextResponse } from "next/server";
import { db } from "@/app/src";
import { jobpost } from "@/app/src/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {id, totalPrice,description,category, status, duration, date,location, clientId} = body

    const result = await db.insert(jobpost).values({...body ,date: body.date.split('T')[0]});

    return NextResponse.json(
      {
        message: "Job created successfully",
        result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}