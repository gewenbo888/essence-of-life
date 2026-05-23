"use client";

import { useEffect, useRef } from "react";

interface FibonacciSpiralProps {
  className?: string;
}

/**
 * FibonacciSpiral — a phyllotaxis seed-head (sunflower / pinecone) built from
 * the golden angle, overlaid with a luminous golden-ratio logarithmic spiral.
 *
 * Seeds shade from a gold core outward to bio-green / ion-cyan at the rim, with
 * dot size shrinking toward the edge. The whole pattern rotates very slowly
 * while the spiral's draw progress sweeps and breathes. Small monospace labels
 * ("φ = 1.61803…", "137.5°") sit subtly near the corners.
 */
export default function FibonacciSpiral({ className }: FibonacciSpiralProps) {
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
    const GOLD = "#eab85c";
    const GOLD_LIGHT = "#fae2b3";
    const BIO_GREEN = "#2bd49f";
    const ION_CYAN = "#22cdf0";
    const ION_LIGHT = "#9eeefb";
    const STARLIGHT = "#f6f8ff";

    // --- mathematics of life ----------------------------------------------
    const PHI = (1 + Math.sqrt(5)) / 2; // 1.61803…
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 137.507° in radians
    const SEED_COUNT = 760; // ~600–900 phyllotaxis points

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = 1;
    let startTime = 0;

    const applyTransform = (): void => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Linear interpolation between two #rrggbb colors at t∈[0,1]. */
    const mix = (a: string, b: string, t: number): [number, number, number] => {
      const ca = hexToRgb(a);
      const cb = hexToRgb(b);
      const k = Math.max(0, Math.min(1, t));
      return [
        Math.round(ca[0] + (cb[0] - ca[0]) * k),
        Math.round(ca[1] + (cb[1] - ca[1]) * k),
        Math.round(ca[2] + (cb[2] - ca[2]) * k),
      ];
    };

    const drawSeedHead = (
      cx: number,
      cy: number,
      scale: number,
      rotation: number,
    ): void => {
      const c = scale; // radius coefficient: r = c * sqrt(i)
      const maxR = c * Math.sqrt(SEED_COUNT);

      context.globalCompositeOperation = "lighter";

      for (let i = 0; i < SEED_COUNT; i++) {
        const angle = i * GOLDEN_ANGLE + rotation;
        const r = c * Math.sqrt(i);
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        const norm = r / maxR; // 0 at core → 1 at rim

        // Color: gold core → bio-green mid → ion-cyan rim.
        let rgb: [number, number, number];
        if (norm < 0.5) {
          rgb = mix(GOLD_LIGHT, BIO_GREEN, norm / 0.5);
        } else {
          rgb = mix(BIO_GREEN, ION_CYAN, (norm - 0.5) / 0.5);
        }

        // Dot size shrinks outward.
        const dotR = Math.max(0.8, (2.6 - 1.9 * norm) * (scale / 6));

        const gradient = context.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          dotR * 3,
        );
        gradient.addColorStop(0, rgba(rgb, 0.95));
        gradient.addColorStop(0.5, rgba(rgb, 0.45));
        gradient.addColorStop(1, rgba(rgb, 0));

        context.shadowBlur = 6;
        context.shadowColor =
          norm < 0.4 ? withAlpha(GOLD, 0.6) : withAlpha(ION_LIGHT, 0.6);
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, dotR, 0, Math.PI * 2);
        context.fill();
      }

      context.shadowBlur = 0;
      context.globalCompositeOperation = "source-over";
    };

    const drawSpiral = (
      cx: number,
      cy: number,
      scale: number,
      rotation: number,
      progress: number,
    ): void => {
      // Logarithmic spiral that grows by φ per quarter turn:
      // r = a * b^θ, where b = φ^(1/(π/2)) so r multiplies by φ every 90°.
      const b = Math.pow(PHI, 2 / Math.PI);
      const a = scale * 0.9;

      const turns = 4.2; // total turns to sweep
      const thetaMax = turns * Math.PI * 2;
      const thetaEnd = thetaMax * progress;
      const segments = 520;

      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      context.lineJoin = "round";

      // Build the path once so we can stroke it with a gold gradient.
      const points: Array<[number, number]> = [];
      let outerX = cx;
      let outerY = cy;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * thetaEnd;
        const r = a * Math.pow(b, theta);
        const ang = theta + rotation;
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        points.push([x, y]);
        outerX = x;
        outerY = y;
      }

      if (points.length > 1) {
        const grad = context.createLinearGradient(cx, cy, outerX, outerY);
        grad.addColorStop(0, withAlpha(GOLD_LIGHT, 0.95));
        grad.addColorStop(0.5, withAlpha(GOLD, 0.8));
        grad.addColorStop(1, withAlpha(ION_LIGHT, 0.5));

        context.strokeStyle = grad;
        context.lineWidth = 1.8;
        context.shadowBlur = 14;
        context.shadowColor = withAlpha(GOLD, 0.8);

        context.beginPath();
        context.moveTo(points[0][0], points[0][1]);
        for (let p = 1; p < points.length; p++) {
          context.lineTo(points[p][0], points[p][1]);
        }
        context.stroke();

        // Luminous leading point at the spiral's growing tip.
        const tipGlow = context.createRadialGradient(
          outerX,
          outerY,
          0,
          outerX,
          outerY,
          10,
        );
        tipGlow.addColorStop(0, withAlpha(GOLD_LIGHT, 0.95));
        tipGlow.addColorStop(1, withAlpha(GOLD, 0));
        context.fillStyle = tipGlow;
        context.beginPath();
        context.arc(outerX, outerY, 10, 0, Math.PI * 2);
        context.fill();
      }

      context.shadowBlur = 0;
      context.globalCompositeOperation = "source-over";
    };

    const drawLabels = (): void => {
      context.globalCompositeOperation = "source-over";
      context.shadowBlur = 0;
      const fontSize = Math.max(10, Math.min(13, cssWidth * 0.012));
      context.font = `${fontSize}px ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace`;
      context.fillStyle = withAlpha(STARLIGHT, 0.32);

      context.textBaseline = "bottom";
      context.textAlign = "left";
      context.fillText("φ = 1.61803…", 16, cssHeight - 16);

      context.textAlign = "right";
      context.fillText("137.5°", cssWidth - 16, cssHeight - 16);
    };

    const draw = (time: number): void => {
      if (startTime === 0) startTime = time;
      const elapsed = (time - startTime) / 1000;

      // Transparent canvas: clear each frame.
      context.clearRect(0, 0, cssWidth, cssHeight);

      const cx = cssWidth / 2;
      const cy = cssHeight / 2;
      const minDim = Math.min(cssWidth, cssHeight);
      const scale = minDim / 60; // seed-head radius coefficient

      const rotation = elapsed * 0.06; // very slow rotation
      // Spiral progress sweeps in and gently breathes.
      const sweep = Math.min(1, elapsed / 6);
      const breathe = 0.92 + 0.08 * Math.sin(elapsed * 0.5);
      const progress = sweep * breathe;

      drawSeedHead(cx, cy, scale, rotation);
      drawSpiral(cx, cy, scale, rotation * 0.6, progress);
      drawLabels();

      rafRef.current = window.requestAnimationFrame(draw);
    };

    const drawStatic = (): void => {
      context.clearRect(0, 0, cssWidth, cssHeight);
      const cx = cssWidth / 2;
      const cy = cssHeight / 2;
      const minDim = Math.min(cssWidth, cssHeight);
      const scale = minDim / 60;
      drawSeedHead(cx, cy, scale, 0.4);
      drawSpiral(cx, cy, scale, 0.24, 1);
      drawLabels();
    };

    const measure = (): void => {
      const rect = wrapper.getBoundingClientRect();
      cssWidth = Math.max(1, Math.floor(rect.width));
      cssHeight = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      applyTransform();
      if (prefersReducedMotion) drawStatic();
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(wrapper);

    measure();

    if (!prefersReducedMotion) {
      rafRef.current = window.requestAnimationFrame(draw);
    } else {
      drawStatic();
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

/** Parse a #rrggbb hex string into an [r, g, b] tuple. */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

/** Build an rgba() CSS color from an [r, g, b] tuple and alpha. */
function rgba(rgb: [number, number, number], alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}

/** Build an rgba() CSS color from a #rrggbb hex string and alpha. */
function withAlpha(hex: string, alpha: number): string {
  return rgba(hexToRgb(hex), alpha);
}
