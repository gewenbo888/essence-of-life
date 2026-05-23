"use client";

import { useEffect, useRef } from "react";

interface DNAHelixProps {
  className?: string;
  /** Multiplies rotation speed. Default 1. */
  speed?: number;
}

/* ---- palette ---------------------------------------------------------- */
const BIO_GREEN = "#2bd49f";
const BIO_LIGHT = "#8cf3d2";
const ION_CYAN = "#22cdf0";
const ION_LIGHT = "#9eeefb";
const PLASMA_VIOLET = "#9166ff";

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function rgba(c: RGB, alpha: number): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
}

/* Pre-resolved palette endpoints for the two strands. */
const STRAND_A_FROM = hexToRgb(BIO_GREEN); // bio-green
const STRAND_A_TO = hexToRgb(ION_CYAN); // → ion-cyan
const STRAND_B_FROM = hexToRgb(ION_CYAN); // ion-cyan
const STRAND_B_TO = hexToRgb(PLASMA_VIOLET); // → plasma-violet
const NODE_HIGHLIGHT = hexToRgb(BIO_LIGHT);
const NODE_HIGHLIGHT_B = hexToRgb(ION_LIGHT);

const BASE_PAIRS = 32; // within the requested 26–40 range
const TURNS = 3.4; // how many full helical twists across the height
const ROTATION_PERIOD_MS = 14000; // one full turn every 14s

interface NodeDraw {
  x: number;
  y: number;
  size: number;
  alpha: number;
  depth: number; // -1 (back) .. 1 (front)
  color: RGB;
  highlight: RGB;
}

export default function DNAHelix({ className, speed = 1 }: DNAHelixProps) {
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

    const setupSize = () => {
      const rect = wrapper.getBoundingClientRect();
      cssWidth = Math.max(1, rect.width);
      cssHeight = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupSize();

    /**
     * Render a single frame of the helix for a given rotation phase.
     * (Vertical drift is applied by the caller via ctx.translate.)
     */
    const renderFrame = (rotation: number) => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const centerX = cssWidth / 2;
      // Horizontal radius of the helix; clamp so it never overflows.
      const radius = Math.min(cssWidth * 0.16, 120);
      // Vertical padding so end nodes have room to glow.
      const padTop = cssHeight * 0.06;
      const usableHeight = cssHeight - padTop * 2;

      /* Soft vertical glow gradient along the helix axis (additive). */
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const axisGlow = ctx.createLinearGradient(0, 0, 0, cssHeight);
      axisGlow.addColorStop(0, rgba(STRAND_A_FROM, 0));
      axisGlow.addColorStop(0.5, rgba(STRAND_A_TO, 0.06));
      axisGlow.addColorStop(1, rgba(STRAND_B_TO, 0));
      ctx.fillStyle = axisGlow;
      const glowW = radius * 3.2;
      ctx.fillRect(centerX - glowW / 2, 0, glowW, cssHeight);
      ctx.restore();

      // Build the node descriptors for both strands.
      const nodesA: NodeDraw[] = [];
      const nodesB: NodeDraw[] = [];

      for (let i = 0; i < BASE_PAIRS; i++) {
        const t = i / (BASE_PAIRS - 1);
        const y = padTop + t * usableHeight;
        // Helical angle for this rung; the two strands are offset by π.
        const angle = rotation + t * TURNS * Math.PI * 2;

        // Strand A
        const xOffA = Math.sin(angle);
        const depthA = Math.cos(angle); // 1 front, -1 back
        // Strand B (opposite side)
        const xOffB = Math.sin(angle + Math.PI);
        const depthB = Math.cos(angle + Math.PI);

        const colorA = mix(STRAND_A_FROM, STRAND_A_TO, t);
        const colorB = mix(STRAND_B_FROM, STRAND_B_TO, t);

        // Depth → size & alpha. Map depth [-1,1] → [0,1].
        const dA = (depthA + 1) / 2;
        const dB = (depthB + 1) / 2;

        nodesA.push({
          x: centerX + xOffA * radius,
          y,
          size: 2.2 + dA * 4.4,
          alpha: 0.28 + dA * 0.72,
          depth: depthA,
          color: colorA,
          highlight: NODE_HIGHLIGHT,
        });
        nodesB.push({
          x: centerX + xOffB * radius,
          y,
          size: 2.2 + dB * 4.4,
          alpha: 0.28 + dB * 0.72,
          depth: depthB,
          color: colorB,
          highlight: NODE_HIGHLIGHT_B,
        });
      }

      /* --- base-pair rungs (drawn first, dimmer, behind nodes) --------- */
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < BASE_PAIRS; i++) {
        const a = nodesA[i];
        const b = nodesB[i];
        // Average depth of the pair governs rung brightness.
        const avgDepth = (a.depth + b.depth + 2) / 4; // 0..1
        const rungAlpha = 0.05 + avgDepth * 0.22;
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, rgba(a.color, rungAlpha));
        grad.addColorStop(0.5, rgba(mix(a.color, b.color, 0.5), rungAlpha * 0.7));
        grad.addColorStop(1, rgba(b.color, rungAlpha));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8 + avgDepth * 1.1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.restore();

      /* --- nodes, painted back-to-front for correct overlap ----------- */
      const allNodes = nodesA.concat(nodesB);
      allNodes.sort((p, q) => p.depth - q.depth);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const n of allNodes) {
        // Glowing core via radial gradient.
        const glow = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          n.size * 3.4
        );
        glow.addColorStop(0, rgba(n.highlight, n.alpha));
        glow.addColorStop(0.35, rgba(n.color, n.alpha * 0.85));
        glow.addColorStop(1, rgba(n.color, 0));
        ctx.fillStyle = glow;
        ctx.shadowBlur = 8 + n.size * 2.2;
        ctx.shadowColor = rgba(n.color, n.alpha * 0.6);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * 3.4, 0, Math.PI * 2);
        ctx.fill();

        // Bright dense centre.
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.fillStyle = rgba(n.highlight, Math.min(1, n.alpha * 1.05));
        ctx.arc(n.x, n.y, n.size * 0.62, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      // One representative static frame, no loop.
      renderFrame(Math.PI * 0.35);
    } else {
      const start = performance.now();
      const loop = (now: number) => {
        const elapsed = now - start;
        const rotation =
          (elapsed / ROTATION_PERIOD_MS) * Math.PI * 2 * speed;
        // Gentle vertical breathing drift of the whole helix.
        const drift = elapsed / 4200;
        ctx.save();
        const breathe = Math.sin(drift) * Math.min(cssHeight * 0.018, 14);
        ctx.translate(0, breathe);
        renderFrame(rotation);
        ctx.restore();
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      setupSize();
      if (reduceMotion) renderFrame(Math.PI * 0.35);
    });
    ro.observe(wrapper);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [speed]);

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
