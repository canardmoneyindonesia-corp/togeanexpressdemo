import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  if (!name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  let slug = slugify(body.slug ? String(body.slug) : name);
  if (!slug) slug = randomUUID().slice(0, 8);

  const commission = Math.max(0, Math.min(100, Number(body.commission_pct) || 0));

  try {
    await sql`
      insert into agents (id, slug, name, email, phone, commission_pct, active)
      values (${randomUUID()}, ${slug}, ${name}, ${body.email || null}, ${body.phone || null}, ${commission}, true)`;
  } catch {
    return NextResponse.json(
      { error: "Slug already exists — choose another" },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true, slug });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const commission = Math.max(0, Math.min(100, Number(body.commission_pct) || 0));
  await sql`
    update agents set
      name = ${body.name},
      email = ${body.email || null},
      phone = ${body.phone || null},
      commission_pct = ${commission},
      active = ${body.active !== false}
    where id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await sql`delete from agents where id = ${id}`;
  return NextResponse.json({ ok: true });
}
