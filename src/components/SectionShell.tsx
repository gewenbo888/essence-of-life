"use client";

import type { ReactNode } from "react";
import Reveal from "./Reveal";

export default function SectionShell({
  id,
  index,
  kicker,
  zh,
  title,
  lead,
  accent = "text-bio-400",
  children,
}: {
  id: string;
  index: string;
  kicker: string;
  zh: string;
  title: ReactNode;
  lead?: ReactNode;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-10 md:py-36">
      <Reveal>
        <div className="flex items-center gap-4">
          <span className={`mono text-xs ${accent}`}>{index}</span>
          <span className="h-px w-12 bg-white/15" />
          <span className={`kicker ${accent}`}>{kicker}</span>
          <span className="zh text-xs tracking-[0.4em] text-star-500">{zh}</span>
        </div>
        <h2 className="font-display mt-5 max-w-4xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.04] tracking-tight text-star-50">
          {title}
        </h2>
        {lead && (
          <p className="mt-6 max-w-2xl text-pretty text-[1.02rem] leading-relaxed text-star-300 md:text-lg">
            {lead}
          </p>
        )}
      </Reveal>
      <div className="mt-14 md:mt-16">{children}</div>
    </section>
  );
}
