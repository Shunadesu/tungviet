import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Processing: '#3b82f6',
  Shipped: '#8b5cf6',
  Delivered: '#16a34a',
  Cancelled: '#ef4444',
};

const StatusPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400">
        Chưa có dữ liệu
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item._id || 'Khác',
    value: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          paddingAngle={3}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((entry, index) => {
            const color = STATUS_COLORS[entry.name] || `#${((index * 123456) % 0xffffff).toString(16).padStart(6, '0')}`;
            return <Cell key={index} fill={color} />;
          })}
        </Pie>
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value, name) => [value, name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusPieChart;
