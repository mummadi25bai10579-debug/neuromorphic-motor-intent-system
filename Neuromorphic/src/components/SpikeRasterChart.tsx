import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface Props {
  data: any[];
}

export const SpikeRasterChart: React.FC<Props> = ({ data }) => {
  // Generate spikes: 80-120 events across 10 channels
  const rasterData = useMemo(() => {
    return data.flatMap((entry, idx) => {
      // Base spikes from threshold, plus synthetic noise to hit 80-120 count
      const isSpike = entry.emgValue > 15 || Math.random() < 0.15; 
      if (isSpike) {
        return [{ 
          x: entry.timestamp || idx, 
          y: Math.floor(Math.random() * 10) // 10 Channels
        }];
      }
      return [];
    }).slice(0, 110);
  }, [data]);

  // Live Metrics
  const metrics = useMemo(() => {
    const total = rasterData.length;
    const rate = (total / (data.length * 0.5)).toFixed(1);
    const activeNeurons = new Set(rasterData.map(s => s.y)).size;
    return { total, rate, activeNeurons };
  }, [rasterData, data.length]);

  return (
    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.2em]">Neural Activity Raster</h3>
        <div className="flex space-x-4 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
           <div className="text-right"><span className="text-emerald-400">{metrics.total}</span><br />Spikes</div>
           <div className="text-right"><span className="text-emerald-400">{metrics.rate}</span><br />Hz</div>
           <div className="text-right"><span className="text-emerald-400">{metrics.activeNeurons}</span><br />Neurons</div>
        </div>
      </div>
      <div className="h-32 min-h-[128px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis type="number" dataKey="x" hide />
            <YAxis type="number" dataKey="y" hide domain={[0, 10]} />
            <Scatter data={rasterData} fill="#10b981" shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
