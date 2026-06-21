import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Activity } from 'lucide-react';

const COLORS = ['#ACE1AF', '#50C878', '#38bdf8', '#fb7185', '#a78bfa', '#fb923c', '#facc15'];

const GraphView = ({ data }) => {
  const [chartType, setChartType] = useState('bar'); // bar, line, area, pie
  
  // Analyze data keys
  const { numericKeys, stringKeys } = useMemo(() => {
    if (!data || data.length === 0) return { numericKeys: [], stringKeys: [] };
    
    // Flatten rows slightly for analysis
    const sample = data[0];
    const nKeys = [];
    const sKeys = [];
    
    Object.keys(sample).forEach(key => {
      // Don't chart Mongo IDs
      if (key === '_id' || key === 'id' || key === '__v') return;
      
      const values = data.map(d => d[key]);
      const validNumbers = values.filter(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v))));
      
      if (validNumbers.length > data.length * 0.5) {
        nKeys.push(key);
      } else {
        sKeys.push(key);
      }
    });
    
    return { numericKeys: nKeys, stringKeys: sKeys };
  }, [data]);

  const [xAxisKey, setXAxisKey] = useState(stringKeys[0] || (data && data.length > 0 ? Object.keys(data[0])[0] : ''));
  const [yAxisKey, setYAxisKey] = useState(numericKeys[0] || '');

  // Reset keys if data changes
  React.useEffect(() => {
    if (stringKeys.length > 0) setXAxisKey(stringKeys[0]);
    if (numericKeys.length > 0) setYAxisKey(numericKeys[0]);
  }, [numericKeys, stringKeys]);

  if (!data || data.length === 0) return <div className="text-white/40 text-xs p-4 text-center">No data to chart</div>;
  if (numericKeys.length === 0) {
    return (
      <div className="text-white/40 text-xs p-8 text-center flex flex-col items-center justify-center gap-2">
        <Activity size={24} className="opacity-30" />
        <span>No numeric fields detected in the result to plot a graph.</span>
      </div>
    );
  }

  // Format data for Recharts (convert potential numeric strings to numbers)
  const chartData = data.map(d => {
    const formatted = { ...d };
    numericKeys.forEach(k => {
      formatted[k] = Number(d[k]);
    });
    return formatted;
  });

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <XAxis dataKey={xAxisKey} stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey={yAxisKey} stroke="#ACE1AF" strokeWidth={2.5} activeDot={{ r: 6 }} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#50C878" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#50C878" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey={xAxisKey} stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey={yAxisKey} stroke="#50C878" fillOpacity={1} fill="url(#colorArea)" />
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={90}
              fill="#8884d8"
              dataKey={yAxisKey}
              nameKey={xAxisKey}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        );
      case 'bar':
      default:
        return (
          <BarChart data={chartData}>
            <XAxis dataKey={xAxisKey} stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey={yAxisKey} fill="#ACE1AF" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-black/10 border border-white/5">
      {/* Chart controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-celadon text-background' : 'text-white/60 hover:text-white'}`}
            title="Bar Chart"
          >
            <BarChart3 size={15} />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-celadon text-background' : 'text-white/60 hover:text-white'}`}
            title="Line Chart"
          >
            <LineIcon size={15} />
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'area' ? 'bg-celadon text-background' : 'text-white/60 hover:text-white'}`}
            title="Area Chart"
          >
            <Activity size={15} />
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'pie' ? 'bg-celadon text-background' : 'text-white/60 hover:text-white'}`}
            title="Pie Chart"
          >
            <PieIcon size={15} />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="opacity-40">X Axis:</span>
            <select
              value={xAxisKey}
              onChange={(e) => setXAxisKey(e.target.value)}
              className="bg-neutral-900 border border-white/10 rounded px-2 py-1 outline-none text-white focus:border-celadon/50"
            >
              {stringKeys.concat(numericKeys).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="opacity-40">Y Axis (Values):</span>
            <select
              value={yAxisKey}
              onChange={(e) => setYAxisKey(e.target.value)}
              className="bg-neutral-900 border border-white/10 rounded px-2 py-1 outline-none text-white focus:border-celadon/50"
            >
              {numericKeys.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart Render Canvas */}
      <div className="w-full h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraphView;
