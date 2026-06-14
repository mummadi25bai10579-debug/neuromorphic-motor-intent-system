import React from 'react';

interface Props {
  accuracy: number;
  latency: number;
  power: number;
}

const KpiCard = ({ title, value, unit }: { title: string, value: string, unit: string }) => (
  <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col items-center">
    <span className="text-xs text-zinc-500 uppercase tracking-wider">{title}</span>
    <div className="mt-2 flex items-baseline">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs text-zinc-400 ml-1">{unit}</span>
    </div>
  </div>
);

export const KpiOverview: React.FC<Props> = ({ accuracy, latency, power }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <KpiCard title="Accuracy" value={accuracy.toFixed(1)} unit="%" />
      <KpiCard title="Latency" value={latency.toFixed(0)} unit="ms" />
      <KpiCard title="Power" value={power.toFixed(0)} unit="mW" />
    </div>
  );
};
