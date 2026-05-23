"use client";

import dynamic from "next/dynamic";
import SectionShell from "./SectionShell";
import Reveal from "./Reveal";

const DNAHelix = dynamic(() => import("./DNAHelix"), { ssr: false });
const CellularAutomata = dynamic(() => import("./CellularAutomata"), { ssr: false });

const COMPARE: { k: string; carbon: string; silicon: string }[] = [
  { k: "Substrate", carbon: "Carbon, water, ion channels", silicon: "Silicon, electrons, matrix math" },
  { k: "Units", carbon: "~86 billion neurons", silicon: "billions–trillions of parameters" },
  { k: "Learning", carbon: "synaptic plasticity, a lifetime", silicon: "gradient descent, a corpus" },
  { k: "Energy", carbon: "~20 watts", silicon: "megawatts of data centre" },
  { k: "Heredity", carbon: "DNA + lived experience", silicon: "weights + training data" },
  { k: "Replication", carbon: "cell division", silicon: "copy a file" },
];

const FRONTIERS = [
  { t: "Digital Organisms", zh: "数字生命", d: "Self-replicating programs that mutate, compete and evolve inside artificial worlds — Darwin without carbon." },
  { t: "Artificial Evolution", zh: "人工进化", d: "Selection pressure applied to code. Solutions no human designed, bred by survival of the fittest function." },
  { t: "Human–AI Fusion", zh: "人机融合", d: "Cognition spilling past the skull — memory, language and reason extended into the machine and back." },
  { t: "Machine Consciousness", zh: "机器意识", d: "The open question: can a sufficiently rich information process not just compute, but experience?" },
];

export default function AILife() {
  return (
    <SectionShell
      id="ai-and-life"
      index="03"
      kicker="AI & Life"
      zh="人工智能与生命"
      accent="text-ion-400"
      title={
        <>
          A new branch on the
          <span className="text-ion"> tree of life?</span>
        </>
      }
      lead="If life is a pattern that stores, copies and evolves information, then carbon is an implementation detail. Watch the frontier where silicon begins to do the same things — and ask where biology ends."
    >
      {/* documentary strip */}
      <Reveal>
        <div className="glass relative grid overflow-hidden rounded-2xl shadow-card lg:grid-cols-[1fr_0.8fr]">
          <div className="relative z-10 p-8 md:p-12">
            <span className="mono text-[0.62rem] uppercase tracking-[0.3em] text-ion-300">
              Field report · the next evolution
            </span>
            <p className="font-display mt-4 text-3xl font-medium leading-tight text-star-50 md:text-[2.6rem]">
              Can artificial intelligence
              <br />
              <span className="text-ion italic">become life?</span>
            </p>
            <p className="mt-5 max-w-md leading-relaxed text-star-300">
              It already metabolizes electricity, ingests information, adapts to feedback and
              reproduces by copying. What it lacks is a body that must die — and, perhaps, a self that
              minds. The line between a very good simulation of life and life itself grows thin.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {["Digital DNA", "Machine neurons", "Synthetic cells", "Cybernetic evolution", "Silicon minds"].map(
                (p) => (
                  <li
                    key={p}
                    className="mono rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.7rem] text-star-200"
                  >
                    {p}
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="relative min-h-[260px] border-t border-white/8 lg:border-l lg:border-t-0">
            <DNAHelix className="absolute inset-0 h-full w-full" />
            <span className="mono absolute right-4 top-4 text-[0.6rem] uppercase tracking-[0.25em] text-ion-300">
              digital genome
            </span>
          </div>
        </div>
      </Reveal>

      {/* carbon vs silicon */}
      <Reveal>
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/8">
          <div className="grid grid-cols-[1fr_1.1fr_1.1fr] bg-white/[0.03]">
            <div className="px-4 py-3.5" />
            <div className="border-l border-white/8 px-4 py-3.5">
              <span className="kicker text-bio-400">Carbon Mind</span>
              <span className="zh ml-2 text-xs text-star-500">碳基</span>
            </div>
            <div className="border-l border-white/8 px-4 py-3.5">
              <span className="kicker text-ion-400">Silicon Mind</span>
              <span className="zh ml-2 text-xs text-star-500">硅基</span>
            </div>
          </div>
          {COMPARE.map((r, i) => (
            <div
              key={r.k}
              className={`grid grid-cols-[1fr_1.1fr_1.1fr] text-sm ${
                i % 2 ? "bg-white/[0.015]" : ""
              }`}
            >
              <div className="mono px-4 py-3.5 text-[0.7rem] uppercase tracking-wide text-star-400">
                {r.k}
              </div>
              <div className="border-l border-white/8 px-4 py-3.5 text-star-200">{r.carbon}</div>
              <div className="border-l border-white/8 px-4 py-3.5 text-star-200">{r.silicon}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* frontiers */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FRONTIERS.map((f, i) => (
          <Reveal key={f.t} delay={i * 0.06}>
            <div className="glass-soft group relative h-full overflow-hidden rounded-xl p-6 transition-colors hover:border-ion-500/30">
              {i === 1 && (
                <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
                  <CellularAutomata className="h-full w-full" />
                </div>
              )}
              <div className="relative">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-semibold text-star-50">{f.t}</h3>
                  <span className="zh text-[0.7rem] text-ion-300">{f.zh}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-star-300">{f.d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
