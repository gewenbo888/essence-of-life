"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionShell from "./SectionShell";
import Reveal from "./Reveal";

type Stage = {
  n: string;
  zh: string;
  scale: string;
  d: string;
  color: string;
  glyph: "particles" | "atoms" | "molecules" | "cells" | "organisms" | "humans" | "ai" | "network" | "cosmic";
};

const STAGES: Stage[] = [
  { n: "Particles", zh: "粒子", scale: "10⁻¹⁵ m", color: "#5fe0f7", glyph: "particles", d: "Quarks and fields flicker out of the vacuum — the universe's first vocabulary." },
  { n: "Atoms", zh: "原子", scale: "10⁻¹⁰ m", color: "#5fe0f7", glyph: "atoms", d: "Forged in the cores of stars, the periodic alphabet of all matter is written." },
  { n: "Molecules", zh: "分子", scale: "10⁻⁹ m", color: "#52e7b6", glyph: "molecules", d: "Atoms bond into chemistry; carbon learns to build long, intricate chains." },
  { n: "Cells", zh: "细胞", scale: "10⁻⁵ m", color: "#2bd49f", glyph: "cells", d: "The first membrane — matter that draws a border and maintains itself against decay." },
  { n: "Organisms", zh: "生物", scale: "10⁰ m", color: "#2bd49f", glyph: "organisms", d: "Cells cooperate into bodies that sense, move, remember and reproduce." },
  { n: "Humans", zh: "人类", scale: "10⁰ m", color: "#f4cd83", glyph: "humans", d: "A nervous system complex enough to model the world — and to ask why it exists." },
  { n: "Artificial Intelligence", zh: "人工智能", scale: "10⁻² m", color: "#5fe0f7", glyph: "ai", d: "Intelligence escapes biology, re-implemented in silicon and light." },
  { n: "Civilization Networks", zh: "文明网络", scale: "10⁷ m", color: "#b394ff", glyph: "network", d: "Billions of minds link into a single planetary mesh of thought and memory." },
  { n: "Cosmic Consciousness", zh: "宇宙意识", scale: "10²⁶ m", color: "#d3c0ff", glyph: "cosmic", d: "The universe, perhaps, waking up — beginning to perceive and understand itself." },
];

function Glyph({ type, color }: { type: Stage["glyph"]; color: string }) {
  const s = { stroke: color, strokeWidth: 1.5, fill: "none" } as const;
  return (
    <svg viewBox="0 0 40 40" className="h-7 w-7" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
      {type === "particles" && (
        <g {...s}>
          {[
            [12, 14],
            [26, 11],
            [20, 22],
            [30, 26],
            [13, 28],
            [24, 31],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.8" fill={color} stroke="none" />
          ))}
        </g>
      )}
      {type === "atoms" && (
        <g {...s}>
          <circle cx="20" cy="20" r="2.4" fill={color} stroke="none" />
          <ellipse cx="20" cy="20" rx="13" ry="5.5" />
          <ellipse cx="20" cy="20" rx="13" ry="5.5" transform="rotate(60 20 20)" />
          <ellipse cx="20" cy="20" rx="13" ry="5.5" transform="rotate(-60 20 20)" />
        </g>
      )}
      {type === "molecules" && (
        <g {...s}>
          <line x1="14" y1="14" x2="26" y2="18" />
          <line x1="26" y1="18" x2="20" y2="28" />
          <circle cx="14" cy="14" r="3.2" />
          <circle cx="26" cy="18" r="3.2" />
          <circle cx="20" cy="28" r="3.2" />
        </g>
      )}
      {type === "cells" && (
        <g {...s}>
          <circle cx="20" cy="20" r="12" />
          <circle cx="20" cy="20" r="4.5" fill={color} stroke="none" opacity="0.7" />
        </g>
      )}
      {type === "organisms" && (
        <g {...s}>
          <path d="M20 6 C20 14, 20 26, 20 34" />
          <path d="M20 14 C14 12, 11 16, 12 20" />
          <path d="M20 20 C26 18, 29 22, 28 26" />
          <path d="M20 26 C15 25, 12 28, 13 31" />
        </g>
      )}
      {type === "humans" && (
        <g {...s}>
          <circle cx="20" cy="13" r="5" />
          <path d="M11 33 C11 24, 29 24, 29 33" />
        </g>
      )}
      {type === "ai" && (
        <g {...s}>
          <rect x="13" y="13" width="14" height="14" rx="2" />
          <circle cx="20" cy="20" r="3" fill={color} stroke="none" />
          {[10, 20, 30].map((p) => (
            <g key={p}>
              <line x1={p} y1="13" x2={p} y2="9" />
              <line x1={p} y1="27" x2={p} y2="31" />
              <line x1="13" y1={p} x2="9" y2={p} />
              <line x1="27" y1={p} x2="31" y2={p} />
            </g>
          ))}
        </g>
      )}
      {type === "network" && (
        <g {...s}>
          {[
            [20, 9],
            [10, 18],
            [30, 18],
            [14, 30],
            [27, 30],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.2" fill={color} stroke="none" />
          ))}
          <path d="M20 9 L10 18 M20 9 L30 18 M10 18 L14 30 M30 18 L27 30 M14 30 L27 30 M10 18 L30 18" opacity="0.6" />
        </g>
      )}
      {type === "cosmic" && (
        <g {...s}>
          <circle cx="20" cy="20" r="3" fill={color} stroke="none" />
          <circle cx="20" cy="20" r="8" opacity="0.7" />
          <circle cx="20" cy="20" r="13" opacity="0.4" />
        </g>
      )}
    </svg>
  );
}

