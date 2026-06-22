import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/queries";
import TermsEditor from "./terms-editor";

export const dynamic = "force-dynamic";

export default async function AdminTermsPage() {
  await requireAdmin();
  const terms = (await getSetting("terms")) ?? "";
  return <TermsEditor initial={terms} />;
}
