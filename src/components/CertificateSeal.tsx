export const CertificateSeal = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 800"
    width="100%"
    height="100%"
    role="img"
    aria-label="PeaklyGo Official Achievement Seal"
  >
    <defs>
      <style>
        {`:root{
          --primary:#f97316;
          --accent:#fed7aa;
          --ink:#7c2d12;
          --bg:rgba(255,247,237,0.78);
          --ring:#b45309;
          --shadow:rgba(155,64,0,.18);
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
        }
        .ring{ fill:none; stroke:var(--ring); }
        .soft{ fill:none; stroke:var(--primary); }
        .accent{ fill:none; stroke:var(--accent); }
        .label{ fill:var(--ink); letter-spacing:.08em; font-weight:700; }
        .small{ font-size:28px; }
        .medium{ font-size:36px; }
        .big{ font-size:56px; }
        .mono{ font-variant-numeric: lining-nums; }`}
      </style>

      <filter id="inkBlur" x="-8%" y="-8%" width="116%" height="116%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blurred" />
        <feComponentTransfer in="blurred">
          <feFuncA type="linear" slope="0.9" />
        </feComponentTransfer>
      </filter>

      <path id="txtOuter" d="M400,120 a280,280 0 1,1 0,560 a280,280 0 1,1 0,-560" />
      <path id="txtInner" d="M400,185 a215,215 0 1,1 0,430 a215,215 0 1,1 0,-430" />
      <path id="petal" d="M0,-178 C24,-160 24,-120 0,-92 C-24,-120 -24,-160 0,-178Z" />
    </defs>

    <g filter="url(#inkBlur)" opacity="0.94">
      <circle cx="400" cy="400" r="360" fill="var(--bg)" />
      <circle className="ring" cx="400" cy="400" r="340" strokeWidth="10" opacity="0.85" />
      <circle className="ring" cx="400" cy="400" r="330" strokeWidth="2" opacity="0.3" />

      <g opacity="0.8">
        <circle
          className="soft"
          cx="400"
          cy="400"
          r="300"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="4 18"
        />
        <circle className="accent" cx="400" cy="400" r="302" strokeWidth="2" strokeDasharray="1 8" opacity="0.65" />
      </g>

      <g transform="translate(400,400)">
        <g fill="var(--accent)" opacity="0.3">
          <g id="petalGroup">
            <use href="#petal" transform="rotate(0)" />
            <use href="#petal" transform="rotate(7.5)" />
            <use href="#petal" transform="rotate(15)" />
            <use href="#petal" transform="rotate(22.5)" />
            <use href="#petal" transform="rotate(30)" />
            <use href="#petal" transform="rotate(37.5)" />
            <use href="#petal" transform="rotate(45)" />
            <use href="#petal" transform="rotate(52.5)" />
            <use href="#petal" transform="rotate(60)" />
            <use href="#petal" transform="rotate(67.5)" />
            <use href="#petal" transform="rotate(75)" />
            <use href="#petal" transform="rotate(82.5)" />
            <use href="#petal" transform="rotate(90)" />
            <use href="#petal" transform="rotate(97.5)" />
            <use href="#petal" transform="rotate(105)" />
            <use href="#petal" transform="rotate(112.5)" />
            <use href="#petal" transform="rotate(120)" />
            <use href="#petal" transform="rotate(127.5)" />
            <use href="#petal" transform="rotate(135)" />
            <use href="#petal" transform="rotate(142.5)" />
            <use href="#petal" transform="rotate(150)" />
            <use href="#petal" transform="rotate(157.5)" />
            <use href="#petal" transform="rotate(165)" />
            <use href="#petal" transform="rotate(172.5)" />
            <use href="#petal" transform="rotate(180)" />
            <use href="#petal" transform="rotate(187.5)" />
            <use href="#petal" transform="rotate(195)" />
            <use href="#petal" transform="rotate(202.5)" />
            <use href="#petal" transform="rotate(210)" />
            <use href="#petal" transform="rotate(217.5)" />
            <use href="#petal" transform="rotate(225)" />
            <use href="#petal" transform="rotate(232.5)" />
            <use href="#petal" transform="rotate(240)" />
            <use href="#petal" transform="rotate(247.5)" />
            <use href="#petal" transform="rotate(255)" />
            <use href="#petal" transform="rotate(262.5)" />
            <use href="#petal" transform="rotate(270)" />
            <use href="#petal" transform="rotate(277.5)" />
            <use href="#petal" transform="rotate(285)" />
            <use href="#petal" transform="rotate(292.5)" />
            <use href="#petal" transform="rotate(300)" />
            <use href="#petal" transform="rotate(307.5)" />
            <use href="#petal" transform="rotate(315)" />
            <use href="#petal" transform="rotate(322.5)" />
            <use href="#petal" transform="rotate(330)" />
            <use href="#petal" transform="rotate(337.5)" />
            <use href="#petal" transform="rotate(345)" />
            <use href="#petal" transform="rotate(352.5)" />
          </g>
        </g>
      </g>

      <circle className="ring" cx="400" cy="400" r="245" strokeWidth="6" opacity="0.85" />
      <circle className="ring" cx="400" cy="400" r="238" strokeWidth="2" opacity="0.28" />

      <text className="label medium" textAnchor="middle">
        <textPath href="#txtOuter" startOffset="50%">
          PEAKLYGO • OFFICIAL ACHIEVEMENT CERTIFICATE • VERIFIED SUCCESS •
        </textPath>
      </text>

      <text className="label small" textAnchor="middle">
        <textPath href="#txtInner" startOffset="50%">
          CERTIFIED GOAL ACHIEVER • INSPIRE • GROW • EXCEL • COMMIT • ACHIEVE •
        </textPath>
      </text>

      <g transform="translate(400,400)" textAnchor="middle">
        <path d="M-78,70 L0,-92 L78,70 L48,70 L0,0 L-48,70 Z" fill="var(--primary)" opacity="0.92" />
        <circle cx="0" cy="0" r="6" fill="var(--bg)" opacity="0.9" />
        <text y="120" className="label big">
          PEAKLYGO
        </text>
        <text y="160" className="label medium mono" opacity="0.82">
          CERTIFIED
        </text>
      </g>
    </g>
  </svg>
);
