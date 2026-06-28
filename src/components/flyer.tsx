import type { Partner } from "@/lib/partners";

/* Inline SVG icons — emoji render inconsistently in headless Chrome, so the
   flyer uses real vector icons that screenshot crisply. */
type IcoName =
  | "boat"
  | "clock"
  | "shield"
  | "calendar"
  | "plane"
  | "wifi"
  | "chair"
  | "people"
  | "whatsapp"
  | "warning"
  | "arrow"
  | "tag"
  | "palm";

function Ico({ name }: { name: IcoName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "boat":
      return (
        <svg {...common}>
          <path d="M3 15h18l-2.2 4.5a2 2 0 0 1-1.8 1.1H7a2 2 0 0 1-1.8-1.1L3 15z" />
          <path d="M5.5 15V8l9 2.5" />
          <path d="M8 8.7V5h3l3.5 5.5" />
          <path d="M14.5 10.5 20 12l1 3" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.8-3.3 8-7 9-3.7-1-7-4.2-7-9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9.5h18M8 3v4M16 3v4" />
        </svg>
      );
    case "plane":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.2 4.1a1.6 1.6 0 0 1 3.1 0v5.4l8 4.1v2.1l-8-2.1v4l2 1.5v1.7l-3.5-1-3.5 1v-1.7l2-1.5v-4l-8 2.1v-2.1l8-4.1V4.1z" />
        </svg>
      );
    case "wifi":
      return (
        <svg {...common}>
          <path d="M4.5 11.5a11 11 0 0 1 15 0" />
          <path d="M7.5 14.5a7 7 0 0 1 9 0" />
          <path d="M10.5 17.5a3 3 0 0 1 3 0" />
          <circle cx="12" cy="20" r="0.6" fill="currentColor" />
        </svg>
      );
    case "chair":
      return (
        <svg {...common}>
          <path d="M6 11V7.5A2.5 2.5 0 0 1 8.5 5h7A2.5 2.5 0 0 1 18 7.5V11" />
          <path d="M5 11h14a2 2 0 0 1 2 2v4H3v-4a2 2 0 0 1 2-2z" />
          <path d="M6 17v2.5M18 17v2.5" />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.3" />
          <path d="M3.5 19c0-3 2.6-5 5.5-5s5.5 2 5.5 5" />
          <path d="M15.5 14c2.4 0 5 1.4 5 5" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M4 20l1.4-3.9A8 8 0 1 1 8 19l-4 1z" />
          <path d="M9 9.5c0 3.3 2.2 5.5 5.5 5.5.6 0 1-.6.7-1.1l-.8-1.3a.8.8 0 0 0-1-.3l-.7.3a4 4 0 0 1-1.8-1.8l.3-.7a.8.8 0 0 0-.3-1l-1.3-.8c-.5-.3-1.1.1-1.1.7z" />
        </svg>
      );
    case "warning":
      return (
        <svg {...common}>
          <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" />
          <path d="M12 9.5v4.5M12 17.5h.01" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M4 12h15M13 6l6 6-6 6" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M3 12V4h8l9 9-7 7-9-9z" />
          <circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "palm":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21c-1-5 .5-9 1.5-11" />
          <path d="M13.5 10C11 7.5 7 7.5 4.5 10c2.8-1 5.5-.3 8 .9" />
          <path d="M13.5 10c0-3.5 2.5-6 6-5.5-2.3.4-3.7 2.3-4.2 4.7" />
          <path d="M13.5 10c2.8-2 6.5-1.7 8.5.8-2.3-1.1-4.8-.8-7 .2" />
          <path d="M13.5 10C12.5 6.5 9 4.5 5.5 5.5c2.3-.2 4.3 1.2 5.4 3.3" />
          <path d="M4 21h16" />
        </svg>
      );
  }
}

type ScheduleLeg = { time: string; place: string; key?: string };

const TO_LEGS: ScheduleLeg[] = [
  { time: "6:30am", place: "Kadidiri (Kadidiri Paradise)", key: "Kadidiri" },
  { time: "7:00am", place: "Ketupat (Bolianga)", key: "Ketupat" },
  { time: "7:45am", place: "Malenge (The Cliff)", key: "Malenge" },
  { time: "10:00am", place: "transfer boat to car" },
  { time: "1:30pm", place: "airport arrival" },
  { time: "3:05pm", place: "flight depart to Makassar" },
];

