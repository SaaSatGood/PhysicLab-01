import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ChartDataPoint } from '../types';

interface Props {
  data: ChartDataPoint[];
}

export const DataCharts: React.FC<Props> = ({ data }) => {
  const displayData = data.slice(-100);

  // Cores de Alto Contraste
  const COLOR_EULER = '#ff6b6b'; 
  const COLOR_RK4 = '#4ecdc4';   

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full">
      
      {/* Gráfico 1 */}
      <div className="flex-1 min-h-[180px]">
        <h3 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
            Posição Vertical (Y)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis 
                dataKey="time" 
                stroke="#a1a1aa" 
                fontSize={12} 
                tickFormatter={(val) => val.toFixed(1) + 's'} 
                tickLine={false}
                axisLine={false}
            />
            <YAxis 
                stroke="#a1a1aa" 
                fontSize={12} 
                domain={['auto', 'auto']} 
                tickLine={false}
                axisLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#fff' }}
              itemStyle={{ fontSize: 13 }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: '10px' }} />
            <Line 
              type="monotone" 
              dataKey="positionY_Euler" 
              name="Euler" 
              stroke={COLOR_EULER} 
              strokeWidth={3} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="positionY_RK4" 
              name="RK4" 
              stroke={COLOR_RK4} 
              strokeWidth={3} 
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 2 */}
      <div className="flex-1 min-h-[180px]">
        <h3 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
            Energia Total (Joules)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData}>
             <defs>
              <linearGradient id="colorEuler" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR_EULER} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLOR_EULER} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRK4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR_RK4} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLOR_RK4} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis 
                dataKey="time" 
                stroke="#a1a1aa" 
                fontSize={12} 
                tickFormatter={(val) => val.toFixed(1) + 's'}
                tickLine={false}
                axisLine={false}
            />
            <YAxis 
                stroke="#a1a1aa" 
                fontSize={12} 
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#fff' }}
              itemStyle={{ fontSize: 13 }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: '10px' }} />
            <Area 
              type="monotone" 
              dataKey="energy_Euler" 
              name="Euler Energia" 
              stroke={COLOR_EULER} 
              fillOpacity={1} 
              fill="url(#colorEuler)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="energy_RK4" 
              name="RK4 Energia" 
              stroke={COLOR_RK4} 
              fillOpacity={1} 
              fill="url(#colorRK4)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};