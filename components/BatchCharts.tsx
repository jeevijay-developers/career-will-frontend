"use client";

import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export interface BatchItem {
  _id: string | null;
  count: number;
}

export interface BatchChartsProps {
  data: BatchItem[];
}

const palette = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

const BatchCharts: React.FC<BatchChartsProps> = ({ data }) => {
  const chartData = (data || []).map((b) => ({
    name: b._id || "Unassigned",
    count: b.count || 0,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Pie Chart */}
      <ChartContainer config={{}} className="w-full">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent nameKey="name" labelKey="name" />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`slice-${entry.name}-${index}`}
                fill={palette[index % palette.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Line Chart */}
      <ChartContainer config={{}} className="w-full">
        <LineChart
          data={chartData}
          margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={50}
          />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip
            cursor={{ stroke: "hsl(var(--muted-foreground))" }}
            content={<ChartTooltipContent />}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default BatchCharts;
