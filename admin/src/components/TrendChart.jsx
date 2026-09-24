import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const TrendChart = ({ data, formatValue }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} yAxisId="left" />
        <YAxis
          tick={{ fontSize: 11 }}
          stroke="#94a3b8"
          allowDecimals={false}
          yAxisId="right"
          orientation="right"
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(value, name) => {
            const label = name === 'revenue' ? 'Doanh thu' : 'Lượt xem';
            const formatted = name === 'revenue'
              ? formatValue ? formatValue(value) : value
              : value;
            return [`${formatted}`, label];
          }}
        />
        <Legend
          formatter={(value) => (value === 'revenue' ? 'Doanh thu' : 'Lượt xem')}
          iconType="circle"
          iconSize={8}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 4 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="visits"
          stroke="#16a34a"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
