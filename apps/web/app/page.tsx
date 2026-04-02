"use client";

import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import AmbientFieldBackground from "../src/components/AmbientFieldBackground";

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

function Tile({ app }: { app: AppDef }) {
  const router = useRouter();

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // subtle micro-parallax (premium OS feel)
    el.style.transform = `
      translateY(-4px)
      rotateX(${(-y / 60).toFixed(2)}deg)
      rotateY(${(x / 60).toFixed(2)}deg)
    `;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <button
      onClick={() => router.push(`/${app.id}`)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="
        group relative flex h-28 w-24 flex-col items-center justify-center
        rounded-3xl
        border border-white/10
        bg-white/[0.035]
        backdrop-blur-xl
        shadow-[0_12px_32px_rgba(0,0,0,0.45)]
        transition
        duration-300
        ease-out
        hover:bg-white/[0.06]
        focus:outline-none
        will-change-transform
      "
    >
      {/* light refraction layer */}
      <div
        className="
          pointer-events-none absolute inset-0 rounded-3xl
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
        style={{
          background:
            "radial-gradient(120px 80px at 50% 30%, rgba(255,255,255,0.18), transparent 60%)",
        }}
      />

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

function DockButton({
  label,
  Icon,
  active,
}: {
  label: string;
  Icon: IconType;
  active?: boolean;
}) {
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
      <AmbientFieldBackground intensity={0.9} />

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
          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {apps.map((a) => (
                <Tile key={a.id} app={a} />
              ))}
            </div>
          </div>
        </section>

        {/* dock (hard centered) */}
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-10 w-[min(880px,92vw)] -translate-x-1/2">
          <div
            className="
              pointer-events-auto mx-auto relative
              flex items-center justify-center gap-3
              rounded-3xl
              border border-white/[0.12]
              bg-white/[0.06]
              backdrop-blur-2xl
              shadow-[0_20px_60px_rgba(0,0,0,0.55)]
              p-2
            "
          >
            {/* top edge highlight */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(255,255,255,0.35), transparent)",
              }}
            />
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
