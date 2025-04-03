
import { PricePoint } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import {
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PriceHistoryChartProps {
  priceHistory: PricePoint[];
  timeRange?: '7days' | '30days' | '90days' | 'all';
}

const PriceHistoryChart = ({ 
  priceHistory, 
  timeRange = 'all' 
}: PriceHistoryChartProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  
  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const filteredData = useMemo(() => {
    if (timeRange === 'all') return priceHistory;
    
    const today = new Date();
    let daysToSubtract = 90;
    
    if (timeRange === '7days') daysToSubtract = 7;
    if (timeRange === '30days') daysToSubtract = 30;
    
    const cutoffDate = subDays(today, daysToSubtract);
    
    return priceHistory.filter(point => new Date(point.date) >= cutoffDate);
  }, [priceHistory, timeRange]);

  // Format data for recharts
  const data = useMemo(() => {
    return filteredData.map(point => ({
      date: point.date,
      price: point.price,
      formattedDate: format(new Date(point.date), 'MMM d'),
    }));
  }, [filteredData]);

  // Calculate min and max for YAxis
  const minPrice = Math.min(...data.map(point => point.price)) * 0.9;
  const maxPrice = Math.max(...data.map(point => point.price)) * 1.1;
  
  // Calculate average price
  const averagePrice = data.reduce((sum, point) => sum + point.price, 0) / data.length;

  return (
    <div className="w-full" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 30,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 12 }} 
            interval={containerWidth < 768 ? 'preserveStartEnd' : 0} 
            tickMargin={10}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '8px 12px',
            }}
          />
          <ReferenceLine 
            y={averagePrice} 
            stroke="#8884d8" 
            strokeDasharray="3 3" 
            label={{ 
              value: 'Avg', 
              position: 'left',
              fill: '#8884d8',
              fontSize: 12,
            }} 
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryChart;
