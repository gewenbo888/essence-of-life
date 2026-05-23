"use client";

import { useEffect, useRef } from "react";

interface CellularAutomataProps {
  className?: string;
}

/**
 * CellularAutomata — Conway's Game of Life rendered as luminous, glowing cells.
 *
 * Living cells glow bio-green → ion-cyan; dying cells leave a brief fading trail
 * via a low-alpha dark wash. The simulation advances on a fixed tick while the
 * canvas re-renders smoothly each frame. It re-seeds gracefully (with a soft
 * fade) whenever the population collapses or stagnates, so recognizable
 * structures keep emerging from the simple rules.
 */
export default function CellularAutomata({ className }: CellularAutomataProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const context = ctx;

    // --- palette -----------------------------------------------------------
    const BIO_GREEN = "#2bd49f";
    const BIO_MID = "#52e7b6";
    const ION_CYAN = "#22cdf0";

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- simulation state --------------------------------------------------
    const CELL = 12; // logical px per cell (~10–14px)
    const TICK_MS = 110; // fixed simulation step

    let cols = 0;
    let rows = 0;
    let grid: Uint8Array = new Uint8Array(0);
    let next: Uint8Array = new Uint8Array(0);
    // Per-cell glow energy (0..1) so dying cells fade and births bloom.
    let energy: Float32Array = new Float32Array(0);

    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = 1;

    let lastTickTime = 0;
    let liveCount = 0;
    let prevLiveCount = -1;
    let stagnantTicks = 0;
    let reseedFade = 0; // 1 → 0 soft white-out used while re-seeding

    const idx = (x: number, y: number): number => y * cols + x;

    const stampGlider = (ox: number, oy: number, flip: boolean): void => {
      // Canonical glider; `flip` mirrors travel direction for variety.
      const cells: Array<[number, number]> = flip
        ? [
            [2, 0],
            [0, 1],
            [2, 1],
            [1, 2],
            [2, 2],
          ]
        : [
            [0, 0],
            [1, 0],
            [2, 0],
            [2, 1],
            [1, 2],
          ];
      for (const [dx, dy] of cells) {
        const x = ox + dx;
        const y = oy + dy;
        if (x >= 0 && x < cols && y >= 0 && y < rows) grid[idx(x, y)] = 1;
      }
    };

    const stampBlinker = (ox: number, oy: number): void => {
      for (let i = 0; i < 3; i++) {
        const x = ox + i;
        const y = oy;
        if (x >= 0 && x < cols && y >= 0 && y < rows) grid[idx(x, y)] = 1;
      }
    };

    const seed = (): void => {
      grid.fill(0);
      // Low-density random soup.
      const density = 0.16;
      for (let i = 0; i < grid.length; i++) {
        if (Math.random() < density) grid[i] = 1;
      }
      // A couple of recognizable patterns that travel / oscillate.
      if (cols > 12 && rows > 12) {
        stampGlider(2, 2, false);
        stampGlider(Math.max(2, cols - 8), Math.max(2, rows - 8), true);
        stampBlinker(Math.floor(cols / 2), Math.floor(rows / 2));
        stampBlinker(Math.floor(cols / 3), Math.floor(rows / 4));
      }
      stagnantTicks = 0;
      prevLiveCount = -1;
      reseedFade = 1;
    };

    const allocate = (): void => {
      cols = Math.max(1, Math.floor(cssWidth / CELL));
      rows = Math.max(1, Math.floor(cssHeight / CELL));
      const size = cols * rows;
      grid = new Uint8Array(size);
      next = new Uint8Array(size);
      energy = new Float32Array(size);
      seed();
    };

    const step = (): void => {
      let alive = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let n = 0;
          // Toroidal wrap keeps gliders alive as they exit the field.
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = (x + dx + cols) % cols;
              const ny = (y + dy + rows) % rows;
              n += grid[idx(nx, ny)];
            }
          }
          const cell = grid[idx(x, y)];
          const willLive = cell ? n === 2 || n === 3 : n === 3;
          next[idx(x, y)] = willLive ? 1 : 0;
          if (willLive) alive++;
        }
      }
      const tmp = grid;
      grid = next;
      next = tmp;

      // Stagnation / collapse detection.
      const threshold = Math.max(6, Math.floor((cols * rows) * 0.012));
      if (alive === prevLiveCount) {
        stagnantTicks++;
      } else {
        stagnantTicks = 0;
      }
      prevLiveCount = alive;
      liveCount = alive;
      if (alive < threshold || stagnantTicks >= 40) {
        seed();
      }
    };

    const render = (): void => {
      // Fading-trail wash: a low-alpha dark veil instead of a hard clear.
      context.globalCompositeOperation = "source-over";
      context.fillStyle = "rgba(6, 10, 16, 0.12)";
      context.fillRect(0, 0, cssWidth, cssHeight);

      context.globalCompositeOperation = "lighter";

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = idx(x, y);
          const alive = grid[i] === 1;
          // Ease energy toward target so births bloom and deaths fade.
          const target = alive ? 1 : 0;
          energy[i] += (target - energy[i]) * (alive ? 0.45 : 0.14);
          const e = energy[i];
          if (e < 0.04) continue;

          const cx = x * CELL + CELL / 2;
          const cy = y * CELL + CELL / 2;
          const radius = (CELL / 2) * (0.55 + 0.35 * e);

          // Color shifts bio-green core → ion-cyan for stronger cells.
          const core = e > 0.7 ? ION_CYAN : e > 0.4 ? BIO_MID : BIO_GREEN;

          const gradient = context.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            radius * 2.2,
          );
          gradient.addColorStop(0, withAlpha(core, 0.95 * e));
          gradient.addColorStop(0.4, withAlpha(BIO_MID, 0.4 * e));
          gradient.addColorStop(1, withAlpha(BIO_GREEN, 0));

          context.shadowBlur = 12 * e;
          context.shadowColor = withAlpha(ION_CYAN, 0.7 * e);
          context.fillStyle = gradient;
          context.beginPath();
          context.arc(cx, cy, radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      context.shadowBlur = 0;

      // Soft re-seed fade: a gentle luminous bloom that decays after seeding.
      if (reseedFade > 0.01) {
        context.globalCompositeOperation = "lighter";
        context.fillStyle = withAlpha(BIO_MID, 0.12 * reseedFade);
        context.fillRect(0, 0, cssWidth, cssHeight);
        reseedFade *= 0.9;
      }

      context.globalCompositeOperation = "source-over";
    };

    const applyTransform = (): void => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const measure = (): void => {
      const rect = wrapper.getBoundingClientRect();
      cssWidth = Math.max(1, Math.floor(rect.width));
      cssHeight = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      applyTransform();
      allocate();
      render();
    };

    const frame = (time: number): void => {
      if (lastTickTime === 0) lastTickTime = time;
      if (time - lastTickTime >= TICK_MS) {
        step();
        lastTickTime = time;
      }
      render();
      rafRef.current = window.requestAnimationFrame(frame);
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(wrapper);

    measure();

    if (!prefersReducedMotion) {
      rafRef.current = window.requestAnimationFrame(frame);
    } else {
      // One representative static frame: render a couple of steps so the seed
      // resolves into recognizable structure, then leave it still.
      step();
      step();
      // Snap energy to the resolved state for a crisp static frame.
      for (let i = 0; i < energy.length; i++) energy[i] = grid[i] === 1 ? 1 : 0;
      render();
    }

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      resizeObserver.disconnect();
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
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}

/** Convert a #rrggbb hex string + alpha into an rgba() CSS color. */
function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
