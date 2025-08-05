import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, IronSessionData } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const session = await getIronSession<IronSessionData>(req, res, sessionOptions);

    if (!session.user) {
      return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json(
      {
        code: "USER_FOUND",
        user: session.user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
}
