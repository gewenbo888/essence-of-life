"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The persistent WebGL universe behind the whole page.
 *  - a GLSL nebula plane whose colour migrates through the journey as you scroll
 *    (cosmic blue → life-green → consciousness-violet → civilisation-gold → white)
 *  - a tilted spiral galaxy of ~6k particles, slowly turning
 *  - a deep twinkling starfield
 *  - subtle mouse parallax + scroll-driven zoom/colour
 */

// colour stops sampled by scroll progress (0..1)
const STOPS: { at: number; a: string; b: string }[] = [
  { at: 0.0, a: "#0b2b55", b: "#0e8fb8" }, // cosmos / information — blue·cyan
  { at: 0.22, a: "#0b4d49", b: "#1fb98a" }, // what is life — bio green
  { at: 0.46, a: "#2c1a5e", b: "#7d54e6" }, // consciousness — violet
  { at: 0.66, a: "#102a5e", b: "#2fb6e6" }, // AI & life — electric cyan·violet
  { at: 0.84, a: "#43320e", b: "#e0a94a" }, // civilisation — gold
  { at: 1.0, a: "#3a2b66", b: "#cbb6ff" }, // ultimate questions — luminous violet·white
];

function sampleStop(p: number, out: { a: THREE.Color; b: THREE.Color }) {
  let i = 0;
  while (i < STOPS.length - 1 && p > STOPS[i + 1].at) i++;
  const lo = STOPS[i];
  const hi = STOPS[Math.min(i + 1, STOPS.length - 1)];
  const span = Math.max(1e-4, hi.at - lo.at);
  const t = Math.min(1, Math.max(0, (p - lo.at) / span));
  out.a.set(lo.a).lerp(new THREE.Color(hi.a), t);
  out.b.set(lo.b).lerp(new THREE.Color(hi.b), t);
}

