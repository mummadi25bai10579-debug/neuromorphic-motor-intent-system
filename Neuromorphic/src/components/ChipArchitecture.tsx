import React, { useState } from "react";
import {
  Cpu,
  Eye,
  Zap,
  ShieldAlert,
  Sliders,
  Check,
  HelpCircle,
} from "lucide-react";
import { SNNConfig, SimulationMetrics } from "../types";

interface ChipArchitectureProps {
  config: SNNConfig;
  metrics: SimulationMetrics;
  onConfigChange: (updater: SNNConfig) => void;
}

interface BlockDetail {
  title: string;
  sub: string;
  desc: string;
  latencyText: string;
  powerText: string;
}

export const ChipArchitecture = React.memo(({
  config,
  metrics,
  onConfigChange,
}: ChipArchitectureProps) => {
  const [selectedBlock, setSelectedBlock] = useState<string>("crossbar");
  const [precision, setPrecision] = useState<"8bit" | "16bit" | "analog">(
    "analog",
  );

  const blocks: Record<string, BlockDetail> = {
    afe: {
      title: "Biopotential Analog Front-End (AFE)",
      sub: "Instrumentation Amp & Active Filter Array",
      desc: "Captures continuous EEG (C3 motor cortex) & forearm muscle EMG. Utilizes high Common-Mode Rejection Ratio (CMRR > 110dB) instrumentation amplifiers with integrated low-power bandpass filtering (0.5Hz to 150Hz) to filter out physiological artifacts such as blink activity and motion noise.",
      latencyText: "0.2 ms pre-processing",
      powerText: "1.2 μW bias current",
    },
    delta_mod: {
      title: "Asynchronous Delta-Modulator Encoders",
      sub: "Level-Crossing Analog-to-Event Converters",
      desc: "An edge-activation converter that replaces heavy power-hungry Nyquist ADCs. EEG/EMG signals are monitored continuously. Whenever raw voltage deviates from a sliding reference state by more than the configurable Delta threshold (Δ_th), a positive or negative spike event is produced immediately and asynchronously.",
      latencyText: "0.05 ms packet emission",
      powerText: "0.6 μW spike-driven activation",
    },
    crossbar: {
      title: "Synaptic Crossbar SRAM Array",
      sub: "Low-leakage Static Synapse Memory Grid",
      desc: "Hosts the dynamic weights (W_ij) representing connection strengths between biosignal event channels and the somatic motor-intent detector. Integrating STDP (Spike-Timing-Dependent Plasticity) allows weights to adaptively strengthen (potentiate) or weaken (depress) based on sub-millisecond temporal correlations.",
      latencyText: "0.15 ms synaptic propagation",
      powerText: "0.9 μW holding / 12 pJ per spike event",
    },
    soma: {
      title: "Silicon Soma Integrator (LIF Array)",
      sub: "Leaky Integrate-and-Fire Silicon Neurons",
      desc: "Integrates pre-synaptic electrical charges on physical silicon capacitors. Implements leaky integrate-and-fire math: charge leaks continuously according to the leak constant fraction, while incoming spikes jump the potential V_m higher. If V_m steps over V_th, a motorized mechanical wrist assist trigger fires.",
      latencyText: "0.08 ms integration delay",
      powerText: "1.4 μW leak & spike-triggering",
    },
  };

  // Compute calculated metrics based on SNN configurations and selection
  const estimatedEnergyPerEvent =
    precision === "8bit" ? 25 : precision === "16bit" ? 55 : 4.5;
  const systemLeakage = 1.8 + (config.threshold < 15 ? 1.4 : 0.6);
  const totalPowerEst =
    (metrics.firingRateEEG + metrics.firingRateEMG) *
      (estimatedEnergyPerEvent * 1e-6) +
    systemLeakage;

  return (
    <div
      id="chip-architecture-section"
      className="bg-[#0b0c16]/90 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl text-gray-200 medical-glow-indigo"
    >
      {/* Title block */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-sans font-extrabold text-base text-gray-100 tracking-tight">
            Silicon Neuromorphic System
          </h3>
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
            Edge-Rehabilitation ASIC: "NeuroStroke Core V1"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ASIC BLOCK DIAGRAM VIEWPORT (Left 7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#04040a] rounded-xl p-4 border border-zinc-900 text-center relative overflow-hidden">
            <span className="absolute top-2.5 right-2.5 text-[8px] font-mono bg-violet-600/15 text-violet-350 px-2.5 py-1 rounded-md border border-violet-500/20 uppercase font-black tracking-widest">
              ASIC DIE LAYOUT MAP
            </span>
            <p className="text-[10px] text-zinc-500 font-mono uppercase text-left mb-4 tracking-wider">
              Select silicon pathway to examine clinical bio-logic:
            </p>

            {/* Interactive chip grid block */}
            <div className="space-y-4 max-w-md mx-auto my-6 font-mono text-xs">
              {/* Block 1: Bio-electric AFE */}
              <button
                onClick={() => setSelectedBlock("afe")}
                className={`w-full py-4 px-4 rounded-xl flex items-center justify-between border transition-all duration-300 text-left group cursor-pointer ${
                  selectedBlock === "afe"
                    ? "bg-cyan-500/10 border-cyan-500/70 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                    : "bg-zinc-950/60 border-zinc-900 hover:border-zinc-850 text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${selectedBlock === "afe" ? "bg-cyan-400" : "bg-gray-600"}`}
                  ></span>
                  <div>
                    <span className="font-bold block text-[10px] tracking-tight text-gray-100">
                      [BLOCK A] ANALOG FRONT END
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-tight">
                      Continuous Instrumentation & High CMRR Filter
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-zinc-500 group-hover:text-cyan-300 transition-all uppercase font-bold tracking-wider">
                  Explore &rarr;
                </span>
              </button>

              {/* Arrow linking */}
              <div className="h-4 w-px bg-zinc-800 mx-auto"></div>

              {/* Block 2: Delta Modulators */}
              <button
                onClick={() => setSelectedBlock("delta_mod")}
                className={`w-full py-4 px-4 rounded-xl flex items-center justify-between border transition-all duration-300 text-left group cursor-pointer ${
                  selectedBlock === "delta_mod"
                    ? "bg-emerald-500/10 border-emerald-500/70 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                    : "bg-zinc-950/60 border-zinc-900 hover:border-zinc-850 text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${selectedBlock === "delta_mod" ? "bg-emerald-400" : "bg-gray-600"}`}
                  ></span>
                  <div>
                    <span className="font-bold block text-[10px] tracking-tight text-gray-100">
                      [BLOCK B] SPIKE DELTA ENCODERS
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-tight">
                      Level-Crossing Event-Driven Converters
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-zinc-500 group-hover:text-emerald-300 transition-all uppercase font-bold tracking-wider">
                  Explore &rarr;
                </span>
              </button>

              {/* Arrow linking */}
              <div className="h-4 w-px bg-zinc-800 mx-auto"></div>

              {/* Dynamic twin core layout representation */}
              <div className="grid grid-cols-2 gap-4">
                {/* Block 3: Synapse Grid */}
                <button
                  onClick={() => setSelectedBlock("crossbar")}
                  className={`py-4 px-3.5 rounded-xl flex flex-col justify-between border transition-all duration-300 text-left group cursor-pointer ${
                    selectedBlock === "crossbar"
                      ? "bg-amber-500/10 border-amber-500/70 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                      : "bg-zinc-950/60 border-zinc-900 hover:border-zinc-850 text-zinc-400"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-bold block text-[9px] tracking-tight text-gray-150 uppercase">
                      [BLOCK C] SYNAPSE CELL
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase">
                      STDP Memory Cells
                    </span>
                  </div>
                  <span className="text-[9px] text-right mt-3 text-zinc-500 tracking-wider font-bold uppercase block w-full">
                    Explore &rarr;
                  </span>
                </button>

                {/* Block 4: Soma Integrator */}
                <button
                  onClick={() => setSelectedBlock("soma")}
                  className={`py-4 px-3.5 rounded-xl flex flex-col justify-between border transition-all duration-300 text-left group cursor-pointer ${
                    selectedBlock === "soma"
                      ? "bg-violet-500/10 border-violet-500/70 text-violet-200 shadow-[0_0_12px_rgba(168,85,247,0.1)]"
                      : "bg-zinc-950/60 border-zinc-900 hover:border-zinc-850 text-zinc-400"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-bold block text-[9px] tracking-tight text-gray-150 uppercase">
                      [BLOCK D] LIF SOMA ARRAY
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase">
                      Intention Decoder
                    </span>
                  </div>
                  <span className="text-[9px] text-right mt-3 text-zinc-500 tracking-wider font-bold uppercase block w-full">
                    Explore &rarr;
                  </span>
                </button>
              </div>
            </div>

            {/* MicroWatt energy callout */}
            <div className="mt-4 p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-900 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <Zap className="text-amber-400 w-4 h-4" />
                <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wide">
                  Continuous Edge Silicon Calculation:
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {totalPowerEst.toFixed(2)} μW
              </span>
            </div>
          </div>

          {/* SNN Delta Tuning panel */}
          <div className="p-5 bg-zinc-950/80 border border-zinc-900 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                <h4 className="font-sans font-extrabold text-xs text-gray-200 uppercase tracking-widest">
                  Electrode Delta Crossing Threshold
                </h4>
              </div>
              <HelpCircle
                className="w-3.5 h-3.5 text-zinc-500 cursor-help"
                title="Finer threshold increases sensitivity and firing rates, but too low can leak resting muscle micro-sparks."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[10px] font-mono">
              {/* EEG Delta */}
              <div className="space-y-2">
                <label className="text-zinc-500 font-mono uppercase flex justify-between tracking-wider font-bold">
                  <span>EEG Spike Trigger Delta</span>
                  <span className="text-cyan-400 font-bold">
                    {config.deltaThresholdEEG} uV
                  </span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="0.5"
                  value={config.deltaThresholdEEG}
                  onChange={(e) =>
                    onConfigChange({
                      ...config,
                      deltaThresholdEEG: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* EMG Delta */}
              <div className="space-y-2">
                <label className="text-zinc-500 font-mono uppercase flex justify-between tracking-wider font-bold">
                  <span>EMG Spike Trigger Delta</span>
                  <span className="text-amber-500 font-bold">
                    {config.deltaThresholdEMG} uV
                  </span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={config.deltaThresholdEMG}
                  onChange={(e) =>
                    onConfigChange({
                      ...config,
                      deltaThresholdEMG: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED DIAGNOSTIC CARDS (Right 5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Diagnostic specifications of clicked block */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 relative">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-purple-400">
              Silicon Block Specifications
            </h4>

            <div className="space-y-1">
              <h3 className="font-sans font-bold text-gray-100 text-base">
                {blocks[selectedBlock].title}
              </h3>
              <p className="text-gray-500 text-xs font-mono">
                {blocks[selectedBlock].sub}
              </p>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-gray-800/80">
              {blocks[selectedBlock].desc}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
              <div className="border border-gray-800 p-2.5 rounded-lg bg-black/20">
                <span className="text-gray-500 block text-[9px] uppercase">
                  Latency Contribution
                </span>
                <span className="font-bold text-gray-300 mt-1 block">
                  {blocks[selectedBlock].latencyText}
                </span>
              </div>
              <div className="border border-gray-800 p-2.5 rounded-lg bg-black/20">
                <span className="text-gray-500 block text-[9px] uppercase">
                  Allocated Bias Duty
                </span>
                <span className="font-bold text-emerald-400 mt-1 block">
                  {blocks[selectedBlock].powerText}
                </span>
              </div>
            </div>
          </div>

          {/* Chip Trade-Off Settings */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
              ASIC Memory Precision Preset
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPrecision("analog")}
                className={`py-2 px-3 rounded-lg border font-mono text-[11px] font-bold text-center transition-all ${
                  precision === "analog"
                    ? "bg-purple-950/40 border-purple-500 text-purple-300"
                    : "bg-black/40 border-gray-800 text-gray-500 hover:border-gray-700"
                }`}
              >
                Analog Memristor
              </button>
              <button
                onClick={() => setPrecision("8bit")}
                className={`py-2 px-3 rounded-lg border font-mono text-[11px] font-bold text-center transition-all ${
                  precision === "8bit"
                    ? "bg-purple-950/40 border-purple-500 text-purple-300"
                    : "bg-black/40 border-gray-800 text-gray-500 hover:border-gray-700"
                }`}
              >
                8-bit SRAM
              </button>
              <button
                onClick={() => setPrecision("16bit")}
                className={`py-2 px-3 rounded-lg border font-mono text-[11px] font-bold text-center transition-all ${
                  precision === "16bit"
                    ? "bg-purple-950/40 border-purple-500 text-purple-300"
                    : "bg-black/40 border-gray-800 text-gray-500 hover:border-gray-700"
                }`}
              >
                16-bit SRAM
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
                PRESCRIPTION TRADEOFF ANALYSIS:
              </p>

              {precision === "analog" && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-400">
                  <span className="font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> High-Density Analog
                    memristors
                  </span>
                  <p className="text-[11px] mt-1 text-gray-300leading-relaxed">
                    Using continuous thin-film HfOx memristors. Achieves
                    sub-nanosecond response and consumes only{" "}
                    <strong>4.5 pJ</strong> per synaptic spike. Extremely
                    power-efficient.
                  </p>
                </div>
              )}
              {precision === "8bit" && (
                <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg text-amber-500">
                  <span className="font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> 8-bit Integer SRAM Weights
                  </span>
                  <p className="text-[11px] mt-1 text-gray-300 leading-relaxed">
                    Standard integer precision on-chip. Introduces slight
                    rounding quantizations but offers robust static stability at{" "}
                    <strong>25 pJ</strong> per spike event.
                  </p>
                </div>
              )}
              {precision === "16bit" && (
                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400">
                  <span className="font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> 16-bit Float Fixed Weights
                  </span>
                  <p className="text-[11px] mt-1 text-gray-300 leading-relaxed">
                    High diagnostic precision, perfect matching index. However,
                    it increases total silicon leakage and synaptic energy costs
                    to <strong>55 pJ</strong> per spike.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