const FROM_LEGS: ScheduleLeg[] = [
  { time: "11:30am", place: "flight arrival from Makassar" },
  { time: "12 noon", place: "car depart airport" },
  { time: "3:30pm", place: "transfer car to boat" },
  { time: "5:45pm", place: "Malenge (The Cliff)", key: "Malenge" },
  { time: "6:30pm", place: "Ketupat (Bolianga)", key: "Ketupat" },
  { time: "7:00pm", place: "Kadidiri (Kadidiri Paradise)", key: "Kadidiri" },
];

function Legs({ legs, pickup }: { legs: ScheduleLeg[]; pickup: string }) {
  return (
    <>
      {legs.map((l, i) => (
        <div key={i} className={`leg${l.key === pickup ? " active" : ""}`}>
          <span className="dot" />
          <span className="time">{l.time}</span>
          <span className="place">{l.place}</span>
        </div>
      ))}
    </>
  );
}

const CSS = `
.flyer{
  --navy:#0a2a44;--navy-deep:#072135;--teal:#1b9dc9;--teal-dark:#0e7aa8;
  --orange:#f4571f;--panel:#e9f4fb;--panel-line:#cfe6f3;--accent:#f4571f;
  width:1104px;flex:0 0 1104px;background:#fff;color:var(--navy);overflow:hidden;
  font-family:"Segoe UI",Arial,Helvetica,sans-serif;
}
.flyer *{box-sizing:border-box;margin:0;padding:0;}

/* HERO */
.flyer .hero{position:relative;overflow:hidden;padding:34px 40px 70px;
  background:radial-gradient(circle at 78% 20%,rgba(255,255,255,.35),transparent 45%),
    linear-gradient(180deg,#bfeaf5 0%,#7fd0e8 30%,#34b0d6 60%,#1f93c4 100%);}
.flyer .hero .scene{position:absolute;inset:0;z-index:0;pointer-events:none;}
.flyer h1.title{position:relative;z-index:2;font-weight:900;letter-spacing:-2px;
  line-height:.86;font-size:118px;text-shadow:0 3px 10px rgba(0,0,0,.12);}
.flyer h1.title .togean{color:var(--navy);}
.flyer h1.title .express{display:block;color:transparent;
  background:linear-gradient(90deg,#1f93c4,#2bb3d6 40%,#bfeaf5);
  -webkit-background-clip:text;background-clip:text;}
.flyer .subtitle{position:relative;z-index:2;margin-top:14px;color:#0c5e86;
  font-weight:800;font-size:21px;letter-spacing:.5px;line-height:1.3;}
.flyer .partner{position:relative;z-index:2;display:inline-flex;align-items:center;
  gap:10px;margin-top:22px;color:#fff;font-size:21px;font-weight:600;
  padding:12px 26px;border-radius:8px;border-left:6px solid var(--accent);
  background:linear-gradient(90deg,var(--navy),#11457a);}
.flyer .partner b{font-weight:900;}
.flyer .tagline{position:relative;z-index:2;margin-top:20px;color:var(--orange);
  font-style:italic;font-weight:900;font-size:27px;display:flex;align-items:center;gap:10px;}
.flyer .tagline svg{width:30px;height:30px;}

/* COMPARISON */
.flyer .compare{display:grid;grid-template-columns:1fr 168px 1fr;margin:26px 28px 10px;
  border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.10);}
.flyer .col-head{display:flex;align-items:center;gap:12px;justify-content:center;
  font-size:26px;font-weight:900;color:#fff;padding:16px;}
.flyer .col-head.left{background:linear-gradient(90deg,#1898c6,#16abd1);}
.flyer .col-head.mid{background:var(--navy-deep);}
.flyer .col-head.right{background:linear-gradient(90deg,#7c848d,#6a727b);}
.flyer .col-head .ico{width:30px;height:30px;}
.flyer .cell{background:var(--panel);padding:22px 26px;border-bottom:1px solid var(--panel-line);
  min-height:128px;display:flex;flex-direction:column;justify-content:center;}
.flyer .cell.mid{background:var(--navy-deep);align-items:center;justify-content:center;
  text-align:center;color:#fff;border-bottom:1px solid #11324b;}
.flyer .cell.mid .badge{width:54px;height:54px;border-radius:50%;display:flex;
  align-items:center;justify-content:center;margin-bottom:10px;font-weight:900;font-size:22px;
  background:linear-gradient(135deg,#1b9dc9,#0e6f9c);}
.flyer .cell.mid .badge svg{width:28px;height:28px;}
.flyer .cell.mid .lbl{font-weight:900;letter-spacing:1px;font-size:18px;}
.flyer .big-fig{font-size:42px;font-weight:900;color:var(--orange);display:flex;
  align-items:center;gap:12px;line-height:1;}
.flyer .big-fig svg{width:38px;height:38px;flex:0 0 38px;}
.flyer .big-fig .unit{font-size:24px;}
.flyer .head-orange{color:var(--orange);font-size:27px;font-weight:900;margin-bottom:6px;
  display:flex;align-items:center;gap:10px;}
.flyer .head-orange svg{width:28px;height:28px;}
.flyer .gray-fig{font-size:40px;font-weight:800;color:#7a828b;line-height:1;margin-bottom:4px;}
.flyer ul.points{list-style:none;margin-top:8px;}
.flyer ul.points li{position:relative;padding-left:18px;margin:4px 0;font-size:18px;
  color:#1e3a52;font-weight:600;}
.flyer ul.points li::before{content:"";position:absolute;left:0;top:9px;width:7px;height:7px;
  border-radius:50%;background:var(--orange);}
.flyer .cell.right ul.points li{color:#5b636c;}
.flyer .cell.right ul.points li::before{background:#9aa1a9;}

/* SCHEDULE */
.flyer .sched-title{display:flex;align-items:center;gap:16px;margin:24px 32px 8px;}
.flyer .sched-title .cal{width:54px;height:54px;border-radius:50%;display:flex;
  align-items:center;justify-content:center;color:#fff;
  background:linear-gradient(135deg,#1b9dc9,#0e6f9c);}
.flyer .sched-title .cal svg{width:28px;height:28px;}
.flyer .sched-title h2{font-size:44px;font-weight:900;letter-spacing:-1px;}
.flyer .days{margin-left:auto;color:#fff;font-weight:900;font-size:22px;padding:10px 24px;
  border-radius:30px;background:linear-gradient(90deg,#1898c6,#16abd1);}
.flyer .sched-grid{display:grid;grid-template-columns:1fr 250px 1fr;gap:14px;
  margin:8px 32px 0;align-items:start;}
.flyer .sched-col{background:var(--panel);border-radius:14px;padding:14px 14px 18px;}
.flyer .sched-col h3{display:flex;align-items:center;justify-content:center;gap:10px;
  color:#fff;font-size:20px;font-weight:900;padding:10px;border-radius:30px;margin-bottom:8px;
  background:linear-gradient(90deg,#1b9dc9,#1486b3);}
.flyer .sched-col h3 svg{width:20px;height:20px;}
.flyer .leg{display:flex;align-items:center;gap:14px;padding:9px 6px;position:relative;border-radius:10px;}
.flyer .leg+.leg{border-top:1px dashed #bcdcec;}
.flyer .leg.active{background:#dcefff;}
.flyer .leg.active .time{border-color:var(--accent);color:var(--accent);}
.flyer .leg.active .place{font-weight:800;color:#0c5277;}
.flyer .time{flex:0 0 88px;text-align:center;background:#fff;border:2px solid #bcdcec;
  color:#0e6f9c;font-weight:900;font-size:16px;padding:6px 4px;border-radius:30px;}
.flyer .place{font-size:18px;color:#1e3a52;font-weight:600;}
.flyer .dot{position:absolute;left:-2px;width:9px;height:9px;border-radius:50%;background:var(--teal);}
.flyer .island{width:230px;height:230px;border-radius:50%;margin:60px auto 0;position:relative;
  overflow:hidden;color:#0e6f9c;
  box-shadow:0 12px 30px rgba(0,0,0,.2),inset 0 0 0 6px rgba(255,255,255,.5);
  background:radial-gradient(circle at 50% 78%,#f3e3b0 0 22%,transparent 24%),
    linear-gradient(180deg,#9be0d6,#3bb6c9 60%,#1d8fbf);}
.flyer .island svg{position:absolute;left:50%;top:46%;width:110px;height:110px;transform:translate(-50%,-50%);}

/* AMENITIES */
.flyer .amen-label{text-align:center;color:var(--teal-dark);font-weight:900;font-style:italic;
  font-size:26px;margin:26px 0 12px;}
.flyer .amenities{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 32px;
  background:var(--panel);border-radius:14px;padding:18px 10px;}
.flyer .amen{display:flex;align-items:center;gap:12px;justify-content:center;}
.flyer .amen .a-ico{width:54px;height:54px;border-radius:50%;flex:0 0 54px;display:flex;
  align-items:center;justify-content:center;color:#fff;
  background:linear-gradient(135deg,#1b9dc9,#0e6f9c);}
.flyer .amen .a-ico svg{width:28px;height:28px;}
.flyer .amen span{font-size:18px;font-weight:700;color:#13456a;line-height:1.2;}

/* BOOK */
.flyer .book{margin:18px 32px 0;border-radius:16px;padding:26px 30px;display:flex;
  align-items:center;gap:28px;color:#fff;position:relative;overflow:hidden;
  background:linear-gradient(90deg,var(--navy-deep),#0c3454 70%,#15517f);}
.flyer .qr{width:118px;height:118px;flex:0 0 118px;background:#fff;border-radius:10px;padding:8px;}
.flyer .qr img{width:100%;height:100%;display:block;}
.flyer .book-txt h3{font-size:42px;font-weight:900;display:flex;align-items:center;gap:14px;}
.flyer .book-txt h3 .arrow{color:var(--orange);width:40px;height:40px;}
.flyer .book-txt p{margin-top:6px;font-size:18px;opacity:.92;font-weight:600;}

/* FOOTER */
.flyer .footer{margin-top:18px;color:#dceaf2;padding:22px 36px;display:grid;
  grid-template-columns:1fr 1fr;gap:30px;
  background:linear-gradient(90deg,var(--navy-deep),#0a3150);}
.flyer .note{display:flex;gap:14px;font-size:13.5px;line-height:1.5;}
.flyer .note .n-ico{flex:0 0 40px;width:40px;height:40px;border-radius:50%;display:flex;
  align-items:center;justify-content:center;border:2px solid #4b85a8;}
.flyer .note .n-ico svg{width:20px;height:20px;}
`;

