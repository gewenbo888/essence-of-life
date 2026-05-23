"use client";

/** Equations drifting through space — the hidden grammar of life. */
const EQUATIONS = [
  { tex: "H = −Σ pᵢ log pᵢ", x: "8%", y: "20%", d: "0s", c: "text-ion-300" },
  { tex: "S = k log W", x: "78%", y: "16%", d: "1.4s", c: "text-ember-400" },
  { tex: "iℏ ∂ψ/∂t = Ĥψ", x: "70%", y: "62%", d: "2.1s", c: "text-plasma-300" },
  { tex: "φ = (1+√5)/2", x: "14%", y: "70%", d: "0.7s", c: "text-gold-300" },
  { tex: "dx/dt = rx(1 − x/K)", x: "84%", y: "40%", d: "2.8s", c: "text-bio-300" },
  { tex: "ΔG = ΔH − TΔS", x: "6%", y: "46%", d: "1.1s", c: "text-ember-400" },
  { tex: "e^{iπ} + 1 = 0", x: "44%", y: "12%", d: "1.9s", c: "text-gold-300" },
  { tex: "Fₙ = Fₙ₋₁ + Fₙ₋₂", x: "30%", y: "84%", d: "0.4s", c: "text-bio-300" },
  { tex: "∂u/∂t = D∇²u + f(u)", x: "60%", y: "82%", d: "2.4s", c: "text-ion-300" },
  { tex: "E = mc²", x: "90%", y: "76%", d: "1.6s", c: "text-plasma-300" },
];

export default function FloatingEquations() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {EQUATIONS.map((e, i) => (
        <span
          key={i}
          className={`mono absolute hidden animate-drift whitespace-nowrap text-[0.72rem] tracking-wide opacity-[0.5] md:inline ${e.c}`}
          style={{
            left: e.x,
            top: e.y,
            animationDelay: e.d,
            textShadow: "0 0 18px currentColor",
          }}
        >
          {e.tex}
        </span>
      ))}
    </div>
  );
}
