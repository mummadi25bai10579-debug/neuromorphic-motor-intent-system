import React from "react";
import { SignalFrame, SNNConfig, Patient } from "../types";
import { Activity, Zap, Cpu } from "lucide-react";
import { motion } from "motion/react";

interface LIFGraphProps {
  frames: SignalFrame[];
  config: SNNConfig;
  isActive: boolean;
  state: "resting" | "intent";
  patient: Patient;
  mode?: "all" | "analog-only" | "neuromorphic-only";
}

export const LIFGraph = React.memo(({
  frames,
  config,
  isActive,
  state,
  patient,
  mode = "all",
}: LIFGraphProps) => {
  if (frames.length === 0) {
    return (
      <div className="h-[420px] flex items-center justify-center bg-[#03040a]/80 backdrop-blur-2xl border border-cyan-500/20 rounded-[32px]">
        <p className="text-cyan-500/50 font-mono text-sm tracking-widest uppercase animate-pulse">
          Awaiting neural signals...
        </p>
      </div>
    );
  }

  // Dimension helpers
  const width = 600;
  const height = 80;
  const margin = { top: 10, right: 10, bottom: 15, left: 45 };

  const getPoints = (
    data: SignalFrame[],
    key: "eegValue" | "emgValue" | "membranePotential",
    minVal: number,
    maxVal: number,
  ) => {
    const dataLen = data.length;
    const denom = dataLen > 1 ? dataLen - 1 : 1;
    return data
      .map((frame, i) => {
        const x =
          margin.left + (i / denom) * (width - margin.left - margin.right);
        const val = frame[key] as number;
        // scale logic
        const rawY =
          margin.top +
          ((maxVal - val) / (maxVal - minVal)) *
            (height - margin.top - margin.bottom);
        const y = Math.max(margin.top, Math.min(height - margin.bottom, rawY));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const eegPoints = getPoints(frames, "eegValue", -35, 35);
  const emgPoints = getPoints(frames, "emgValue", 0, 160);
  const memPoints = getPoints(
    frames,
    "membranePotential",
    0,
    Math.max(config.threshold * 1.25, 50),
  );

  const maxMemScale = Math.max(config.threshold * 1.25, 50);
  const memHeight = 94;
  const thresholdY =
    margin.top +
    ((maxMemScale - config.threshold) / maxMemScale) *
      (memHeight - margin.top - margin.bottom);

  const outSpikes = frames.filter((f) => f.outputSpike);

  const showAnalog = mode === "all" || mode === "analog-only";
  const showSNN = mode === "all" || mode === "neuromorphic-only";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-[#03040a]/80 backdrop-blur-3xl border border-cyan-500/20 rounded-[32px] overflow-hidden p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] space-y-6 relative"
    >
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Chart Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-extrabold text-lg text-gray-100 tracking-tight">
              Silicon LIF Nuprobe Monitor
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                Real-time Oscilloscope Feed
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <div className="lg:col-span-3 space-y-4">
          {showAnalog && (
            <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-4 relative overflow-hidden backdrop-blur-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-indigo-500" />
                  Primary Raw EEG Trace
                </span>
                <span className="text-[9px] text-zinc-600 font-mono">
                  Analog / Non-spiking
                </span>
              </div>
              <svg
                className="w-full bg-zinc-950"
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
              >
                <path
                  d={`M ${eegPoints}`}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  style={{
                    filter: "drop-shadow(0px 0px 4px rgba(99,102,241,0.5))",
                  }}
                />
              </svg>
            </div>
          )}

          {showAnalog && (
            <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-4 relative overflow-hidden backdrop-blur-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-emerald-500" />
                  Forearm Raw EMG Trace
                </span>
              </div>
              <svg
                className="w-full bg-zinc-950"
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
              >
                <path
                  d={`M ${emgPoints}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  style={{
                    filter: "drop-shadow(0px 0px 4px rgba(16,185,129,0.5))",
                  }}
                />
              </svg>
            </div>
          )}

          {showSNN && (
            <div className="bg-cyan-950/20 border border-cyan-900/30 rounded-2xl p-4 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20 pointer-events-none"></div>
              <div className="flex justify-between items-center mb-2 relative z-10">
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5" /> Silicon Soma Integrator (V_m)
                </span>
                <span className="text-[9px] text-cyan-600/60 font-mono">
                  Spiking Output
                </span>
              </div>
              <svg
                className="w-full bg-zinc-950"
                height={memHeight}
                viewBox={`0 0 ${width} ${memHeight}`}
                preserveAspectRatio="none"
              >
                <path
                  d={`M ${memPoints}`}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  style={{
                    filter: "drop-shadow(0px 0px 6px rgba(6,182,212,0.6))",
                  }}
                />
                <line
                  x1={margin.left}
                  x2={width - margin.right}
                  y1={thresholdY}
                  y2={thresholdY}
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 5}
                  y={thresholdY + 3}
                  fill="#ef4444"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono"
                >
                  Vth
                </text>
                {outSpikes.map((f, i) => {
                  const denom = frames.length > 1 ? frames.length - 1 : 1;
                  const idx = frames.indexOf(f);
                  const x =
                    margin.left +
                    (idx / denom) * (width - margin.left - margin.right);
                  return (
                    <g key={`out-${i}`}>
                      <line
                        x1={x}
                        x2={x}
                        y1={thresholdY}
                        y2={margin.bottom}
                        stroke="#fcd34d"
                        strokeWidth="2"
                        opacity="0.8"
                        style={{ filter: "drop-shadow(0px 0px 4px #fcd34d)" }}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        <div className="bg-[#080a13] border border-cyan-900/40 rounded-2xl p-5 flex flex-col justify-between shadow-[inset_0_0_30px_rgba(6,182,212,0.05)]">
          <div>
            <h4 className="text-cyan-400 text-[9px] font-mono uppercase tracking-[0.2em] mb-4">
              SNN Status
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider block font-sans">
                  Soma V_m (Current)
                </span>
                <span
                  className={`text-2xl font-black font-mono tracking-tighter ${frames[frames.length - 1]?.membranePotential >= config.threshold ? "text-amber-400" : "text-cyan-300"}`}
                >
                  {frames[frames.length - 1]?.membranePotential.toFixed(1)}{" "}
                  <span className="text-sm text-cyan-600">mV</span>
                </span>
              </div>
              <div className="h-[1px] w-full bg-white/5" />
              <div>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider block font-sans">
                  Trigger Spikes
                </span>
                <span className="text-3xl font-black font-mono text-amber-400 tracking-tighter drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                  {outSpikes.length}{" "}
                  <Zap className="w-5 h-5 inline text-amber-500" />
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-500">Threshold</span>
              <span className="text-cyan-400 font-bold">
                {config.threshold} mV
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-500">Leak Rate</span>
              <span className="text-cyan-400 font-bold">
                -{config.leak} /ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
