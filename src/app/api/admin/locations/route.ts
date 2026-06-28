import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function normKind(v: unknown): "pickup" | "dropoff" | null {
  return v === "pickup" || v === "dropoff" ? v : null;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const kind = normKind(body.kind);
  const area = String(body.area ?? "").trim();
  const order = Math.max(0, Math.round(Number(body.sort_order) || 0));
  if (!kind)
    return NextResponse.json(
      { error: "Kind must be 'pickup' or 'dropoff'" },
      { status: 400 }
    );
  if (!area)
    return NextResponse.json({ error: "Area is required" }, { status: 400 });

  await sql`
    insert into locations (id, kind, area, place, time_label, sort_order, active)
    values (${randomUUID()}, ${kind}, ${area}, ${body.place || null}, ${body.time_label || null}, ${order}, true)`;
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  const kind = normKind(body.kind);
  const area = String(body.area ?? "").trim();
  const order = Math.max(0, Math.round(Number(body.sort_order) || 0));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (!kind)
    return NextResponse.json(
      { error: "Kind must be 'pickup' or 'dropoff'" },
      { status: 400 }
    );
  if (!area)
    return NextResponse.json({ error: "Area is required" }, { status: 400 });

  await sql`
    update locations set
      kind = ${kind},
      area = ${area},
      place = ${body.place || null},
      time_label = ${body.time_label || null},
      sort_order = ${order},
      active = ${body.active !== false}
    where id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await sql`delete from locations where id = ${id}`;
  return NextResponse.json({ ok: true });
}
