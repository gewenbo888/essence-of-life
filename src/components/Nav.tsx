"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { id: "what-is-life", en: "What Is Life", zh: "何谓生命" },
  { id: "consciousness", en: "Consciousness", zh: "意识" },
  { id: "ai-and-life", en: "AI & Life", zh: "人工智能" },
  { id: "civilization", en: "Civilization", zh: "文明" },
  { id: "ultimate", en: "Ultimate Questions", zh: "终极之问" },
];

export default function Nav() {
  const [progress, setProgress] = useState(0);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
      setSolid(window.scrollY > window.innerHeight * 0.6);
      let cur = "";
      for (const l of LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = l.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? "glass-soft" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-10">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-void-800/70">
            <svg width="17" height="17" viewBox="0 0 32 32" fill="none">
              <path
                d="M11 6 C21 11, 21 21, 11 26 M21 6 C11 11, 11 21, 21 26 M12 9.5 H20 M11.2 13 H20.8 M11.2 19 H20.8 M12 22.5 H20"
                stroke="url(#ng)"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="ng" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#52e7b6" />
                  <stop offset="0.55" stopColor="#22cdf0" />
                  <stop offset="1" stopColor="#9166ff" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="font-display text-[1.05rem] font-semibold leading-none text-star-100">
            The Essence of Life
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`mono text-[0.66rem] uppercase tracking-[0.2em] transition-colors ${
                active === l.id ? "text-bio-400" : "text-star-400 hover:text-star-100"
              }`}
            >
              {l.en}
            </a>
          ))}
        </nav>

        <a
          href="https://psyverse.fun"
          className="mono hidden text-[0.6rem] uppercase tracking-[0.3em] text-star-400 transition-colors hover:text-star-100 sm:block"
        >
          Psyverse ↗
        </a>
      </div>
      <div
        className="h-px origin-left bg-gradient-to-r from-bio-500 via-ion-500 to-plasma-500"
        style={{ transform: `scaleX(${progress})` }}
      />
    </header>
  );
}
