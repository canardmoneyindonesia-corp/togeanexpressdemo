import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const price = Math.max(0, Math.round(Number(body.price_idr) || 0));
  const capacity = Math.max(0, Math.round(Number(body.capacity) || 12));
  if (!name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  await sql`
    insert into trips (id, name, route, description, price_idr, capacity, active)
    values (${randomUUID()}, ${name}, ${body.route || null}, ${body.description || null}, ${price}, ${capacity}, true)`;
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const price = Math.max(0, Math.round(Number(body.price_idr) || 0));
  const capacity = Math.max(0, Math.round(Number(body.capacity) || 12));
  await sql`
    update trips set
      name = ${body.name},
      route = ${body.route || null},
      description = ${body.description || null},
      price_idr = ${price},
      capacity = ${capacity},
      active = ${body.active !== false}
    where id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await sql`delete from trips where id = ${id}`;
  return NextResponse.json({ ok: true });
}
