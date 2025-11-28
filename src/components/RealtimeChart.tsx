import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RealtimeChartProps {
  data: Array<{ time: string; value: number }>;
  color: string;
  unit: string;
}

export function RealtimeChart({ data, color, unit }: RealtimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
          unit={unit}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
