"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive neural network. Nodes drift; signals pulse along synapses and make
 * nodes "fire", cascading to neighbours. The cursor is a stimulus — nodes near
 * the pointer brighten and are more likely to ignite. The consciousness centrepiece.
 */

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fire: number; // 0..1 activation, decays
  hue: number;
}
interface Edge {
  a: number;
  b: number;
  d: number;
}
interface Signal {
  edge: number;
  from: number;
  t: number;
  speed: number;
  life: number;
}

export default function NeuralField({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let signals: Signal[] = [];
    const mouse = { x: -9999, y: -9999, active: false };

    const build = () => {
      const area = W * H;
      const count = Math.max(34, Math.min(90, Math.round(area / 13000)));
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          fire: Math.random() * 0.2,
          hue: 250 + Math.random() * 40, // violet→indigo
        });
      }
      rebuildEdges();
    };

    const rebuildEdges = () => {
      edges = [];
      const maxD = Math.min(W, H) * 0.34;
      for (let i = 0; i < nodes.length; i++) {
        const cand: Edge[] = [];
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < maxD) cand.push({ a: i, b: j, d });
        }
        cand.sort((p, q) => p.d - q.d);
        for (let k = 0; k < Math.min(3, cand.length); k++) edges.push(cand[k]);
      }
    };

    const neighbours = (n: number): number[] => {
      const out: number[] = [];
      for (const e of edges) {
        if (e.a === n) out.push(e.b);
        else if (e.b === n) out.push(e.a);
      }
      return out;
    };

    const edgeIndexBetween = (a: number, b: number): number => {
      for (let i = 0; i < edges.length; i++) {
        if ((edges[i].a === a && edges[i].b === b) || (edges[i].a === b && edges[i].b === a)) return i;
      }
      return -1;
    };

    const ignite = (n: number, depth: number) => {
      nodes[n].fire = 1;
      if (depth <= 0) return;
      const nb = neighbours(n);
      for (const m of nb) {
        if (Math.random() < 0.55) {
          const ei = edgeIndexBetween(n, m);
          if (ei >= 0) {
            signals.push({ edge: ei, from: n, t: 0, speed: 0.012 + Math.random() * 0.02, life: depth });
          }
        }
      }
    };

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    const drawFrame = () => {
      ctx.clearRect(0, 0, W, H);

      // edges
      ctx.lineWidth = 1;
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const act = Math.max(a.fire, b.fire);
        const alpha = 0.05 + act * 0.4;
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, `hsla(${a.hue},90%,70%,${alpha})`);
        g.addColorStop(1, `hsla(${b.hue},90%,70%,${alpha})`);
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // signals
      ctx.globalCompositeOperation = "lighter";
      for (const s of signals) {
        const e = edges[s.edge];
        if (!e) continue;
        const fromNode = nodes[s.from];
        const toIdx = e.a === s.from ? e.b : e.a;
        const toNode = nodes[toIdx];
        const x = fromNode.x + (toNode.x - fromNode.x) * s.t;
        const y = fromNode.y + (toNode.y - fromNode.y) * s.t;
        const rad = 3.4;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, rad * 3);
        grd.addColorStop(0, "rgba(158,238,251,0.95)");
        grd.addColorStop(0.4, "rgba(34,205,240,0.5)");
        grd.addColorStop(1, "rgba(34,205,240,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, rad * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // nodes
      for (const n of nodes) {
        const dist = mouse.active ? Math.hypot(n.x - mouse.x, n.y - mouse.y) : 9999;
        const near = Math.max(0, 1 - dist / 130);
        const glow = Math.min(1, n.fire + near * 0.6);
        const r = 1.8 + glow * 4.2;
        ctx.shadowBlur = 10 + glow * 26;
        ctx.shadowColor = `hsla(${n.hue},95%,72%,${0.5 + glow * 0.5})`;
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.4);
        grd.addColorStop(0, `hsla(${n.hue - 10},100%,${78 + glow * 18}%,${0.85})`);
        grd.addColorStop(1, `hsla(${n.hue},90%,65%,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    if (reduce) {
      drawFrame();
      return () => {
        ro.disconnect();
        wrap.removeEventListener("pointermove", onMove);
        wrap.removeEventListener("pointerleave", onLeave);
      };
    }

    let raf = 0;
    let last = performance.now();
    let spawnAcc = 0;
    let edgeAcc = 0;

    const tick = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;

      // move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.x = Math.max(0, Math.min(W, n.x));
        n.y = Math.max(0, Math.min(H, n.y));
        n.fire *= 0.94;
      }

      // periodically rebuild edges as nodes drift
      edgeAcc += dt;
      if (edgeAcc > 1400) {
        edgeAcc = 0;
        rebuildEdges();
      }

      // spontaneous ignition
      spawnAcc += dt;
      if (spawnAcc > 620 && nodes.length) {
        spawnAcc = 0;
        ignite(Math.floor(Math.random() * nodes.length), 2);
      }

      // cursor stimulus: ignite the closest node now and then
      if (mouse.active && nodes.length) {
        let best = -1;
        let bd = 60;
        for (let i = 0; i < nodes.length; i++) {
          const d = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
          if (d < bd) {
            bd = d;
            best = i;
          }
        }
        if (best >= 0 && Math.random() < 0.08) ignite(best, 2);
      }

      // advance signals
      const next: Signal[] = [];
      for (const s of signals) {
        s.t += s.speed * (dt / 16.67);
        if (s.t >= 1) {
          const e = edges[s.edge];
          if (e) {
            const target = e.a === s.from ? e.b : e.a;
            ignite(target, s.life - 1);
          }
        } else {
          next.push(s);
        }
      }
      signals = next.slice(0, 240);

      drawFrame();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
