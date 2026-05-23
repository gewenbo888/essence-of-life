"use client";

import { useEffect, useRef } from "react";

/**
 * CellDivision — a microscopy-style mitosis loop rendered in light.
 *
 * Cycle (~8s, looping):
 *   (a) a single luminous cell, nucleus + drifting organelles
 *   (b) growth, nucleus condenses then splits, daughter nuclei migrate apart
 *   (c) membrane pinches at the middle (cytokinesis) and separates
 *   (d) two daughters drift apart, then crossfade back to a single cell
 *
 * Transparent background; additive glow; everything driven by Canvas 2D.
 */

interface CellDivisionProps {
  className?: string;
}

// Palette
const BIO_GREEN = "#2bd49f";
const BIO_LIGHT = "#8cf3d2";
const BIO_MID = "#52e7b6";
const ION_CYAN = "#22cdf0";
const ION_LIGHT = "#9eeefb";
const PLASMA_VIOLET = "#9166ff";
const GOLD = "#eab85c";

interface Organelle {
  // position within the unit cell space (-1..1 relative to cell radius)
  ang: number;
  rad: number;
  speed: number;
  size: number;
  hue: string;
  jitterPhase: number;
}

interface Vec2 {
  x: number;
  y: number;
}

export default function CellDivision({ className }: CellDivisionProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let cssWidth = wrapper.clientWidth || 1;
    let cssHeight = wrapper.clientHeight || 1;

    const resize = () => {
      cssWidth = wrapper.clientWidth || 1;
      cssHeight = wrapper.clientHeight || 1;
      canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
      canvas.height = Math.max(1, Math.floor(cssHeight * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    // Stable set of organelles (in unit space; rendered per-cell)
    const organelles: Organelle[] = [];
    const palette = [BIO_LIGHT, ION_LIGHT, GOLD, BIO_MID];
    for (let i = 0; i < 9; i++) {
      organelles.push({
        ang: Math.random() * Math.PI * 2,
        rad: 0.18 + Math.random() * 0.55,
        speed: (Math.random() - 0.5) * 0.4,
        size: 1.4 + Math.random() * 2.2,
        hue: palette[i % palette.length],
        jitterPhase: Math.random() * Math.PI * 2,
      });
    }

    const CYCLE = 8.2; // seconds per full division loop

    // Wobbling radius so the membrane reads as alive, not a perfect circle.
    const wobble = (baseR: number, t: number, seed: number): ((a: number) => number) => {
      return (a: number) => {
        const w =
          Math.sin(a * 3 + t * 1.1 + seed) * 0.018 +
          Math.sin(a * 5 - t * 0.7 + seed * 1.7) * 0.012 +
          Math.sin(a * 2 + t * 0.4 + seed * 0.3) * 0.02;
        return baseR * (1 + w);
      };
    };

    // Draw a closed blob path from a radius function.
    const blobPath = (
      cx: number,
      cy: number,
      radiusFn: (a: number) => number,
      steps = 72
    ) => {
      context.beginPath();
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const r = radiusFn(a);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
    };

    // Render one cell (membrane glow, body gradient, rim, nucleus, organelles).
    const drawCell = (
      center: Vec2,
      radius: number,
      t: number,
      seed: number,
      alpha: number,
      nuclei: Array<{ x: number; y: number; r: number }>,
      pulse: number
    ) => {
      if (alpha <= 0.001 || radius <= 0.5) return;

      const r = radius * pulse;
      const radiusFn = wobble(r, t, seed);

      context.save();
      context.globalAlpha = alpha;

      // --- Outer membrane glow (additive halo) ---
      context.globalCompositeOperation = "lighter";
      const halo = context.createRadialGradient(
        center.x,
        center.y,
        r * 0.4,
        center.x,
        center.y,
        r * 1.5
      );
      halo.addColorStop(0, "rgba(43,212,159,0.30)");
      halo.addColorStop(0.5, "rgba(34,205,240,0.14)");
      halo.addColorStop(1, "rgba(34,205,240,0)");
      context.fillStyle = halo;
      blobPath(center.x, center.y, (a) => radiusFn(a) * 1.5);
      context.fill();

      // --- Cytoplasm body (bio-green core -> ion-cyan rim) ---
      context.globalCompositeOperation = "source-over";
      const body = context.createRadialGradient(
        center.x - r * 0.15,
        center.y - r * 0.15,
        r * 0.08,
        center.x,
        center.y,
        r
      );
      body.addColorStop(0, "rgba(140,243,210,0.55)");
      body.addColorStop(0.45, "rgba(43,212,159,0.38)");
      body.addColorStop(0.82, "rgba(34,205,240,0.30)");
      body.addColorStop(1, "rgba(34,205,240,0.05)");
      context.fillStyle = body;
      blobPath(center.x, center.y, radiusFn);
      context.fill();

      // --- Luminous membrane rim ---
      context.globalCompositeOperation = "lighter";
      context.lineWidth = Math.max(1.2, r * 0.035);
      context.strokeStyle = "rgba(158,238,251,0.85)";
      context.shadowBlur = r * 0.5;
      context.shadowColor = ION_CYAN;
      blobPath(center.x, center.y, radiusFn);
      context.stroke();
      context.shadowBlur = 0;

      // --- Organelles drifting inside (clipped to membrane) ---
      context.save();
      blobPath(center.x, center.y, radiusFn);
      context.clip();
      for (const o of organelles) {
        const a = o.ang + t * o.speed;
        const jitter = Math.sin(t * 2.3 + o.jitterPhase) * 0.05;
        const rr = (o.rad + jitter) * r * 0.82;
        const ox = center.x + Math.cos(a) * rr;
        const oy = center.y + Math.sin(a) * rr * 0.92;
        const og = context.createRadialGradient(ox, oy, 0, ox, oy, o.size * 2.4);
        og.addColorStop(0, o.hue);
        og.addColorStop(1, "rgba(43,212,159,0)");
        context.fillStyle = og;
        context.beginPath();
        context.arc(ox, oy, o.size * 2.4, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();

      // --- Nucleus / nuclei ---
      for (const n of nuclei) {
        const nucGrad = context.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          n.r
        );
        nucGrad.addColorStop(0, "rgba(211,192,255,0.95)");
        nucGrad.addColorStop(0.4, "rgba(145,102,255,0.7)");
        nucGrad.addColorStop(1, "rgba(145,102,255,0)");
        context.fillStyle = nucGrad;
        context.shadowBlur = n.r * 1.2;
        context.shadowColor = PLASMA_VIOLET;
        context.beginPath();
        context.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;

        // dense nucleolus dot
        context.fillStyle = "rgba(250,226,179,0.9)";
        context.beginPath();
        context.arc(n.x, n.y, Math.max(1, n.r * 0.28), 0, Math.PI * 2);
        context.fill();
      }

      context.restore();
    };

    const render = (timeMs: number) => {
      const t = timeMs / 1000;
      context.clearRect(0, 0, cssWidth, cssHeight);

      const cx = cssWidth / 2;
      const cy = cssHeight / 2;
      const baseR = Math.min(cssWidth, cssHeight) * 0.2;

      // gentle breathing pulse for a living quality
      const pulse = 1 + Math.sin(t * 1.6) * 0.025;

      // phase 0..1 within the cycle
      const phase = (t % CYCLE) / CYCLE;

      // separation distance for daughters (in px), as a function of phase
      // p < 0.18: single cell; 0.18-0.42: nucleus splits & migrates;
      // 0.42-0.70: membrane pinches & separates; 0.70-0.88: drift apart;
      // 0.88-1.0: crossfade back to single
      let sep = 0;
      let nucSplit = 0; // 0 = single nucleus, 1 = fully two nuclei apart
      let cellGrow = 1;
      let pinch = 0; // 0 = round, 1 = fully pinched into two

      if (phase < 0.18) {
        cellGrow = 1 + (phase / 0.18) * 0.12;
      } else if (phase < 0.42) {
        const p = (phase - 0.18) / 0.24;
        cellGrow = 1.12 + p * 0.05;
        nucSplit = easeInOut(p);
      } else if (phase < 0.7) {
        const p = (phase - 0.42) / 0.28;
        cellGrow = 1.17 - p * 0.05;
        nucSplit = 1;
        pinch = easeInOut(p);
        sep = baseR * 0.55 * easeInOut(p);
      } else if (phase < 0.88) {
        const p = (phase - 0.7) / 0.18;
        nucSplit = 1;
        pinch = 1;
        sep = baseR * (0.55 + p * 0.35);
        cellGrow = 1.12;
      } else {
        // crossfade reset handled below via alpha
        nucSplit = 1;
        pinch = 1;
        sep = baseR * 0.9;
        cellGrow = 1.12;
      }

      const r = baseR * cellGrow;

      // Crossfade in the final segment: fade out the two daughters,
      // fade in a fresh single cell.
      const fadeP = phase >= 0.88 ? (phase - 0.88) / 0.12 : 0;
      const daughterAlpha = phase >= 0.88 ? 1 - easeInOut(fadeP) : 1;
      const rebornAlpha = phase >= 0.88 ? easeInOut(fadeP) : 0;

      drawConnective(context, cx, cy, r, t, pinch);

      if (pinch < 0.6 && nucSplit < 1) {
        // Single coherent cell — one or two nuclei inside one membrane.
        const nuclei: Array<{ x: number; y: number; r: number }> = [];
        const nucR = r * 0.22 * (1 - nucSplit * 0.35);
        const off = r * 0.42 * nucSplit;
        if (nucSplit < 0.05) {
          // condensing single nucleus
          const condense = phase < 0.18 ? 1 : 1 - (nucSplit * 1.5);
          nuclei.push({ x: cx, y: cy, r: nucR * Math.max(0.6, condense) });
        } else {
          nuclei.push({ x: cx - off, y: cy, r: nucR });
          nuclei.push({ x: cx + off, y: cy, r: nucR });
        }
        drawCell({ x: cx, y: cy }, r, t, 1.0, daughterAlpha, nuclei, pulse);
      } else {
        // Two daughter cells (during/after pinch + separation).
        const leftR = r * (0.62 + (1 - pinch) * 0.38);
        const rightR = leftR;
        const lx = cx - sep;
        const rx = cx + sep;

        // While pinching but still touching, draw a connecting neck of glow.
        if (pinch < 1) {
          drawNeck(context, cx, cy, leftR, sep, pinch, t);
        }

        drawCell(
          { x: lx, y: cy },
          leftR,
          t,
          2.3,
          daughterAlpha,
          [{ x: lx, y: cy, r: leftR * 0.3 }],
          pulse
        );
        drawCell(
          { x: rx, y: cy },
          rightR,
          t,
          4.1,
          daughterAlpha,
          [{ x: rx, y: cy, r: rightR * 0.3 }],
          pulse
        );
      }

      // Reborn single cell crossfading in.
      if (rebornAlpha > 0.001) {
        drawCell(
          { x: cx, y: cy },
          baseR,
          t,
          7.7,
          rebornAlpha,
          [{ x: cx, y: cy, r: baseR * 0.22 }],
          pulse
        );
      }

      rafRef.current = requestAnimationFrame(render);
    };

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      // One representative static frame: a single luminous cell mid-pulse.
      context.clearRect(0, 0, cssWidth, cssHeight);
      const cx = cssWidth / 2;
      const cy = cssHeight / 2;
      const baseR = Math.min(cssWidth, cssHeight) * 0.2;
      drawCell(
        { x: cx, y: cy },
        baseR * 1.05,
        0.6,
        1.0,
        1,
        [{ x: cx, y: cy, r: baseR * 0.22 }],
        1
      );
    } else {
      rafRef.current = requestAnimationFrame(render);
    }

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

// --- helpers (pure; safe to define at module scope) ---

function easeInOut(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

// Faint cytoskeletal / spindle threads that suggest internal structure.
function drawConnective(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  t: number,
  pinch: number
) {
  if (pinch >= 0.95) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(158,238,251,0.10)";
  ctx.lineWidth = 0.8;
  const spokes = 5;
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2 + t * 0.15;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(a) * r * 0.4, cy - Math.sin(a) * r * 0.4);
    ctx.lineTo(cx + Math.cos(a) * r * 0.4, cy + Math.sin(a) * r * 0.4);
    ctx.stroke();
  }
  ctx.restore();
}

// A connecting neck of luminosity while two daughters are still pinching apart.
function drawNeck(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellR: number,
  sep: number,
  pinch: number,
  t: number
) {
  const neckH = cellR * (1 - pinch) * 0.85;
  if (neckH <= 0.5) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const grad = ctx.createLinearGradient(cx - sep, cy, cx + sep, cy);
  grad.addColorStop(0, "rgba(43,212,159,0.0)");
  grad.addColorStop(0.5, `rgba(82,231,182,${0.4 * (1 - pinch)})`);
  grad.addColorStop(1, "rgba(43,212,159,0.0)");
  ctx.fillStyle = grad;
  const wob = Math.sin(t * 2) * neckH * 0.08;
  ctx.beginPath();
  ctx.moveTo(cx - sep, cy - neckH);
  ctx.quadraticCurveTo(cx, cy - neckH * 0.4 + wob, cx + sep, cy - neckH);
  ctx.lineTo(cx + sep, cy + neckH);
  ctx.quadraticCurveTo(cx, cy + neckH * 0.4 - wob, cx - sep, cy + neckH);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
