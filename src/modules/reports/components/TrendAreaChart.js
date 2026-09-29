/**
 * ─────────────────────────────────────────────────────────────────────────────
 * WIDGET: TrendAreaChart
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { memo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartShell, CustomTooltip, EmptyChart } from "./ChartShell";

const TrendAreaChart = memo(function TrendAreaChart({ kpiConfig, resolvedData, loading }) {
const series = resolvedData?.expandedSeries ?? kpiConfig.props?.series ?? [];
const points = resolvedData?.points ?? [];

  return (
    <ChartShell title={kpiConfig.title} showTitle loading={loading}>
      {points.length === 0 ? <EmptyChart /> : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
            <defs>
              {series.map((s, i) => (
                <linearGradient key={s.key} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={s.color} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0}    />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
            <XAxis dataKey="name" axisLine={false} tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              interval={points.length > 6 ? Math.floor(points.length / 6) : 0}
              angle={-25} textAnchor="end" height={44} />
            <YAxis axisLine={false} tickLine={false} width={30} allowDecimals={false}
              tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#64748b", paddingTop: 4 }} iconType="circle" iconSize={7} />
            {series.map((s) => (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.label}
                stroke={s.color} strokeWidth={2} fill={`url(#area-${s.key})`} dot={false}
                activeDot={{ r: 4, fill: s.color, strokeWidth: 2, stroke: "#fff" }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
});

export default TrendAreaChart;