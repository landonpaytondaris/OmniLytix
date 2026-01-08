"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Inbox,
  FlaskConical,
  Search,
  Factory,
  FileText,
  Boxes,
  ClipboardCheck,
  Gauge,
  Bell,
  LineChart,
  ShieldCheck,
  Settings,
} from "lucide-react";

type IconType = ComponentType<{ size?: number; strokeWidth?: number }>;

type AppDef = {
  id: string;
  name: string;
  subtitle: string;
  Icon: IconType;
  badge?: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [rect, setRect] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setRect({ width: r.width, height: r.height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, rect };
}

function NeuralBackdrop({ intensity = 0.85 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const ctx2d = canvasEl.getContext("2d");
    if (!ctx2d) return;

    // ✅ HARD LOCK non-null references for nested functions (kills TS null errors)
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctx2d;

    let w = 0;
    let h = 0;

    const getDpr = () => Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    // --- graph config
    const NODE_COUNT = 46;
    const CONNECT_K = 3;

    type Node = { x: number; y: number; vx: number; vy: number };
    type Edge = { a: number; b: number; len: number };
    type Pulse = { e: number; t: number; speed: number; width: number };

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const pulses: Pulse[] = [];

    // --- smaller blobs so it doesn't look jumbled
    const blobs = [
      { x: 0.18, y: 0.35, r: 0.16, a: 0.10 },
      { x: 0.72, y: 0.22, r: 0.13, a: 0.09 },
      { x: 0.78, y: 0.78, r: 0.15, a: 0.095 },
    ];

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = getDpr();
      w = Math.floor(parent.clientWidth);
      h = Math.floor(parent.clientHeight);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // draw in CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      nodes.length = 0;
      edges.length = 0;
      pulses.length = 0;

      // bias nodes slightly right so it feels like it's feeding the tile grid
      for (let i = 0; i < NODE_COUNT; i++) {
        const biasRight = i < Math.floor(NODE_COUNT * 0.6);
        const x = biasRight ? w * (0.45 + Math.random() * 0.5) : w * Math.random();
        const y = h * (0.08 + Math.random() * 0.84);
        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
        });
      }

      // connect to K nearest neighbors
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

      // seed pulses
      for (let i = 0; i < 10; i++) spawnPulse();
    }

    function spawnPulse() {
      if (edges.length === 0) return;
      const e = Math.floor(Math.random() * edges.length);
      pulses.push({
        e,
        t: Math.random(),
        speed: 0.0035 + Math.random() * 0.006,
        width: 0.08 + Math.random() * 0.12,
      });
    }

    function drawBlobs(time: number) {
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const driftX = Math.sin(time * 0.0003 + i * 2.3) * 0.02;
        const driftY = Math.cos(time * 0.00028 + i * 1.7) * 0.02;

        const cx = (b.x + driftX) * w;
        const cy = (b.y + driftY) * h;
        const rr = b.r * Math.min(w, h);

        const g = ctx.createRadialGradient(cx, cy, rr * 0.2, cx, cy, rr);
        g.addColorStop(0, `rgba(255,255,255,${b.a * 0.75})`);
        g.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawGraph(time: number) {
      ctx.lineCap = "round";

      // faint network
      for (const e of edges) {
        const A = nodes[e.a];
        const B = nodes[e.b];
        const fade = clamp(1 - e.len / (Math.min(w, h) * 0.62), 0.1, 1);

        ctx.globalAlpha = 0.12 * intensity * fade;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }

      // nodes
      ctx.globalAlpha = 0.35 * intensity;
      ctx.fillStyle = "rgba(255,255,255,1)";
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // pulses (neural impulse)
      for (const p of pulses) {
        const e = edges[p.e];
        const A = nodes[e.a];
        const B = nodes[e.b];

        const t = p.t;
        const seg = p.width;

        const t0 = clamp(t - seg * 0.5, 0, 1);
        const t1 = clamp(t + seg * 0.5, 0, 1);

        const x0 = A.x + (B.x - A.x) * t0;
        const y0 = A.y + (B.y - A.y) * t0;
        const x1 = A.x + (B.x - A.x) * t1;
        const y1 = A.y + (B.y - A.y) * t1;

        // glow segment
        ctx.globalAlpha = 0.85 * intensity;
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        // head dot
        const hx = A.x + (B.x - A.x) * t;
        const hy = A.y + (B.y - A.y) * t;
        ctx.globalAlpha = 0.95 * intensity;
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.beginPath();
        ctx.arc(hx, hy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // occasional spark
      if (Math.sin(time * 0.008) > 0.985) spawnPulse();
    }

    function tick(time: number) {
      // motion
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        n.x = clamp(n.x, 0, w);
        n.y = clamp(n.y, 0, h);
      }

      // advance pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t > 1.1) pulses.splice(i, 1);
      }
      if (pulses.length < 12 && Math.random() < 0.12) spawnPulse();

      // clear + wash
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, w, h);

      drawBlobs(time);
      drawGraph(time);

      rafRef.current = requestAnimationFrame(tick);
    }

    resize();
    init();
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => {
      resize();
      init();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

function Tile({ app, onClick }: { app: AppDef; onClick?: (id: string) => void }) {
  return (
    <button
      onClick={() => onClick?.(app.id)}
      className="group relative flex h-28 w-24 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-white/8 focus:outline-none"
    >
      {typeof app.badge === "number" && app.badge > 0 && (
        <span className="absolute right-2 top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/90 px-1.5 text-[11px] font-semibold text-white">
          {app.badge}
        </span>
      )}
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <app.Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="text-sm font-semibold text-white/92">{app.name}</div>
      <div className="mt-0.5 text-[11px] text-white/55">{app.subtitle}</div>
    </button>
  );
}

function DockButton({ label, Icon, active }: { label: string; Icon: IconType; active?: boolean }) {
  return (
    <button
      className={[
        "flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
        active ? "bg-white/10 text-white" : "bg-white/5 text-white/80 hover:bg-white/8",
      ].join(" ")}
    >
      <Icon size={18} strokeWidth={1.8} />
      {label}
    </button>
  );
}

export default function Home() {
  const { ref: stageRef } = useResizeObserver<HTMLDivElement>();

  const apps: AppDef[] = useMemo(
    () => [
      { id: "receive", name: "Receive", subtitle: "RMIP intake", Icon: Inbox, badge: 3 },
      { id: "batch", name: "Batch", subtitle: "Build runs", Icon: FlaskConical },
      { id: "trace", name: "Trace", subtitle: "Lot passport", Icon: Search },
      { id: "suppliers", name: "Suppliers", subtitle: "Scorecards", Icon: Factory },

      { id: "coa", name: "COA", subtitle: "Docs + release", Icon: FileText },
      { id: "inventory", name: "Inventory", subtitle: "Lots + holds", Icon: Boxes, badge: 1 },
      { id: "lab", name: "Lab", subtitle: "Specs + results", Icon: ClipboardCheck },
      { id: "capability", name: "Capability", subtitle: "Cp/Cpk engine", Icon: Gauge },

      { id: "alerts", name: "Alerts", subtitle: "Reflex signals", Icon: Bell, badge: 7 },
      { id: "insights", name: "Insights", subtitle: "Trends", Icon: LineChart },
      { id: "compliance", name: "Compliance", subtitle: "Governance", Icon: ShieldCheck },
      { id: "settings", name: "Settings", subtitle: "System", Icon: Settings },
    ],
    []
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* background */}
      <div className="absolute inset-0">
        <NeuralBackdrop intensity={0.9} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/55" />
      </div>

      {/* content */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        {/* header */}
        <header className="flex items-start justify-center pt-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-4xl font-semibold tracking-tight">
              OmniLytix
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-semibold text-white/75">
                Seed v0.1
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-semibold text-white/75">
                Standing by
              </span>
            </div>
            <div className="mt-2 text-sm text-white/60">Calm by default. Powerful by design.</div>
          </div>
        </header>

        {/* center stage */}
        <section ref={stageRef} className="flex flex-1 items-center justify-center pb-28 pt-6">
          <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto]">
            <div className="hidden md:block" />
            <div className="mx-auto grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {apps.map((a) => (
                <Tile key={a.id} app={a} />
              ))}
            </div>
          </div>
        </section>

        {/* dock (hard centered) */}
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-10 w-[min(880px,92vw)] -translate-x-1/2">
          <div className="pointer-events-auto mx-auto flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl shadow-[0_15px_45px_rgba(0,0,0,0.45)]">
            <DockButton label="Receive" Icon={Inbox} active />
            <DockButton label="Trace" Icon={Search} />
            <DockButton label="Batch" Icon={FlaskConical} />
            <DockButton label="Settings" Icon={Settings} />
          </div>
        </div>
      </div>
    </main>
  );
}
