
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineChartComponentProps {
  data: any[];
  xDataKey: string;
  dataKeys: { key: string; name: string; color: string }[];
  height?: string;
  formatter?: (value: any) => string;
}

export function LineChartComponent({
  data,
  xDataKey,
  dataKeys,
  height = "h-80",
  formatter,
}: LineChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} />
        <YAxis />
        <Tooltip formatter={formatter} />
        <Legend />
        {dataKeys.map((dataKey) => (
          <Line
            key={dataKey.key}
            type="monotone"
            dataKey={dataKey.key}
            name={dataKey.name}
            stroke={dataKey.color}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
