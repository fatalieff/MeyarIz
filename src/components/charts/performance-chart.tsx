"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PerformanceChartProps {
  data: { label: string; value: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-slate-900">{value}%</span>
          <span className="text-xs font-medium text-indigo-600">orta nəticə</span>
        </div>
      </div>
    );
  }
  return null;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  if (!data.length) return null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ left: -18, right: 10, top: 16, bottom: 0 }}
          barCategoryGap="25%"
        >
          <defs>
            <linearGradient id="performanceBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.82} />
            </linearGradient>
            <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4338ca" stopOpacity={1} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.9} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            dy={8}
          />

          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(99, 102, 241, 0.05)", radius: 10 }}
          />

          <Bar
            dataKey="value"
            fill="url(#performanceBarGradient)"
            radius={[8, 8, 0, 0]}
            maxBarSize={46}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
