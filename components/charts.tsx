"use client";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
export function GrowthChart({
  data,
}: {
  data: { day: string; followers: number }[];
}) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C3BFF" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6C3BFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="day"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            interval={29}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              color: "var(--ink)",
            }}
          />
          <Area
            type="monotone"
            dataKey="followers"
            stroke="#6C3BFF"
            strokeWidth={2.5}
            fill="url(#growth)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function EarningsChart() {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[
            { month: "May", earnings: 18000 },
            { month: "Jun", earnings: 24000 },
            { month: "Jul", earnings: 21000 },
            { month: "Aug", earnings: 36000 },
            { month: "Sep", earnings: 42000 },
            { month: "Oct", earnings: 56000 },
          ]}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
            }}
          />
          <Bar
            dataKey="earnings"
            fill="#6C3BFF"
            radius={[5, 5, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function GenderChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="gender-chart">
      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={52}
            outerRadius={74}
            paddingAngle={3}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={["#6C3BFF", "#FF5A36", "#C8F560"][i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div>
        {data.map((d, i) => (
          <span key={d.name}>
            <i style={{ background: ["#6C3BFF", "#FF5A36", "#C8F560"][i] }} />
            {d.name}
            <strong>{d.value}%</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
