import QRCode from "qrcode";

/** Generate a PNG data URL QR code for the given text/URL. */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 512,
    margin: 2,
    color: { dark: "#0c3a4d", light: "#ffffff" },
  });
}
