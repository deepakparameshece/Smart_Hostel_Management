"use client";

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const revenueData = [
  { name: 'Jan', revenue: 35000, students: 1100 },
  { name: 'Feb', revenue: 38000, students: 1150 },
  { name: 'Mar', revenue: 42500, students: 1248 },
  { name: 'Apr', revenue: 45000, students: 1300 },
  { name: 'May', revenue: 41000, students: 1280 },
  { name: 'Jun', revenue: 48000, students: 1350 },
];

const blockData = [
  { name: 'Block A', value: 450, color: '#8b5cf6' },
  { name: 'Block B', value: 380, color: '#3b82f6' },
  { name: 'Block C', value: 210, color: '#10b981' },
  { name: 'Block D', value: 208, color: '#f59e0b' },
];

export function RevenueAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={revenueData}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#9ca3af" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#9ca3af" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(value) => `₹${value/1000}k`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
          itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OccupancyPieChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={blockData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {blockData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
           contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
