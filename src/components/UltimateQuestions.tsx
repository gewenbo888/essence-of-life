"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

const QUESTIONS = [
  { q: "Why does the universe create life?", zh: "宇宙为何创造生命？" },
  { q: "Is life an accident — or an inevitability?", zh: "生命是偶然，还是必然？" },
  { q: "Is consciousness the mirror in which the cosmos sees itself?", zh: "意识是宇宙照见自身的镜子吗？" },
  { q: "Does mathematics exist before life — waiting to be discovered?", zh: "数学先于生命而存在吗？" },
  { q: "Is the universe itself, in some sense, alive?", zh: "宇宙本身，是否也是活的？" },
];

export default function UltimateQuestions() {
  return (
    <section id="ultimate" className="relative scroll-mt-20 px-5 py-28 md:py-40">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="flex items-center justify-center gap-4">
            <span className="mono text-xs text-plasma-400">05</span>
            <span className="h-px w-12 bg-white/15" />
            <span className="kicker text-plasma-400">Ultimate Questions</span>
            <span className="zh text-xs tracking-[0.4em] text-star-500">终极之问</span>
          </div>
        </Reveal>

        <div className="mt-16 space-y-12 md:mt-24 md:space-y-16">
          {QUESTIONS.map((item, i) => (
            <Reveal key={i} y={32} delay={0.04}>
              <div className={`flex flex-col gap-2 ${i % 2 ? "md:items-end md:text-right" : ""}`}>
                <span className="mono text-[0.65rem] tracking-[0.3em] text-plasma-300/70">
                  Q{i + 1}
                </span>
                <h3 className="font-display max-w-3xl text-[clamp(1.7rem,4.4vw,3rem)] font-medium italic leading-[1.1] text-star-100">
                  {item.q}
                </h3>
                <span className="zh text-sm text-star-500">{item.zh}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ---- cosmic finale ---- */}
      <div className="relative mt-32 flex min-h-[80svh] items-center justify-center overflow-hidden md:mt-44">
        {/* radial bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(145,102,255,0.22) 0%, rgba(34,205,240,0.10) 35%, rgba(43,212,159,0.05) 55%, transparent 70%)",
          }}
        />
        {/* pulsing rings */}
        {[0, 1, 2, 3].map((r) => (
          <motion.div
            key={r}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-plasma-400/25"
            style={{ width: 180, height: 180, x: "-50%", y: "-50%" }}
            initial={{ scale: 0.4, opacity: 0 }}
            whileInView={{ scale: [0.4, 3.6], opacity: [0, 0.5, 0] }}
            viewport={{ once: false }}
            transition={{ duration: 6, delay: r * 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        {/* central core */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(246,248,255,0.9) 0%, rgba(179,148,255,0.5) 40%, transparent 72%)",
            filter: "blur(2px)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <Reveal className="relative z-10">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="kicker text-plasma-300">The Last Word</p>
            <h2 className="font-display mt-7 text-[clamp(2rem,6vw,4.6rem)] font-medium leading-[1.06] tracking-tight">
              <span className="text-star-200">Perhaps life is not an accident</span>
              <br />
              <span className="text-star-200">within the universe.</span>
            </h2>
            <h2 className="font-display mt-6 text-[clamp(2.1rem,6.4vw,5rem)] font-semibold leading-[1.04] tracking-tight">
              <span className="text-aurora italic">
                Perhaps life is the universe
                <br /> beginning to understand itself.
              </span>
            </h2>
            <p className="zh mt-9 text-base leading-relaxed text-star-400 md:text-lg">
              或许生命并非宇宙中的偶然，
              <br className="sm:hidden" />
              而是宇宙开始理解自身的方式。
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