export default function Civilization() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (fillRef.current) fillRef.current.style.height = "100%";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fillRef.current,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: trackRef.current,
            start: "top 70%",
            end: "bottom 70%",
            scrub: 0.7,
          },
        }
      );
    }, trackRef);
    return () => ctx.revert();
  }, []);

  return (
    <SectionShell
      id="civilization"
      index="04"
      kicker="Civilization"
      zh="文明"
      accent="text-gold-400"
      title={
        <>
          The universe gradually
          <span className="text-gold"> awakening.</span>
        </>
      }
      lead="One unbroken arc of rising complexity — from particles to planetary minds. Each rung is built from the last, and each took longer to fall into place than all the rungs before combined."
    >
      <div ref={trackRef} className="relative mx-auto max-w-4xl">
        {/* spine */}
        <div className="absolute top-0 h-full w-px bg-white/10 left-[26px] lg:left-1/2 lg:-translate-x-1/2" />
        <div
          ref={fillRef}
          className="absolute top-0 w-px bg-gradient-to-b from-ion-400 via-bio-400 to-plasma-400 left-[26px] lg:left-1/2 lg:-translate-x-1/2"
          style={{ height: "0%", boxShadow: "0 0 14px rgba(145,102,255,0.7)" }}
        />

        <div className="space-y-10 lg:space-y-3">
          {STAGES.map((st, i) => {
            const right = i % 2 === 1;
            return (
              <div key={st.n} className="relative lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
                {/* node */}
                <div
                  className="absolute z-10 grid h-[54px] w-[54px] place-items-center rounded-full border border-white/15 bg-void-850/90 left-0 lg:left-1/2 lg:-translate-x-1/2"
                  style={{ boxShadow: `0 0 24px -6px ${st.color}` }}
                >
                  <Glyph type={st.glyph} color={st.color} />
                </div>

                {/* card */}
                <div
                  className={`pl-20 lg:pl-0 ${
                    right ? "lg:col-start-2 lg:pl-10" : "lg:col-start-1 lg:pr-10 lg:text-right"
                  }`}
                >
                  <Reveal y={20}>
                    <div className="py-3">
                      <div
                        className={`flex items-baseline gap-3 ${
                          right ? "" : "lg:justify-end"
                        }`}
                      >
                        <span className="mono text-[0.62rem] tracking-widest text-star-500">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-display text-2xl font-semibold text-star-50 md:text-[1.7rem]">
                          {st.n}
                        </h3>
                        <span className="zh text-sm text-star-400">{st.zh}</span>
                      </div>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-star-300 lg:max-w-none">
                        {st.d}
                      </p>
                      <span
                        className="mono mt-2 inline-block text-[0.62rem] tracking-widest"
                        style={{ color: st.color }}
                      >
                        scale ≈ {st.scale}
                      </span>
                    </div>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Reveal>
        <p className="font-display mx-auto mt-16 max-w-2xl text-center text-2xl font-medium italic leading-snug text-gold-300 md:text-3xl">
          “Life may be the universe gradually awakening.”
        </p>
      </Reveal>
    </SectionShell>
  );
}
