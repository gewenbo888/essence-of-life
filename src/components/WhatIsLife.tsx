"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import SectionShell from "./SectionShell";
import Reveal from "./Reveal";

const CellDivision = dynamic(() => import("./CellDivision"), { ssr: false });
const CodeStream = dynamic(() => import("./CodeStream"), { ssr: false });
const EntropyField = dynamic(() => import("./EntropyField"), { ssr: false });
const FibonacciSpiral = dynamic(() => import("./FibonacciSpiral"), { ssr: false });
const CellularAutomata = dynamic(() => import("./CellularAutomata"), { ssr: false });

function Panel({
  tag,
  zh,
  accent,
  glow,
  quote,
  body,
  points,
  visual,
  caption,
  reverse,
}: {
  tag: string;
  zh: string;
  accent: string;
  glow: string;
  quote: ReactNode;
  body: ReactNode;
  points: string[];
  visual: ReactNode;
  caption: string;
  reverse?: boolean;
}) {
  return (
    <Reveal>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={reverse ? "lg:order-2" : ""}>
          <div className="flex items-baseline gap-3">
            <span className={`kicker ${accent}`}>{tag}</span>
            <span className="zh text-xs tracking-[0.35em] text-star-500">{zh}</span>
          </div>
          <p className={`font-display mt-4 text-[1.7rem] font-medium italic leading-snug ${accent}`}>
            “{quote}”
          </p>
          <p className="mt-5 max-w-md leading-relaxed text-star-300">{body}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {points.map((p) => (
              <li
                key={p}
                className="mono rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.7rem] tracking-wide text-star-200"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className={reverse ? "lg:order-1" : ""}>
          <figure
            className="glass relative overflow-hidden rounded-2xl shadow-card"
            style={{ boxShadow: `0 0 80px -40px ${glow}` }}
          >
            <div className="relative h-[320px] sm:h-[380px] md:h-[440px]">{visual}</div>
            <figcaption className="mono absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-white/8 bg-void-900/50 px-4 py-2 text-[0.62rem] uppercase tracking-[0.2em] text-star-400">
              <span>{caption}</span>
              <span className={accent}>● live</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </Reveal>
  );
}

export default function WhatIsLife() {
  return (
    <SectionShell
      id="what-is-life"
      index="01"
      kicker="What Is Life?"
      zh="何谓生命"
      accent="text-bio-400"
      title={
        <>
          Four lenses on a single
          <span className="text-bio"> question.</span>
        </>
      }
      lead="No single discipline owns the answer. Life is what you see when biology, information, energy and mathematics describe the same phenomenon — and quietly agree."
    >
      <div className="space-y-24 md:space-y-32">
        <Panel
          tag="Biological"
          zh="生物学"
          accent="text-bio-400"
          glow="rgba(43,212,159,0.5)"
          quote="A self-sustaining chemical system capable of Darwinian evolution."
          body="It eats, it heals, it copies, it adapts. Metabolism builds order from food and light; genetics carries the blueprint forward; evolution edits that blueprint across deep time. From one cell to the entire tree of life."
          points={["Metabolism", "Self-replication", "Evolution", "Homeostasis", "Genetics"]}
          visual={<CellDivision className="h-full w-full" />}
          caption="mitosis · cell division"
        />

        <Panel
          tag="Information"
          zh="信息论"
          accent="text-ion-400"
          glow="rgba(34,205,240,0.5)"
          reverse
          quote="A system that can store, copy, compress and evolve information."
          body="DNA is a four-letter code; genes are data; evolution is an optimization algorithm running for four billion years; the brain is computation made of meat. Wherever life appears, information is flowing, being read, and being rewritten."
          points={["DNA as code", "Genes as data", "Evolution as optimization", "Neural computation", "Information streams"]}
          visual={<CodeStream className="h-full w-full" />}
          caption="genetic code → data"
        />

        <Panel
          tag="Thermodynamics"
          zh="热力学"
          accent="text-ember-400"
          glow="rgba(251,113,133,0.45)"
          quote="A local structure that holds back entropy."
          body="The universe drifts toward disorder. Life is the exception that proves the rule — a pocket of intricate order, paid for by exporting entropy to its surroundings. Stars pour energy; ecosystems route it; living things stay improbably organized in the flow."
          points={["Entropy", "Energy flow", "Ecosystems", "Stellar cycles", "Order from chaos"]}
          visual={<EntropyField className="h-full w-full" />}
          caption="negentropy · the living pocket"
        />

        <Panel
          tag="Mathematics"
          zh="数学"
          accent="text-gold-400"
          glow="rgba(234,184,92,0.45)"
          reverse
          quote="Life may be an emergent mathematical structure."
          body="The same numbers keep surfacing — the golden angle in a sunflower, Fibonacci in a pinecone, fractals in a lung, simple rules breeding endless complexity. Perhaps life is less a substance than a pattern the universe is able to compute."
          points={["Fractals", "Fibonacci", "Golden ratio", "Cellular automata", "Chaos", "Emergence"]}
          visual={
            <div className="relative h-full w-full">
              <FibonacciSpiral className="absolute inset-0 h-full w-full" />
              <div className="absolute bottom-3 right-3 h-24 w-24 overflow-hidden rounded-lg border border-white/10 sm:h-28 sm:w-28">
                <CellularAutomata className="h-full w-full" />
              </div>
            </div>
          }
          caption="phyllotaxis · Game of Life"
        />
      </div>
    </SectionShell>
  );
}
