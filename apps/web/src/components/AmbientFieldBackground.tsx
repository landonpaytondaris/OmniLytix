"use client";

import React, { useEffect, useRef } from "react";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

type Props = {
  intensity?: number; // overall brightness multiplier
  parallax?: number; // 0..1 (subtle motion with cursor)
};

export default function AmbientFieldBackground({
  intensity = 0.9,
  parallax = 0.55,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const ctx2d = canvasEl.getContext("2d", { alpha: true });
    if (!ctx2d) return;

    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctx2d;

    // Respect reduced motion
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let running = true;

    let w = 0;
    let h = 0;

    const getDpr = () => Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    // Cursor parallax (tiny)
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    // --- hidden driver graph (we don't draw edges/nodes directly)
    const NODE_COUNT = 52;
    const CONNECT_K = 3;

    type Node = { x: number; y: number; vx: number; vy: number };
    type Edge = { a: number; b: number; len: number };
    type Pulse = { e: number; t: number; speed: number; width: number; hue: number };

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const pulses: Pulse[] = [];

    // Bokeh fog: small, many, low alpha, plus "breath" parameters
    const blobs = Array.from({ length: 22 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.035 + Math.random() * 0.07,
      a: 0.015 + Math.random() * 0.05,
      s: 0.35 + Math.random() * 0.8, // drift speed factor
      b: 0.6 + Math.random() * 1.0, // breath factor
      ph: Math.random() * Math.PI * 2, // breath phase
    }));

    // Cache vignette (rebuild on resize only)
    let vignette: CanvasGradient | null = null;

    function resize() {
      const dpr = getDpr();
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      // Helps Safari and some browsers keep CSS pixels aligned
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // rebuild vignette
      const innerR = Math.min(w, h) * 0.22;
      const outerR = Math.min(w, h) * 0.78;
      const cx = w * 0.5;
      const cy = h * 0.42;

      const g = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.38)");
      vignette = g;
    }

    function init() {
      nodes.length = 0;
      edges.length = 0;
      pulses.length = 0;

      for (let i = 0; i < NODE_COUNT; i++) {
        const biasRight = i < Math.floor(NODE_COUNT * 0.6);
        const x = biasRight ? w * (0.42 + Math.random() * 0.55) : w * Math.random();
        const y = h * (0.06 + Math.random() * 0.88);
        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
        });
      }

      const neighbors: number[][] = nodes.map(() => []);
      for (let i = 0; i < nodes.length; i++) {
        const dists: { j: number; d: number }[] = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          dists.push({ j, d: dx * dx + dy * dy });
        }
        dists.sort((a, b) => a.d - b.d);
        neighbors[i] = dists.slice(0, CONNECT_K).map((o) => o.j);
      }

      const edgeSet = new Set<string>();
      for (let i = 0; i < nodes.length; i++) {
        for (const j of neighbors[i]) {
          const a = Math.min(i, j);
          const b = Math.max(i, j);
          const key = `${a}-${b}`;
          if (edgeSet.has(key)) continue;
          edgeSet.add(key);

          const dx = nodes[b].x - nodes[a].x;
          const dy = nodes[b].y - nodes[a].y;
          edges.push({ a, b, len: Math.hypot(dx, dy) });
        }
      }

      for (let i = 0; i < 14; i++) spawnPulse();
    }

    function spawnPulse() {
      if (edges.length === 0) return;
      const e = Math.floor(Math.random() * edges.length);
      pulses.push({
        e,
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.0065,
        width: 0.12 + Math.random() * 0.2,
        hue: Math.random(), // tiny variation (still blue-white overall)
      });
    }

    function drawVignette() {
      if (!vignette) return;
      ctx.globalAlpha = 1;
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    }

    function drawBlobs(time: number) {
      // slight parallax offset (very subtle = premium OS feel)
      const ox = px * 22 * parallax;
      const oy = py * 16 * parallax;

      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];

        const driftX = Math.sin(time * 0.00025 * b.s + i * 1.9) * 0.03;
        const driftY = Math.cos(time * 0.00022 * b.s + i * 2.1) * 0.03;

        // "breathing" alpha (subtle)
        const breathe = 0.75 + 0.25 * Math.sin(time * 0.0007 * b.b + b.ph);

        const cx = (b.x + driftX) * w + ox;
        const cy = (b.y + driftY) * h + oy;
        const rr = b.r * Math.min(w, h);

        const g = ctx.createRadialGradient(cx, cy, rr * 0.12, cx, cy, rr);
        g.addColorStop(0, `rgba(255,255,255,${b.a * 1.15 * breathe})`);
        g.addColorStop(1, "rgba(255,255,255,0)");

        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawImpulses(time: number) {
      ctx.lineCap = "round";

      // PS5-like bloom via additive blending
      ctx.globalCompositeOperation = "lighter";

      // a tiny parallax on impulses too
      const ox = px * 10 * parallax;
      const oy = py * 8 * parallax;

      for (const p of pulses) {
        const e = edges[p.e];
        const A = nodes[e.a];
        const B = nodes[e.b];

        const t = p.t;
        const seg = p.width;

        const t0 = clamp(t - seg * 0.5, 0, 1);
        const t1 = clamp(t + seg * 0.5, 0, 1);

        const x0 = A.x + (B.x - A.x) * t0 + ox;
        const y0 = A.y + (B.y - A.y) * t0 + oy;
        const x1 = A.x + (B.x - A.x) * t1 + ox;
        const y1 = A.y + (B.y - A.y) * t1 + oy;

        // glow pass (wide, soft)
        ctx.globalAlpha = 0.22 * intensity;
        ctx.lineWidth = 4.2;
        ctx.strokeStyle = "rgba(150,190,255,1)";
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        // core pass (thin, crisp)
        ctx.globalAlpha = 0.55 * intensity;
        ctx.lineWidth = 1.7;
        ctx.strokeStyle = "rgba(235,245,255,1)";
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        // spark head + halo (this is what makes it feel “alive”)
        const hx = A.x + (B.x - A.x) * t + ox;
        const hy = A.y + (B.y - A.y) * t + oy;

        ctx.globalAlpha = 0.18 * intensity;
        ctx.fillStyle = "rgba(150,190,255,1)";
        ctx.beginPath();
        ctx.arc(hx, hy, 6.0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.95 * intensity;
        ctx.fillStyle = "rgba(245,250,255,1)";
        ctx.beginPath();
        ctx.arc(hx, hy, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      // occasional bursts
      if (Math.sin(time * 0.008) > 0.985) spawnPulse();
    }

    function tick(time: number) {
      if (!running) return;

      // Parallax easing
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;

      // Node drift (driver)
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        n.x = clamp(n.x, 0, w);
        n.y = clamp(n.y, 0, h);
      }

      // Pulse progression
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t > 1.1) pulses.splice(i, 1);
      }

      // Keep it lively
      if (pulses.length < 16 && Math.random() < 0.18) spawnPulse();

      // Fade/trails: this is the “life” dial
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, w, h);

      drawBlobs(time);
      drawImpulses(time);
      drawVignette();

      rafRef.current = requestAnimationFrame(tick);
    }

    function onPointerMove(e: PointerEvent) {
      // normalize to [-1..1]
      const nx = (e.clientX / Math.max(1, w)) * 2 - 1;
      const ny = (e.clientY / Math.max(1, h)) * 2 - 1;
      tx = clamp(nx, -1, 1);
      ty = clamp(ny, -1, 1);
    }

    function onVisibility() {
      const hidden = document.hidden;
      running = !hidden;
      if (running && rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    resize();
    init();

    // Base paint
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, w, h);

    if (!prefersReduced) {
      rafRef.current = requestAnimationFrame(tick);
    }

    const onResize = () => {
      resize();
      init();
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [intensity, parallax]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",

        // “Premium glow” not fog:
        // keep blur moderate, let additive bloom do the heavy lifting
        filter: "blur(8px) saturate(150%) contrast(112%)",
        opacity: 0.96,
      }}
    />
  );
}
