"use client";

import { useEffect, useRef } from "react";

interface CodeStreamProps {
  className?: string;
}

/* ---- palette ---------------------------------------------------------- */
const STARLIGHT = "246, 248, 255"; // #f6f8ff — brightest head glyph
const BIO_GREEN = "43, 212, 159"; // #2bd49f
const ION_CYAN = "34, 205, 240"; // #22cdf0

const BASES = ["A", "C", "G", "T"] as const;
const BITS = ["0", "1"] as const;

const COLUMN_SPACING = 22; // ~1 column per 22px of width
const FONT_SIZE = 15; // px (cell height derives from this)

type Mode = "bases" | "bits";

interface Column {
  x: number;
  /** Head position in cell units (fractional, advances each frame). */
  head: number;
  speed: number; // cells per ms
  trail: number; // number of visible glyphs behind the head
  glyphs: string[]; // current glyph buffer (index 0 = head)
  mode: Mode;
  /** Frames remaining in a temporary "bits" transcription run. */
  bitRun: number;
  /** Tint of the trail: 0 → bio-green, 1 → ion-cyan. */
  tint: number;
}

function randomGlyph(mode: Mode): string {
  if (mode === "bits") return BITS[(Math.random() * BITS.length) | 0];
  return BASES[(Math.random() * BASES.length) | 0];
}

export default function CodeStream({ className }: CodeStreamProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = 1;
    let rows = 0;
    let columns: Column[] = [];

    const cellH = Math.round(FONT_SIZE * 1.5);

    const makeColumn = (x: number, randomStart: boolean): Column => {
      const trail = 8 + ((Math.random() * 12) | 0);
      const head = randomStart ? Math.random() * (rows + trail) - trail : -trail;
      const glyphs: string[] = [];
      for (let i = 0; i < trail + 2; i++) glyphs.push(randomGlyph("bases"));
      return {
        x,
        head,
        speed: (0.004 + Math.random() * 0.006) / 1, // cells per ms
        trail,
        glyphs,
        mode: "bases",
        bitRun: 0,
        tint: Math.random(),
      };
    };

    const buildColumns = () => {
      const count = Math.max(1, Math.floor(cssWidth / COLUMN_SPACING));
      const newCols: Column[] = [];
      for (let i = 0; i < count; i++) {
        const x = (i + 0.5) * COLUMN_SPACING;
        newCols.push(makeColumn(x, true));
      }
      columns = newCols;
    };

    const setupSize = () => {
      const rect = wrapper.getBoundingClientRect();
      cssWidth = Math.max(1, rect.width);
      cssHeight = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rows = Math.ceil(cssHeight / cellH) + 2;
      buildColumns();
    };

    setupSize();

    const FONT = `${FONT_SIZE}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`;

    const drawColumn = (col: Column) => {
      ctx.font = FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const headRow = col.head;
      for (let k = 0; k < col.trail; k++) {
        const row = Math.floor(headRow) - k;
        if (row < 0 || row > rows) continue;
        const y = row * cellH + cellH / 2;
        const glyph = col.glyphs[k] ?? randomGlyph(col.mode);

        // Alpha trail: head brightest, tail fades out.
        const tNorm = k / col.trail; // 0 head .. 1 tail
        const alpha = Math.max(0, (1 - tNorm) * (1 - tNorm)); // ease-out fade

        ctx.save();
        if (k === 0) {
          // Leading glyph: starlight white, strongest glow.
          ctx.globalCompositeOperation = "lighter";
          ctx.shadowBlur = 14;
          ctx.shadowColor = `rgba(${STARLIGHT}, 0.9)`;
          ctx.fillStyle = `rgba(${STARLIGHT}, ${0.95 * alpha + 0.05})`;
        } else if (k === 1) {
          // First trail glyph: blend toward strand colour, soft glow.
          ctx.globalCompositeOperation = "lighter";
          ctx.shadowBlur = 8;
          const tintCol = col.tint < 0.5 ? BIO_GREEN : ION_CYAN;
          ctx.shadowColor = `rgba(${tintCol}, 0.5)`;
          ctx.fillStyle = `rgba(${BIO_GREEN}, ${0.7 * alpha})`;
        } else {
          ctx.globalCompositeOperation = "lighter";
          ctx.shadowBlur = 0;
          // Interpolate trail tint between bio-green and ion-cyan.
          const tintCol = col.tint < 0.5 ? BIO_GREEN : ION_CYAN;
          ctx.fillStyle = `rgba(${tintCol}, ${0.55 * alpha})`;
        }
        ctx.fillText(glyph, col.x, y);
        ctx.restore();
      }
    };

    const stepColumn = (col: Column, dt: number) => {
      const prevHead = Math.floor(col.head);
      col.head += col.speed * dt;
      const newHead = Math.floor(col.head);

      // When the head advances to a new cell, shift the glyph buffer and
      // mint a fresh head glyph.
      for (let h = prevHead; h < newHead; h++) {
        // Manage occasional bases→bits transcription runs.
        if (col.bitRun > 0) {
          col.bitRun -= 1;
          if (col.bitRun === 0) col.mode = "bases";
        } else if (col.mode === "bases" && Math.random() < 0.012) {
          col.mode = "bits";
          col.bitRun = 3 + ((Math.random() * 6) | 0);
        }

        col.glyphs.unshift(randomGlyph(col.mode));
        if (col.glyphs.length > col.trail + 2) col.glyphs.pop();
      }

      // Respawn once fully off the bottom.
      if (col.head - col.trail > rows) {
        const respawned = makeColumn(col.x, false);
        respawned.head = -Math.random() * rows * 0.5;
        Object.assign(col, respawned);
      }
    };

    const renderFrame = (dt: number, animate: boolean) => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      for (const col of columns) {
        if (animate) stepColumn(col, dt);
        drawColumn(col);
      }
    };

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      // Distribute heads across the canvas for a representative still frame.
      for (const col of columns) {
        col.head = Math.random() * rows;
      }
      renderFrame(0, false);
    } else {
      let last = performance.now();
      const loop = (now: number) => {
        let dt = now - last;
        last = now;
        if (dt > 64) dt = 64; // clamp after tab switches
        renderFrame(dt, true);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      setupSize();
      if (reduceMotion) {
        for (const col of columns) col.head = Math.random() * rows;
        renderFrame(0, false);
      }
    });
    ro.observe(wrapper);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
