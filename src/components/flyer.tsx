// The flyer is the original artwork (public/flyer-base.jpeg) with per-partner
// elements layered on top. Overlay coordinates are in pixels relative to the
// base image's natural size, calibrated against the original.
const BASE_W = 1103;
const BASE_H = 1426;

// The base image is already the "Kadidiri Paradise" edition, so for that agent we
// leave the baked-in badge & call-to-action untouched and only swap in the QR.
const BAKED_SLUG = "kadidiri-paradise";

const CSS = `
.flyer{position:relative;width:${BASE_W}px;height:${BASE_H}px;overflow:hidden;
  font-family:"Poppins","Segoe UI",Arial,Helvetica,sans-serif;}
.flyer *{box-sizing:border-box;margin:0;padding:0;}
.flyer .base{position:absolute;inset:0;width:100%;height:100%;display:block;}

/* Partnership badge — covers the original navy pill so the name can change. */
.flyer .ov-partner{position:absolute;left:12px;top:267px;min-width:420px;height:53px;
  display:flex;align-items:center;padding:0 26px;border-radius:9px;color:#fff;
  font-size:22px;font-weight:500;white-space:nowrap;letter-spacing:.2px;
  background:linear-gradient(90deg,#06214a 0%,#0a2c5e 100%);}
.flyer .ov-partner b{font-weight:800;margin-left:7px;}

/* Real scannable QR, sized to fully cover the baked-in placeholder box. */
.flyer .ov-qr{position:absolute;left:66px;top:1215px;width:131px;height:125px;
  background:#fff;border-radius:22px;display:flex;align-items:center;justify-content:center;}
.flyer .ov-qr img{width:112px;height:112px;display:block;}

/* Footer call-to-action — only line 1 carries the partner name; lines 2 & 3 are
   identical for every partner and stay baked into the artwork. */
.flyer .ov-cta{position:absolute;left:228px;top:1272px;min-width:256px;height:23px;
  display:flex;align-items:center;white-space:nowrap;
  background:linear-gradient(90deg,#023150 0%,#01395b 55%,#014063 100%);
  color:#e8f1f7;font-size:18px;font-weight:500;}
`;

export function Flyer({
  name,
  slug,
  qrDataUrl,
}: {
  name: string;
  slug: string;
  qrDataUrl: string;
}) {
  const baked = slug === BAKED_SLUG;

  return (
    <div className="flyer">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="base" src="/flyer-base.jpeg" alt="" width={BASE_W} height={BASE_H} />

      {/* Partnership badge & footer CTA — only re-drawn for non-baked partners. */}
      {!baked && (
        <>
          <div className="ov-partner">
            In Partnership With <b>{name}</b>
          </div>
          <div className="ov-cta">{name} transfer page •</div>
        </>
      )}

      {/* Real QR (always overlaid — the baked-in one is a placeholder). */}
      <div className="ov-qr">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt={`Scan to book ${name} transfer`} />
      </div>
    </div>
  );
}
