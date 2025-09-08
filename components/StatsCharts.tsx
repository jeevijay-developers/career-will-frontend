"use client";

import React from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export interface StatsChartsProps {
  totalStudents: number;
  totalRevenue: number;
  totalCollected: number;
  totalPending?: number;
}

const colorsConfig: ChartConfig = {
  students: { label: "Students", color: "hsl(var(--chart-1))" },
  revenue: { label: "Total Revenue", color: "hsl(var(--chart-2))" },
  collected: { label: "Collected", color: "hsl(var(--chart-3))" },
  pending: { label: "Pending", color: "hsl(var(--chart-4))" },
};

export const StatsCharts: React.FC<StatsChartsProps> = ({
  totalStudents,
  totalRevenue,
  totalCollected,
  totalPending,
}) => {
  const pending =
    typeof totalPending === "number"
      ? totalPending
      : Math.max(0, totalRevenue - totalCollected);

  const pieData = [
    { key: "students", label: "Students", value: totalStudents },
    { key: "revenue", label: "Total Revenue", value: totalRevenue },
    { key: "collected", label: "Collected", value: totalCollected },
    { key: "pending", label: "Pending", value: pending },
  ];

  const barData = [
    {
      name: "Totals",
      students: totalStudents,
      revenue: totalRevenue,
      collected: totalCollected,
      pending: pending,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Pie Chart */}
      <ChartContainer config={colorsConfig} className="w-full">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent nameKey="label" labelKey="label" />}
          />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="label"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={3}
            strokeWidth={2}
          >
            {pieData.map((entry) => (
              <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
            ))}
          </Pie>
          <ChartLegend
            verticalAlign="bottom"
            content={<ChartLegendContent nameKey="label" />}
          />
        </PieChart>
      </ChartContainer>

      {/* Bar Chart */}
      <ChartContainer config={colorsConfig} className="w-full">
        <BarChart data={barData} barCategoryGap={16}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            content={<ChartTooltipContent />}
          />
          <Bar dataKey="students" fill="var(--color-students)" radius={6} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={6} />
          <Bar dataKey="collected" fill="var(--color-collected)" radius={6} />
          <Bar dataKey="pending" fill="var(--color-pending)" radius={6} />
          <ChartLegend content={<ChartLegendContent />} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default StatsCharts;
