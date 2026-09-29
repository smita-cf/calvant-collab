import React from "react";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";

const COLORS = {
  compliant: "#10b981",
  partial: "#f59e0b",
  nonCompliant: "#ef4444",
  empty: "#e2e8f0",
};

const CompliancePie = ({ 
  compliant = 0, 
  nonCompliant = 0, 
  partial = 0, 
  size = 160,
  fontSize = "16px",
  showPercentage = true,
}) => {
  const total = compliant + nonCompliant + partial;
  const score = total > 0 ? Math.round((compliant / total) * 100) : 0;

  // Prevent empty pie chart crash by supplying a gray ring
  const hasData = total > 0;
  const pieData = hasData 
    ? [
        { name: "Compliant", value: compliant, color: COLORS.compliant },
        { name: "Partial", value: partial, color: COLORS.partial },
        { name: "Non-Compliant", value: nonCompliant, color: COLORS.nonCompliant },
      ].filter((d) => d.value > 0)
    : [{ name: "No Data", value: 1, color: COLORS.empty }];

  return (
    <div
      className="relative flex items-center justify-center transition-all duration-300 ease-out hover:scale-105"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            innerRadius="72%"
            outerRadius="90%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={hasData ? 2 : 0}
            animationDuration={800}
          >
            {pieData.map((entry, i) => (
              <Cell 
                key={i} 
                fill={entry.color} 
                className="transition-all duration-300"
                style={{ filter: hasData ? "drop-shadow(0px 2px 4px rgba(0,0,0,0.06))" : "none" }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span 
            className="font-bold text-slate-800 tracking-tight"
            style={{ 
              fontSize, 
              lineHeight: 1,
              fontFamily: "Inter, Roboto, sans-serif"
            }}
          >
            {hasData ? `${score}%` : "0%"}
          </span>
          {size >= 100 && (
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Score
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CompliancePie;

