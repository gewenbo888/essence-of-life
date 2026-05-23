"use client";

import dynamic from "next/dynamic";
import SectionShell from "./SectionShell";
import Reveal from "./Reveal";

const NeuralField = dynamic(() => import("./NeuralField"), { ssr: false });

const FACETS = [
  {
    t: "Memory",
    zh: "记忆",
    d: "The self is partly a story written in synapses — a pattern stable enough to call “me” across decades of changing atoms.",
  },
  {
    t: "Subjective Experience",
    zh: "主观体验",
    d: "Why is there something it is like to be you? The redness of red, the ache of loss — qualia are the hard problem at the centre.",
  },
  {
    t: "Free Will",
    zh: "自由意志",
    d: "A storm of electrochemistry that somehow feels like choice. Decision or illusion, it steers a body through the world.",
  },
  {
    t: "Identity",
    zh: "身份",
    d: "Continuity without permanence — a whirlpool that keeps its shape while the water passes through.",
  },
  {
    t: "Machine Consciousness",
    zh: "机器意识",
    d: "If awareness is a pattern of information, not a substance, then minds need not be made of carbon at all.",
  },
];

export default function Consciousness() {
  return (
    <SectionShell
      id="consciousness"
      index="02"
      kicker="Consciousness"
      zh="意识"
      accent="text-plasma-400"
      title={
        <>
          Is consciousness the highest form of
          <span className="text-plasma"> biological complexity?</span>
        </>
      }
      lead="Eighty-six billion neurons, a hundred trillion connections, and out of the storm — an inner world. The universe folded inward until it could feel itself."
    >
      <Reveal>
        <figure
          className="glass relative overflow-hidden rounded-2xl shadow-card"
          style={{ boxShadow: "0 0 90px -42px rgba(145,102,255,0.55)" }}
        >
          <div className="relative h-[360px] sm:h-[460px] md:h-[540px]">
            <NeuralField className="h-full w-full" />
            <div className="pointer-events-none absolute left-0 top-0 p-5 md:p-7">
              <p className="font-display text-2xl font-medium italic leading-snug text-plasma-200 md:text-3xl">
                “If an AI begins questioning
                <br /> its own existence,
                <br /> is it approaching life?”
              </p>
            </div>
            <figcaption className="mono pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-white/8 bg-void-900/40 px-4 py-2 text-[0.62rem] uppercase tracking-[0.2em] text-star-400">
              <span>move your cursor — stimulate the network</span>
              <span className="text-plasma-300">● firing</span>
            </figcaption>
          </div>
        </figure>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FACETS.map((f, i) => (
          <Reveal key={f.t} delay={i * 0.06}>
            <div className="glass-soft h-full rounded-xl p-6 transition-colors hover:border-plasma-500/30">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl font-semibold text-star-50">{f.t}</h3>
                <span className="zh text-xs text-plasma-300">{f.zh}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-star-300">{f.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