export default function CosmicBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7);

    // ---------- nebula plane ----------
    const colA = new THREE.Color("#0b2b55");
    const colB = new THREE.Color("#0e8fb8");
    const nebulaMat = new THREE.ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: colA },
        uColorB: { value: colB },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uAspect: { value: window.innerWidth / window.innerHeight },
        uIntensity: { value: 1 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec2 uMouse;
        uniform float uAspect;
        uniform float uIntensity;

        // hash + value-noise fbm
        float hash(vec2 p){ p = fract(p*vec2(123.34, 345.45)); p += dot(p, p+34.345); return fract(p.x*p.y); }
        float noise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i+vec2(1.0,0.0));
          float c = hash(i+vec2(0.0,1.0));
          float d = hash(i+vec2(1.0,1.0));
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
        }
        float fbm(vec2 p){
          float v = 0.0; float amp = 0.5;
          mat2 m = mat2(1.6,1.2,-1.2,1.6);
          for(int i=0;i<6;i++){ v += amp*noise(p); p = m*p; amp *= 0.5; }
          return v;
        }
        void main(){
          vec2 uv = vUv - 0.5;
          uv.x *= uAspect;
          // slow drifting domain-warped fbm
          float t = uTime*0.015;
          vec2 q = vec2(fbm(uv*1.6 + t), fbm(uv*1.6 - t + 4.3));
          float n = fbm(uv*2.2 + q*1.7 + vec2(0.0, t*0.6));
          n = pow(n, 1.25);
          // swirl toward centre + mouse
          vec2 m = uMouse*0.18;
          float d = length(uv - m);
          float core = smoothstep(1.25, 0.0, d);
          vec3 col = mix(uColorA, uColorB, clamp(n*1.35, 0.0, 1.0));
          col *= (0.55 + 1.15*n) * (0.6 + 0.95*core);
          // vignette to void at the edges
          float vig = smoothstep(1.4, 0.18, length(uv));
          col *= vig;
          float alpha = (0.2 + 0.72*n) * vig * uIntensity;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    const nebula = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), nebulaMat);
    nebula.frustumCulled = false;
    nebula.renderOrder = -10;
    scene.add(nebula);

    // ---------- point material (soft glowing rounds) ----------
    const pointVert = `
      attribute float aSize;
      attribute float aTwinkle;
      varying vec3 vColor;
      varying float vTw;
      uniform float uTime;
      uniform float uPixelRatio;
      void main(){
        vColor = color;
        vTw = aTwinkle;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float tw = 0.6 + 0.4*sin(uTime*1.6 + aTwinkle*6.2831);
        gl_PointSize = aSize * uPixelRatio * (300.0 / -mv.z) * tw;
        gl_Position = projectionMatrix * mv;
      }
    `;
    const pointFrag = `
      varying vec3 vColor;
      varying float vTw;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if(d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);
        a = pow(a, 1.8);
        gl_FragColor = vec4(vColor, a);
      }
    `;

    // ---------- spiral galaxy ----------
    const GAL = reduce ? 2600 : 6200;
    const arms = 4;
    const galPos = new Float32Array(GAL * 3);
    const galCol = new Float32Array(GAL * 3);
    const galSize = new Float32Array(GAL);
    const galTw = new Float32Array(GAL);
    const cInner = new THREE.Color("#fdf3da");
    const cMidA = new THREE.Color("#46e6b6");
    const cMidB = new THREE.Color("#39c6f0");
    const cOuter = new THREE.Color("#9166ff");
    for (let i = 0; i < GAL; i++) {
      const branch = (i % arms) / arms;
      const r = Math.pow(Math.random(), 1.7) * 9 + 0.25;
      const spin = r * 0.55;
      const ang = branch * Math.PI * 2 + spin;
      const scatter = Math.pow(Math.random(), 2.4) * (0.5 + r * 0.18);
      const ox = (Math.random() - 0.5) * scatter;
      const oy = (Math.random() - 0.5) * scatter * 0.4;
      const oz = (Math.random() - 0.5) * scatter;
      galPos[i * 3] = Math.cos(ang) * r + ox;
      galPos[i * 3 + 1] = oy;
      galPos[i * 3 + 2] = Math.sin(ang) * r + oz;
      const c = new THREE.Color();
      const tr = r / 9.25;
      if (tr < 0.25) c.copy(cInner).lerp(cMidA, tr / 0.25);
      else if (tr < 0.6) c.copy(cMidA).lerp(cMidB, (tr - 0.25) / 0.35);
      else c.copy(cMidB).lerp(cOuter, (tr - 0.6) / 0.4);
      galCol[i * 3] = c.r;
      galCol[i * 3 + 1] = c.g;
      galCol[i * 3 + 2] = c.b;
      galSize[i] = 1.8 + Math.random() * 3.6 * (1 - tr * 0.5);
      galTw[i] = Math.random();
    }
    const galGeo = new THREE.BufferGeometry();
    galGeo.setAttribute("position", new THREE.BufferAttribute(galPos, 3));
    galGeo.setAttribute("color", new THREE.BufferAttribute(galCol, 3));
    galGeo.setAttribute("aSize", new THREE.BufferAttribute(galSize, 1));
    galGeo.setAttribute("aTwinkle", new THREE.BufferAttribute(galTw, 1));
    const galMat = new THREE.ShaderMaterial({
      vertexShader: pointVert,
      fragmentShader: pointFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      },
    });
    const galaxy = new THREE.Points(galGeo, galMat);
    galaxy.rotation.x = -0.72;
    const galaxyGroup = new THREE.Group();
    galaxyGroup.add(galaxy);
    galaxyGroup.position.set(1.4, -0.3, -1);
    scene.add(galaxyGroup);

    // ---------- deep starfield ----------
    const STARS = reduce ? 1200 : 2600;
    const sPos = new Float32Array(STARS * 3);
    const sCol = new Float32Array(STARS * 3);
    const sSize = new Float32Array(STARS);
    const sTw = new Float32Array(STARS);
    const starWarm = new THREE.Color("#fff3d6");
    const starCool = new THREE.Color("#bcd8ff");
    for (let i = 0; i < STARS; i++) {
      const radius = 14 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      sPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      sPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      sPos[i * 3 + 2] = radius * Math.cos(phi) - 6;
      const c = starWarm.clone().lerp(starCool, Math.random());
      sCol[i * 3] = c.r;
      sCol[i * 3 + 1] = c.g;
      sCol[i * 3 + 2] = c.b;
      sSize[i] = 0.6 + Math.random() * 1.8;
      sTw[i] = Math.random();
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
    starGeo.setAttribute("aSize", new THREE.BufferAttribute(sSize, 1));
    starGeo.setAttribute("aTwinkle", new THREE.BufferAttribute(sTw, 1));
    const starMat = new THREE.ShaderMaterial({
      vertexShader: pointVert,
      fragmentShader: pointFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      },
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // ---------- state ----------
    let scroll = 0;
    let scrollTarget = 0;
    const mouse = new THREE.Vector2(0, 0);
    const mouseTarget = new THREE.Vector2(0, 0);
    const tmp = { a: new THREE.Color(), b: new THREE.Color() };

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    };
    const onPointer = (e: PointerEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      nebulaMat.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      scroll += (scrollTarget - scroll) * 0.06;
      mouse.x += (mouseTarget.x - mouse.x) * 0.04;
      mouse.y += (mouseTarget.y - mouse.y) * 0.04;

      sampleStop(scroll, tmp);
      colA.copy(tmp.a);
      colB.copy(tmp.b);

      nebulaMat.uniforms.uTime.value = t;
      nebulaMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
      nebulaMat.uniforms.uIntensity.value = 0.85 + 0.3 * Math.sin(scroll * Math.PI);
      galMat.uniforms.uTime.value = t;
      starMat.uniforms.uTime.value = t;

      galaxy.rotation.z = t * 0.04;
      galaxyGroup.rotation.y = scroll * 0.9;
      galaxyGroup.position.z = -2 - scroll * 2.5;
      starfield.rotation.y = t * 0.005 + mouse.x * 0.05;
      starfield.rotation.x = mouse.y * 0.05;

      camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 0.4 + scroll * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      galGeo.dispose();
      galMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      nebula.geometry.dispose();
      nebulaMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: "none" }}
    />
  );
}
