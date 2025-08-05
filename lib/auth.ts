import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import type { IronSessionData } from "@/lib/session";

/**
 * Permission-based authorization middleware
 * @param req - Incoming Request object
 * @param requiredPermissions - Array of permission codes the user must have
 */
export async function withAuth(
  req: Request,
  requiredPermissions: string[] = []
) {
  // Get session from cookies
  const res = NextResponse.next(); 
  const session = await getIronSession<IronSessionData>(req, res, sessionOptions);

  // Not logged in
  if (!session.user) {
    return { authorized: false, code: "UNAUTHORIZED" };
  }

  // Fetch user from DB with permissions
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { permissions: true },
  });

  if (!dbUser) {
    return { authorized: false, code: "USER_NOT_FOUND" };
  }

  // Check if user has all required permissions
  const userPermissions = dbUser.permissions.map((p) => p.code);
  const hasPermission = requiredPermissions.every((perm) =>
    userPermissions.includes(perm)
  );

  if (!hasPermission) {
    return { authorized: false, code: "FORBIDDEN" };
  }

  // Authorized
  return { authorized: true, user: dbUser };
}
