/**
 * ─────────────────────────────────────────────────────────────────────────────
 * WIDGET: TrendBarChart
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { memo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartShell, CustomTooltip, EmptyChart } from "./ChartShell";

const TrendBarChart = memo(function TrendBarChart({ kpiConfig, resolvedData, loading }) {
const series = resolvedData?.expandedSeries ?? kpiConfig.props?.series ?? [];
const points = resolvedData?.points ?? [];

  return (
    <ChartShell title={kpiConfig.title} showTitle loading={loading}>
      {points.length === 0 ? <EmptyChart /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 10, right: 10, left: -10, bottom: 30 }} barSize={14}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`bar-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={s.color} stopOpacity={0.9}  />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.55} />
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
              <Bar key={s.key} dataKey={s.key} name={s.label}
                fill={`url(#bar-${s.key})`} radius={[4, 4, 0, 0]} animationDuration={700} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
});

export default TrendBarChart;