"use client";

import dynamic from "next/dynamic";
import FloatingEquations from "./FloatingEquations";

const DNAHelix = dynamic(() => import("./DNAHelix"), { ssr: false });

const BUTTONS = [
  { label: "Explore Life", href: "#what-is-life", primary: true },
  { label: "Enter the Consciousness Universe", href: "#consciousness", primary: false },
  { label: "From Cells to Civilization", href: "#civilization", primary: false },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-24 text-center"
    >
      <FloatingEquations />

      {/* DNA helix flanks, faint behind the type */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[18vw] opacity-50 lg:block">
        <DNAHelix />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[18vw] opacity-50 lg:block">
        <DNAHelix speed={-1} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <p className="kicker fade-up text-bio-400" style={{ animationDelay: "0.05s" }}>
          The Essence of Life
          <span className="zh ml-3 tracking-[0.5em] text-star-400">生命的本质</span>
        </p>

        <h1
          className="font-display fade-up mt-6 text-[clamp(2.6rem,8vw,6.2rem)] font-semibold leading-[0.98] tracking-tight"
          style={{ animationDelay: "0.18s" }}
        >
          Life is more than
          <br />
          <span className="text-aurora italic">carbon chemistry.</span>
        </h1>

        <p
          className="fade-up mx-auto mt-8 max-w-2xl text-balance text-[1.05rem] leading-relaxed text-star-300 md:text-[1.22rem]"
          style={{ animationDelay: "0.5s" }}
        >
          Life may be the universe organizing information against entropy —
          a flame of order kindled in the cold, copying itself forward through time.
        </p>

        <div
          className="fade-up mt-11 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:flex-wrap"
          style={{ animationDelay: "0.8s" }}
        >
          {BUTTONS.map((b) => (
            <a
              key={b.label}
              href={b.href}
              className={
                b.primary
                  ? "group relative rounded-full bg-gradient-to-r from-bio-500 to-ion-500 px-7 py-3 text-sm font-medium text-void-950 shadow-glow transition-transform hover:scale-[1.03]"
                  : "rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-medium text-star-200 backdrop-blur-sm transition-colors hover:border-white/25 hover:text-star-50"
              }
            >
              {b.label}
            </a>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <a
          href="#what-is-life"
          className="fade-up"
          style={{ animationDelay: "1.3s" }}
          aria-label="Scroll to explore"
        >
          <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-star-200" />
          </span>
        </a>
      </div>
    </section>
  );
}
