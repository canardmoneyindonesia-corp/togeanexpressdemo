import QRCode from "qrcode";

/** Generate a PNG data URL QR code for the given text/URL.
 *  `light` sets the background/quiet-zone colour (defaults to white). */
export async function qrDataUrl(text: string, light = "#ffffff"): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 512,
    margin: 2,
    color: { dark: "#0c3a4d", light },
  });
}
