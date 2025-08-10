import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { authorized, code } = await withAuth(req, ["VIEW_USERS"]);

  if (!authorized) {
      return NextResponse.json({ code }, { status: code === "FORBIDDEN" ? 403 : 401 });
  }

  // List all the users except admin user (id=1)
  const users = await prisma.user.findMany({
    where: { id: { not: 1 } },
    select: {
      id: true,
      email: true,
      name: true,
      permissions: { select: { code: true } },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
