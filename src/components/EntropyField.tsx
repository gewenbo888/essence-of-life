"use client";

import { useEffect, useRef } from "react";

/**
 * EntropyField — "a local structure resisting entropy."
 *
 * A particle field illustrating the 2nd law vs. life:
 *   - Left region: particles in a crisp ordered lattice (cool ion-cyan),
 *     joined by faint connecting lines where order is high.
 *   - Moving rightward, particles gain random velocity and scatter into
 *     disorder (warm ember); their structure dissolves and lines fade out.
 *   - At the center sits a glowing "living" pocket (bio-green) that
 *     continuously pulls nearby particles into a small rotating ordered
 *     ring/lattice and tints them bio-green — a local island of negentropy
 *     sustained against the surrounding chaos — before they escape and
 *     disorder again.
 *
 * Transparent background; additive glow; Canvas 2D only.
 */

interface EntropyFieldProps {
  className?: string;
}

interface Particle {
  // home (ordered) position in normalized 0..1 space, set by lattice
  hx: number;
  hy: number;
  // current position in css px
  x: number;
  y: number;
  vx: number;
  vy: number;
  // captured-by-living-pocket state
  captured: boolean;
  // slot index on the living ring when captured
  ringSlot: number;
  size: number;
}

// Palette
const ION_CYAN = "#22cdf0";
const ION_LIGHT = "#9eeefb";
const BIO_GREEN = "#2bd49f";
const BIO_LIGHT = "#8cf3d2";
const EMBER = "#fb7185";
const EMBER_LIGHT = "#ff96a6";

// linear blend of two "rgb" tuples
function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

const C_ION: [number, number, number] = [34, 205, 240];
const C_EMBER: [number, number, number] = [251, 113, 133];
const C_BIO: [number, number, number] = [43, 212, 159];

