import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { getAgentBySlug } from "@/lib/queries";
import { baseUrl } from "@/lib/url";

// Headless Chrome must run on the Node runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // chromium cold start can be slow

const FLYER_WIDTH = 1103;

/**
 * Resolve a Chrome/Chromium binary. In production (Vercel) we use the bundled
 * @sparticuz/chromium. Locally we fall back to a system Chrome so you can test
 * without that binary — override with CHROME_EXECUTABLE_PATH if needed.
 */
async function resolveBrowser() {
  const local = process.env.CHROME_EXECUTABLE_PATH;
  if (local) {
    return puppeteer.launch({
      executablePath: local,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: { width: FLYER_WIDTH + 56, height: 1600, deviceScaleFactor: 2 },
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const candidates = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];
    for (const path of candidates) {
      try {
        const { accessSync } = await import("node:fs");
        accessSync(path);
        return puppeteer.launch({
          executablePath: path,
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          defaultViewport: { width: FLYER_WIDTH + 56, height: 1600, deviceScaleFactor: 2 },
        });
      } catch {
        /* try next candidate */
      }
    }
  }

  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
    defaultViewport: { width: FLYER_WIDTH, height: 1600, deviceScaleFactor: 2 },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) {
    return new Response("Unknown agent", { status: 404 });
  }

  const target = `${await baseUrl()}/flyer/${slug}`;

  let browser: Awaited<ReturnType<typeof resolveBrowser>> | null = null;
  try {
    browser = await resolveBrowser();
    const page = await browser.newPage();
    await page.goto(target, { waitUntil: "networkidle0", timeout: 45_000 });
    await page.waitForSelector(".flyer", { timeout: 15_000 });

    const el = await page.$(".flyer");
    if (!el) throw new Error("Flyer element not found");
    const body = await el.screenshot({ type: "png" });

    const filename = `togean-express-${slug}.png`;
    return new Response(Buffer.from(body), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Flyer export failed:", err);
    return new Response("Failed to render flyer", { status: 500 });
  } finally {
    await browser?.close();
  }
}
