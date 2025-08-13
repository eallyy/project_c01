import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, code } = await withAuth(req, ["DELETE_USER"]);
  if (!authorized) {
    return NextResponse.json(
      { code },
      { status: code === "FORBIDDEN" ? 403 : 401 }
    );
  }

  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { code: "INVALID_USER_ID" },
      { status: 400 }
    );
  }

  if (id === 1) {
    return NextResponse.json(
      { code: "CANNOT_DELETE_ROOT_USER" },
      { status: 403 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ code: "USER_DELETED_SUCCESS" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { code: "USER_DELETE_FAILED" },
      { status: 500 }
    );
  }
}

// Update User
async function getParams(ctx: { params: any }) {
  return typeof ctx.params?.then === "function" ? await ctx.params : ctx.params;
}
// permissions: hem string[] hem {code}[] kabul et
const permissionsSchema = z.preprocess((val) => {
  if (Array.isArray(val)) {
    if (val.length === 0) return [];
    if (typeof val[0] === "object" && val[0] && "code" in (val[0] as any)) {
      return val;
    }
    // ["X","Y"] -> [{code:"X"},{code:"Y"}]
    if (typeof val[0] === "string") {
      return (val as string[]).map((c) => ({ code: c }));
    }
  }
  return val;
}, z.array(z.object({ code: z.string() })).default([]));

const payloadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  permissions: permissionsSchema.optional(),
}).refine((v) => Object.keys(v).length > 0, { message: "EMPTY_UPDATE" });

export async function PUT(req: NextRequest, ctx: { params: any }) {
  const { authorized, code } = await withAuth(req, ["DELETE_USER"]);
  if (!authorized) {
    return NextResponse.json(
      { code },
      { status: code === "FORBIDDEN" ? 403 : 401 }
    );
  }

  const { id: idParam } = await getParams(ctx);
  const id = Number(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ code: "INVALID_USER_ID" }, { status: 400 });
  }
  if (id === 1) return NextResponse.json({ code: "CANNOT_UPDATE_ROOT_USER" }, { status: 403 });

  // Content-Type guard
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ code: "INVALID_CONTENT_TYPE" }, { status: 415 });
  }

  // Body parse + validation
  let body: z.infer<typeof payloadSchema>;
  try {
    const json = await req.json();
    console.log(json);
    body = payloadSchema.parse(json);
  } catch (err) {
    return NextResponse.json({ code: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.email === "string") data.email = body.email;

  if (typeof body.password === "string" && body.password.trim().length > 0) {
    data.password = await bcrypt.hash(body.password, 10);
  }

  if (Array.isArray(body.permissions)) {
    data.permissions = { set: body.permissions.map((p) => ({ code: p.code })) };
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        permissions: { select: { code: true } },
        updatedAt: true,
      },
    });

    return NextResponse.json({ code: "USER_UPDATED_SUCCESS", user: updated });
  } catch (err: any) {
    if (err?.code === "P2002" && err?.meta?.target?.includes?.("email")) {
      return NextResponse.json({ code: "EMAIL_ALREADY_EXISTS" }, { status: 409 });
    }
    console.error("Error updating user:", err);
    return NextResponse.json({ code: "USER_UPDATE_FAILED" }, { status: 500 });
  }
}

