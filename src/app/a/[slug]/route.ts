import { NextRequest, NextResponse } from "next/server";

// Agent entry point. QR codes / shared links point here:
//   /a/<agent-slug>  ->  redirects to the checkout with the partner pre-filled.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const url = new URL("/checkout", req.url);
  url.searchParams.set("partner", slug);
  return NextResponse.redirect(url);
}
