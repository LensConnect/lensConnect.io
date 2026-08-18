import { eq } from "drizzle-orm";
import { db } from "@/app/src";
import { users } from "@/app/src/db/schema";
import { NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { fullname, email, password, role  } = body;

    if (!fullname || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    if(!["client", "photographer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'client' or 'photographer'" },
        { status: 400 }
      );
    }

    const [newUser] = await db.insert(users).values({
      fullname: fullname,
      email,
      role
    }).$returningId();

    const [createdUser] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        fullname: users.fullname,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (createdUser) {
      await createSessionCookie({
        id: String(createdUser.id),
        email: String(createdUser.email),
        role: createdUser.role,
        fullname: String(createdUser.fullname),
      });
    }

    return NextResponse.json(
      { message: "User created successfully", user: createdUser || { email, role } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup route error:", error);
    const message = error instanceof Error ? error.message : "Signup failed";

    if (message.includes("Duplicate entry") || message.includes("unique")) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}


