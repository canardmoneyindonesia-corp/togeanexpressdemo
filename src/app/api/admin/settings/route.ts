import { NextRequest, NextResponse } from "next/server";
import { setSetting } from "@/lib/queries";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED_KEYS = new Set(["terms"]);

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const key = String(body.key ?? "");
  if (!ALLOWED_KEYS.has(key))
    return NextResponse.json({ error: "Unknown setting" }, { status: 400 });

  await setSetting(key, String(body.value ?? ""));
  return NextResponse.json({ ok: true });
}