export default function EntropyField({ className }: EntropyFieldProps) {
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

    let particles: Particle[] = [];
    let ringSlotCount = 0;

    // Build a lattice of particles sized to area (cap ~300).
    const buildParticles = () => {
      const area = cssWidth * cssHeight;
      // target density; clamp count to [80, 300]
      const target = Math.max(80, Math.min(300, Math.round(area / 5200)));
      const aspect = cssWidth / Math.max(1, cssHeight);
      const cols = Math.max(6, Math.round(Math.sqrt(target * aspect)));
      const rows = Math.max(4, Math.round(target / cols));

      const next: Particle[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const hx = (c + 0.5) / cols;
          const hy = (r + 0.5) / rows;
          next.push({
            hx,
            hy,
            x: hx * cssWidth,
            y: hy * cssHeight,
            vx: 0,
            vy: 0,
            captured: false,
            ringSlot: -1,
            size: 1.6 + Math.random() * 1.4,
          });
        }
      }
      particles = next;
      ringSlotCount = Math.max(10, Math.min(22, Math.round(particles.length * 0.12)));
    };

    const resize = () => {
      cssWidth = wrapper.clientWidth || 1;
      cssHeight = wrapper.clientHeight || 1;
      canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
      canvas.height = Math.max(1, Math.floor(cssHeight * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    // disorder factor at a given x: 0 (ordered, left) -> 1 (chaotic, right)
    const disorderAt = (x: number) => {
      const f = x / cssWidth;
      // smootherstep for a clean gradient
      const c = Math.max(0, Math.min(1, f));
      return c * c * c * (c * (c * 6 - 15) + 10);
    };

    let lastT = 0;

    const step = (dt: number, t: number) => {
      const cx = cssWidth * 0.5;
      const cy = cssHeight * 0.5;
      const livingR = Math.min(cssWidth, cssHeight) * 0.17;
      const ringR = livingR * 0.62;
      const ringRot = t * 0.6;

      for (const p of particles) {
        const homeX = p.hx * cssWidth;
        const homeY = p.hy * cssHeight;
        const d = disorderAt(p.x);

        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.hypot(dx, dy);
        const inLiving = dist < livingR;

        if (inLiving) {
          // --- Negentropy pocket: pull toward an ordered rotating ring slot ---
          if (!p.captured) {
            p.captured = true;
            p.ringSlot = Math.floor(Math.random() * ringSlotCount);
          }
          const slotAng = (p.ringSlot / ringSlotCount) * Math.PI * 2 + ringRot;
          const targetX = cx + Math.cos(slotAng) * ringR;
          const targetY = cy + Math.sin(slotAng) * ringR;
          // strong spring toward ordered slot, heavy damping
          p.vx += (targetX - p.x) * 6.0 * dt;
          p.vy += (targetY - p.y) * 6.0 * dt;
          p.vx *= 0.86;
          p.vy *= 0.86;
        } else {
          p.captured = false;
          p.ringSlot = -1;

          // Order spring pulls toward lattice home; strength falls with disorder.
          const orderK = (1 - d) * 5.0;
          p.vx += (homeX - p.x) * orderK * dt;
          p.vy += (homeY - p.y) * orderK * dt;

          // Entropy injection: random thermal kicks that grow with disorder.
          const heat = d * 90;
          p.vx += (Math.random() - 0.5) * heat * dt;
          p.vy += (Math.random() - 0.5) * heat * dt;

          // Mild rightward drift representing the arrow of time / dispersal.
          p.vx += d * 6 * dt;

          // Damping (less in the hot region so motion persists).
          const damp = 0.9 - d * 0.04;
          p.vx *= damp;
          p.vy *= damp;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Wrap / recycle: particles that drift off the right re-enter at left
        // in ordered formation — sustaining the steady-state gradient.
        if (p.x > cssWidth + 12) {
          p.x = -8;
          p.y = homeY + (Math.random() - 0.5) * 10;
          p.vx = 0;
          p.vy = 0;
        }
        if (p.y < -12) p.y = cssHeight + 8;
        else if (p.y > cssHeight + 12) p.y = -8;
        if (p.x < -20) p.x = cssWidth + 8;
      }
    };

    const draw = (t: number) => {
      context.clearRect(0, 0, cssWidth, cssHeight);

      const cx = cssWidth * 0.5;
      const cy = cssHeight * 0.5;
      const livingR = Math.min(cssWidth, cssHeight) * 0.17;

      // --- Living pocket halo (drawn first, beneath particles) ---
      context.save();
      context.globalCompositeOperation = "lighter";
      const pulse = 1 + Math.sin(t * 1.8) * 0.06;
      const halo = context.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        livingR * 1.35 * pulse
      );
      halo.addColorStop(0, "rgba(43,212,159,0.30)");
      halo.addColorStop(0.55, "rgba(43,212,159,0.10)");
      halo.addColorStop(1, "rgba(43,212,159,0)");
      context.fillStyle = halo;
      context.beginPath();
      context.arc(cx, cy, livingR * 1.35 * pulse, 0, Math.PI * 2);
      context.fill();

      // crisp boundary ring of the pocket
      context.strokeStyle = "rgba(140,243,210,0.35)";
      context.lineWidth = 1.2;
      context.shadowBlur = 14;
      context.shadowColor = BIO_GREEN;
      context.beginPath();
      context.arc(cx, cy, livingR * pulse, 0, Math.PI * 2);
      context.stroke();
      context.shadowBlur = 0;
      context.restore();

      // --- Connecting lines where order is high (fade with disorder) ---
      context.save();
      context.globalCompositeOperation = "lighter";
      const linkDist = Math.min(cssWidth, cssHeight) * 0.085;
      const linkDist2 = linkDist * linkDist;
      context.lineWidth = 0.7;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const da = disorderAt(a.x);
        if (da > 0.72 && !a.captured) continue; // too chaotic to bond
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > linkDist2) continue;
          const db = disorderAt(b.x);
          const order = 1 - Math.max(da, db);
          if (order <= 0.02 && !(a.captured && b.captured)) continue;

          const proximity = 1 - d2 / linkDist2;
          let alpha: number;
          let col: [number, number, number];
          if (a.captured && b.captured) {
            alpha = 0.5 * proximity;
            col = C_BIO;
          } else {
            alpha = order * proximity * 0.45;
            col = mix(C_EMBER, C_ION, order);
          }
          if (alpha < 0.012) continue;
          context.strokeStyle = `rgba(${Math.round(col[0])},${Math.round(
            col[1]
          )},${Math.round(col[2])},${alpha.toFixed(3)})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
      context.restore();

      // --- Particles ---
      context.save();
      context.globalCompositeOperation = "lighter";
      for (const p of particles) {
        const d = disorderAt(p.x);
        let col: [number, number, number];
        let glow: number;
        if (p.captured) {
          col = C_BIO;
          glow = 9;
        } else {
          // cool ion-cyan (ordered) -> warm ember (disorder)
          col = mix(C_ION, C_EMBER, d);
          glow = 4 + d * 5;
        }
        const r = Math.round(col[0]);
        const g = Math.round(col[1]);
        const b = Math.round(col[2]);

        context.shadowBlur = glow;
        context.shadowColor = `rgb(${r},${g},${b})`;

        const radius = p.size + (p.captured ? 0.6 : 0);
        const grad = context.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          radius * 2.6
        );
        grad.addColorStop(0, `rgba(${r},${g},${b},0.95)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},0.45)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        context.fillStyle = grad;
        context.beginPath();
        context.arc(p.x, p.y, radius * 2.6, 0, Math.PI * 2);
        context.fill();
      }
      context.shadowBlur = 0;
      context.restore();
    };

    const render = (timeMs: number) => {
      const t = timeMs / 1000;
      let dt = lastT === 0 ? 0.016 : t - lastT;
      lastT = t;
      // clamp dt to avoid huge jumps after tab refocus
      if (dt > 0.05) dt = 0.05;

      step(dt, t);
      draw(t);

      rafRef.current = requestAnimationFrame(render);
    };

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      // One representative static frame: settle a few steps, draw once.
      for (let i = 0; i < 60; i++) step(0.016, i * 0.016);
      draw(1.0);
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
