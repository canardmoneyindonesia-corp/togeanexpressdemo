import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getSetting } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms & Conditions — Togean Express",
};

export default async function TermsPage() {
  const terms = (await getSetting("terms")) ?? "Terms & Conditions are not available yet.";

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-900 text-white">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-ocean-900 sm:text-2xl">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm font-semibold text-ocean-600">
            Togean Express speedboat transfers
          </p>
        </div>
      </header>

      <article className="whitespace-pre-wrap break-words rounded-2xl border border-ocean-200 bg-white p-5 text-[15px] leading-relaxed text-ocean-800 sm:p-7">
        {terms}
      </article>

      <div className="mt-6">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-600 hover:text-ocean-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to booking
        </Link>
      </div>
    </main>
  );
}
