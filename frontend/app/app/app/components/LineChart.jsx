"use client";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function LineChartComponent({ data }) {
  data[3].week = "This week";
  data[2].week = "Last week";
  data[1].week = "2 weeks ago";
  data[0].week = "3 weeks ago";
  return (
    <ResponsiveContainer width="99%" height={300}>
      <LineChart
        width={300}
        height={100}
        data={data}
        margin={{ left: 20, right: 80, top: 20, bottom: 10 }}
      >
        <XAxis dataKey="week" dy={10} />
        <YAxis dataKey="count" tickCount={1} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#FFFFFF"
          strokeWidth={4}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
