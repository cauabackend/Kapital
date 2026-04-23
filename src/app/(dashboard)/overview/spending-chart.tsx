"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MonthlyChartPoint } from "./actions";

// Recharts v3 tooltip payload shape
interface TooltipEntry {
  name: string;
  color: string;
  value?: number;
}

interface ChartTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl">
      <div className="border-b border-border/40 px-4 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </p>
      </div>
      <div className="space-y-1.5 px-4 py-3">
        {(payload as TooltipEntry[]).map((p) => (
          <div key={p.name} className="flex items-center gap-3 text-sm">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="capitalize text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-heading font-semibold tabular-nums">
              {p.value !== undefined
                ? p.value.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                  })
                : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SpendingChartProps {
  data: MonthlyChartPoint[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={data}
        margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
      >
        <defs>
          <linearGradient id="grad-income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(155,50%,55%)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="hsl(155,50%,55%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="grad-expenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(0,65%,62%)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(0,65%,62%)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(0,0%,100%)"
          strokeOpacity={0.04}
          vertical={false}
        />

        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "hsl(40,6%,55%)", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tickFormatter={(v: number) =>
            v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
          }
          tick={{ fontSize: 11, fill: "hsl(40,6%,55%)" }}
          axisLine={false}
          tickLine={false}
          width={52}
        />

        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content={(props: any) => <CustomTooltip {...props} />}
          cursor={{
            stroke: "hsl(42,70%,60%)",
            strokeWidth: 1,
            strokeOpacity: 0.3,
          }}
        />

        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="hsl(155,50%,55%)"
          strokeWidth={2}
          fill="url(#grad-income)"
          dot={false}
          activeDot={{ r: 4, fill: "hsl(155,50%,55%)", strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="hsl(0,65%,62%)"
          strokeWidth={2}
          fill="url(#grad-expenses)"
          dot={false}
          activeDot={{ r: 4, fill: "hsl(0,65%,62%)", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
