import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.json({ code: "LOGOUT_SUCCESS" }, { status: 200 });

    const session = await getIronSession(req, res, sessionOptions);

    session.destroy();

    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
}
