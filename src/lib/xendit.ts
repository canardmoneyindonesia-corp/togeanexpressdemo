// Minimal Xendit Invoice API client (test mode).
// Docs: https://developers.xendit.co/api-reference/#create-invoice

const XENDIT_API = "https://api.xendit.co/v2/invoices";

export type CreateInvoiceParams = {
  externalId: string;
  amount: number;
  description: string;
  payerEmail?: string;
  customerName?: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
};

export type XenditInvoice = {
  id: string;
  invoice_url: string;
  status: string;
  external_id: string;
  amount: number;
};

export async function createInvoice(
  params: CreateInvoiceParams
): Promise<XenditInvoice> {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error("XENDIT_SECRET_KEY is not set");

  const auth = Buffer.from(`${key}:`).toString("base64");

  const res = await fetch(XENDIT_API, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      currency: "IDR",
      description: params.description,
      payer_email: params.payerEmail || undefined,
      customer: params.customerName
        ? { given_names: params.customerName }
        : undefined,
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
      invoice_duration: 60 * 60 * 24, // 24h
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Xendit invoice failed (${res.status}): ${text}`);
  }

  return (await res.json()) as XenditInvoice;
}
