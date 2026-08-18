import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const cookieStore =  await cookies();
    const sessionCookie = cookieStore.get("session")?.value || null;
   

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({ user: payload });
  } catch (error) {
    console.error("ME route error:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}