export function Flyer({
  partner,
  qrDataUrl,
}: {
  partner: Partner;
  qrDataUrl: string;
}) {
  const accent = partner.accent;
  return (
    <div className="flyer" style={accent ? ({ "--accent": accent } as React.CSSProperties) : undefined}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* HERO */}
      <section className="hero">
        <svg className="scene" viewBox="0 0 1104 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3bc0e2" />
              <stop offset="1" stopColor="#0f7bb0" />
            </linearGradient>
            <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#dfeef5" />
            </linearGradient>
          </defs>
          {/* clouds */}
          <g fill="#ffffff" opacity="0.65">
            <ellipse cx="180" cy="70" rx="90" ry="26" />
            <ellipse cx="260" cy="58" rx="70" ry="22" />
            <ellipse cx="520" cy="48" rx="80" ry="20" />
          </g>
          {/* island right */}
          <g>
            <path d="M760 150 Q880 70 1020 120 Q1120 150 1104 220 L1104 0 L760 0 Z" fill="#2f7d3a" opacity="0.9" />
            <path d="M880 130 Q980 90 1080 130 L1104 180 L1104 60 L900 60 Z" fill="#266a31" opacity="0.85" />
            <path d="M740 210 Q900 175 1104 205 L1104 260 Q900 235 740 260 Z" fill="#f0e2b4" />
          </g>
          {/* sea */}
          <rect x="0" y="250" width="1104" height="180" fill="url(#sea)" />
          <g stroke="#bfeefb" strokeWidth="3" opacity="0.55" fill="none">
            <path d="M40 300 q40 -10 80 0 t80 0" />
            <path d="M260 330 q40 -10 80 0 t80 0" />
            <path d="M620 360 q40 -10 80 0 t80 0" />
          </g>
          {/* speedboat */}
          <g transform="translate(560 250)">
            <ellipse cx="150" cy="150" rx="230" ry="26" fill="#ffffff" opacity="0.55" />
            <path d="M-10 120 L320 120 L285 165 Q280 172 270 172 L40 172 Q26 172 18 160 Z" fill="url(#hull)" />
            <path d="M-10 120 L320 120 L312 134 L-2 134 Z" fill="#1b4f86" />
            <path d="M30 120 L40 86 L150 86 L210 120 Z" fill="#0d3a63" />
            <path d="M52 118 L60 96 L142 96 L150 118 Z" fill="#bfe6f5" />
            <rect x="206" y="92" width="10" height="30" rx="3" fill="#0d3a63" />
            <path d="M150 86 L150 70 L196 86 Z" fill="#13476f" />
          </g>
        </svg>

        <h1 className="title">
          <span className="togean">TOGEAN</span>
          <span className="express">EXPRESS</span>
        </h1>
        <div className="subtitle">
          LUWUK AIRPORT TO &amp; FROM TOGEAN ISLANDS
          <br />
          TRANSFER SERVICE
        </div>
        <div className="partner">
          In Partnership With <b>{partner.name}</b>
        </div>
        <div className="tagline">
          <Ico name="boat" /> Fast, Convenient, Affordable
        </div>
      </section>

      {/* COMPARISON */}
      <section className="compare">
        <div className="col-head left">
          <span className="ico">
            <Ico name="boat" />
          </span>
          TOGEAN EXPRESS
        </div>
        <div className="col-head mid" />
        <div className="col-head right">
          PUBLIC SPEEDBOAT
          <span className="ico">
            <Ico name="boat" />
          </span>
        </div>

        {/* DURATION */}
        <div className="cell left">
          <div className="big-fig">
            <Ico name="clock" /> 5.5–6.5 <span className="unit">hrs.</span>
          </div>
          <ul className="points">
            <li>Same day arrivals.</li>
            <li>Synced with Makassar flights</li>
          </ul>
        </div>
        <div className="cell mid">
          <div className="badge">
            <Ico name="clock" />
          </div>
          <div className="lbl">DURATION</div>
        </div>
        <div className="cell right">
          <div className="gray-fig">23–25 hrs.</div>
          <ul className="points">
            <li>Overnight hotel</li>
          </ul>
        </div>

        {/* RELIABILITY */}
        <div className="cell left">
          <div className="head-orange">
            <Ico name="shield" /> Guaranteed Departures
          </div>
          <ul className="points">
            <li>2 engine boats.</li>
            <li>Backup boat always on call.</li>
            <li>International boat and safety standards</li>
          </ul>
        </div>
        <div className="cell mid">
          <div className="badge">
            <Ico name="shield" />
          </div>
          <div className="lbl">RELIABILITY</div>
        </div>
        <div className="cell right">
          <ul className="points">
            <li>Unannounced schedule changes.</li>
            <li>Small 1 engine boats mechanical delay risks</li>
          </ul>
        </div>

        {/* PRICING */}
        <div className="cell left">
          <div className="big-fig">
            <Ico name="tag" /> 1.5 <span className="unit">million IDR.</span>
          </div>
        </div>
        <div className="cell mid">
          <div className="badge">Rp</div>
          <div className="lbl">PRICING</div>
        </div>
        <div className="cell right">
          <div className="gray-fig">1.3 million IDR</div>
          <ul className="points">
            <li>based on car, hotel for 2 people</li>
          </ul>
        </div>
      </section>

      {/* SCHEDULE */}
      <div className="sched-title">
        <div className="cal">
          <Ico name="calendar" />
        </div>
        <h2>TOGEAN EXPRESS SCHEDULE</h2>
        <div className="days">MON / WED / SAT</div>
      </div>

      <div className="sched-grid">
        <div className="sched-col">
          <h3>
            <Ico name="plane" /> TO LUWUK AIRPORT
          </h3>
          <Legs legs={TO_LEGS} pickup={partner.pickup} />
        </div>

        <div className="island" aria-hidden="true">
          <Ico name="palm" />
        </div>

        <div className="sched-col">
          <h3>
            <Ico name="plane" /> FROM LUWUK AIRPORT
          </h3>
          <Legs legs={FROM_LEGS} pickup={partner.pickup} />
        </div>
      </div>

      {/* AMENITIES */}
      <div className="amen-label">Amenities</div>
      <div className="amenities">
        <div className="amen">
          <div className="a-ico">
            <Ico name="wifi" />
          </div>
          <span>Free Starlink internet</span>
        </div>
        <div className="amen">
          <div className="a-ico">
            <Ico name="chair" />
          </div>
          <span>Cushioned chairs</span>
        </div>
        <div className="amen">
          <div className="a-ico">
            <Ico name="people" />
          </div>
          <span>English proficient crew</span>
        </div>
        <div className="amen">
          <div className="a-ico">
            <Ico name="whatsapp" />
          </div>
          <span>Real time WhatsApp updates</span>
        </div>
      </div>

      {/* BOOK */}
      <div className="book">
        <div className="qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt={`Scan to book ${partner.name} transfer`} />
        </div>
        <div className="book-txt">
          <h3>
            Scan to Book{" "}
            <span className="arrow">
              <Ico name="arrow" />
            </span>
          </h3>
          <p>
            {partner.name} transfer page • live pricing calendar • instant email
            confirmation
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="note">
          <div className="n-ico">
            <Ico name="shield" />
          </div>
          <p>
            Togean Express is committed to on-time departures. But if sea or
            weather conditions are dangerous, for guest safety, we will postpone
            and advise reschedule transfers at earliest opportunity.
          </p>
        </div>
        <div className="note">
          <div className="n-ico">
            <Ico name="warning" />
          </div>
          <p>
            We take our responsibilities seriously, but please understand we
            can&apos;t be held liable for missed flights or extra hotel stays due
            to circumstances well beyond our control.
          </p>
        </div>
      </div>
    </div>
  );
}
