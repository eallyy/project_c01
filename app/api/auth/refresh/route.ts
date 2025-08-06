import { getIronSession } from "iron-session";
import { sessionOptions, IronSessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const res = NextResponse.next()
  const session = await getIronSession<IronSessionData>(req, res, sessionOptions);

  if (!session.user?.id) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  // Refresh user from DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { permissions: true }
  });

  if (!user) {
    session.destroy();
    return NextResponse.json({ code: "USER_NOT_FOUND" }, { status: 404 });
  }

  // Recreate session with new user data
  session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    permissions: user.permissions.map(p => p.code),
  };

  await session.save();

  return Response.json({ code: "SESSION_REFRESHED", user: session.user });
}
