import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcrypt";

// Get all users
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

// Create User
const createPayloadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  permissions: z.array(z.object({
    code: z.string()
  })).optional().default([]),
});

export async function POST(req: NextRequest) {
  const { authorized, code } = await withAuth(req, ["CREATE_USER"]);
  if (!authorized) {
    return NextResponse.json(
      { code },
      { status: code === "FORBIDDEN" ? 403 : 401 }
    );
  }

  // Content-Type control
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { code: "INVALID_CONTENT_TYPE" },
      { status: 415 }
    );
  }

  // Body parse + validation
  let body: z.infer<typeof createPayloadSchema>;
  try {
    const json = await req.json();
    console.log(json);
    body = createPayloadSchema.parse(json);
  } catch (err) {
    return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
  }

  try {
    // Şifre hashleme
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Yeni kullanıcı oluşturma
    const createdUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        permissions: {
          connect: body.permissions
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        permissions: { select: { code: true } },
        createdAt: true,
      },
    });

    return NextResponse.json({ code: "USER_CREATED_SUCCESS", user: createdUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { code: "USER_CREATE_FAILED" },
      { status: 500 }
    );
  }
}
