"use client";

import { useEffect, useState } from "react";

function FloatingFigure({ delay, duration, x, y, value, opacity }: {
  delay: number; duration: number; x: number; y: number; value: string; opacity: number;
}) {
  return (
    <span
      className="absolute font-heading text-primary/[var(--fig-opacity)] select-none animate-[drift_var(--drift-duration)_ease-in-out_infinite_var(--drift-delay)]"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        fontSize: `${14 + Math.random() * 24}px`,
        "--fig-opacity": opacity,
        "--drift-delay": `${delay}s`,
        "--drift-duration": `${duration}s`,
      } as React.CSSProperties}
    >
      {value}
    </span>
  );
}

const FIGURES = [
  "$12,450", "€8,200", "£3,780", "$45.2K", "¥920K",
  "+14.2%", "-3.8%", "+$2,100", "€15,000", "$890",
  "£24,500", "+7.6%", "$103K", "¥45,800", "€6,340",
  "$78.9K", "-1.2%", "+€4,500", "$2,890", "£19,200",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand statement */}
      <div className="relative hidden w-[55%] overflow-hidden lg:block">
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_hsl(42_70%_60%_/_0.08)_0%,_transparent_60%),_radial-gradient(ellipse_at_70%_80%,_hsl(42_70%_60%_/_0.04)_0%,_transparent_50%)]" />

        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.35]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }} />

        {/* Floating financial figures */}
        {mounted && (
          <div className="absolute inset-0">
            {FIGURES.map((value, i) => (
              <FloatingFigure
                key={i}
                value={value}
                delay={i * 0.7}
                duration={20 + Math.random() * 15}
                x={5 + (i * 4.5) % 90}
                y={5 + ((i * 17) % 85)}
                opacity={0.04 + Math.random() * 0.06}
              />
            ))}
          </div>
        )}

        {/* Brand mark */}
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="animate-[fadeSlideIn_0.8s_ease-out_both]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="font-heading text-lg font-bold text-primary-foreground">K</span>
              </div>
              <span className="font-heading text-xl font-semibold tracking-tight text-foreground/90">
                Kapital
              </span>
            </div>
          </div>

          <div className="max-w-md space-y-6 animate-[fadeSlideIn_0.8s_ease-out_0.2s_both]">
            <h2 className="font-heading text-5xl font-semibold leading-[1.1] tracking-tight">
              Your money,
              <br />
              <span className="text-primary">clearly seen.</span>
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Track every transaction, budget with precision,
              and watch your savings grow — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-8 animate-[fadeSlideIn_0.8s_ease-out_0.4s_both]">
            <div className="space-y-1">
              <p className="font-heading text-2xl font-semibold text-primary">256-bit</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Encryption</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="space-y-1">
              <p className="font-heading text-2xl font-semibold text-primary">Real-time</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Sync</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="space-y-1">
              <p className="font-heading text-2xl font-semibold text-primary">100%</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Private</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 lg:w-[45%] lg:px-16">
        {/* Subtle separator line */}
        <div className="absolute left-0 top-[10%] hidden h-[80%] w-px bg-gradient-to-b from-transparent via-border to-transparent lg:block" />

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
