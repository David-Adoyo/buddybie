"use client";

import { useEffect, useState } from "react";

// Orbit geometry — matches the logo's triangular arrangement
const CX = 40, CY = 40, R = 18;
const pt = (deg: number): [number, number] => [
  CX + R * Math.cos((deg * Math.PI) / 180),
  CY + R * Math.sin((deg * Math.PI) / 180),
];
const [coralX, coralY] = pt(210); // top-left
const [amberX, amberY] = pt(330); // top-right
const [roseX,  roseY]  = pt(90);  // bottom-centre

export default function AppLoading() {
  const [phase, setPhase] = useState<"bounce" | "orbit">("bounce");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Bounce for ~950 ms, then cross-fade into the anticlockwise orbit
    const t1 = setTimeout(() => setFading(true), 900);
    const t2 = setTimeout(() => { setPhase("orbit"); setFading(false); }, 1020);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      aria-busy="true"
      aria-label="Loading"
    >
      <style>{`
        @keyframes bab-bounce {
          0%, 100% { transform: translateY(0px);   }
          45%       { transform: translateY(-13px); }
          55%       { transform: translateY(-13px); }
        }
        @keyframes bab-orbit {
          from { transform: rotate(0deg);    }
          to   { transform: rotate(-360deg); }
        }
        .bab-b1, .bab-b2, .bab-b3 {
          transform-box: fill-box;
          transform-origin: center;
          animation: bab-bounce 0.48s ease-in-out infinite;
        }
        .bab-b2 { animation-delay: 0.16s; }
        .bab-b3 { animation-delay: 0.32s; }
        .bab-orbit-g {
          transform-origin: 40px 40px;
          animation: bab-orbit 1.4s linear infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 80 80"
        width="80"
        height="80"
        aria-hidden="true"
        style={{ opacity: fading ? 0 : 1, transition: "opacity 0.12s ease" }}
      >
        <defs>
          <linearGradient id="bab-load-c" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff7d5e" />
            <stop offset="100%" stopColor="#d4522a" />
          </linearGradient>
          <linearGradient id="bab-load-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffc657" />
            <stop offset="100%" stopColor="#f4a826" />
          </linearGradient>
          <linearGradient id="bab-load-r" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff93b4" />
            <stop offset="100%" stopColor="#ef6a93" />
          </linearGradient>
        </defs>

        {phase === "bounce" ? (
          <>
            <circle cx="20" cy="48" r="10" fill="url(#bab-load-c)" stroke="var(--background)" strokeWidth="1.5" className="bab-b1" />
            <circle cx="40" cy="48" r="10" fill="url(#bab-load-a)" stroke="var(--background)" strokeWidth="1.5" className="bab-b2" />
            <circle cx="60" cy="48" r="10" fill="url(#bab-load-r)" stroke="var(--background)" strokeWidth="1.5" className="bab-b3" />
          </>
        ) : (
          <g className="bab-orbit-g">
            <circle cx={coralX} cy={coralY} r="10" fill="url(#bab-load-c)" stroke="var(--background)" strokeWidth="1.5" />
            <circle cx={amberX} cy={amberY} r="10" fill="url(#bab-load-a)" stroke="var(--background)" strokeWidth="1.5" />
            <circle cx={roseX}  cy={roseY}  r="10" fill="url(#bab-load-r)" stroke="var(--background)" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
