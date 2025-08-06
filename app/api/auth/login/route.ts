import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { code: "MISSING_CREDENTIALS" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { permissions: true }
    });
    if (!user) {
      return NextResponse.json(
        { code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    // Create session
    const res = NextResponse.json(
      {
        code: "LOGIN_SUCCESS",
        user: { 
          id: user.id,
          name: user.name,
          email: user.email, 
          permissions: user.permissions.map((p) => p.code) 
        },
      },
      { status: 200 }
    );

    const session = await getIronSession<{ user?: { id: number; name: string; email: string; permissions: string[] } }>(
      req,
      res,
      sessionOptions
    );

    session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      permissions: user.permissions.map((p) => p.code) 
    };

    await session.save();

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
}
