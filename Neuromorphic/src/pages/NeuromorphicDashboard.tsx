import React from "react";
import { Patient, SNNConfig, SignalFrame, SimulationMetrics } from "../types";
import { ChipArchitecture } from "../components/ChipArchitecture";
import { LIFGraph } from "../components/LIFGraph";
import { DeviceSimulator } from "../components/DeviceSimulator";
import { GraduationCap } from "lucide-react";

interface NeuromorphicDashboardProps {
  snnConfig: SNNConfig;
  setSnnConfig: (c: SNNConfig) => void;
  frames: SignalFrame[];
  state: "resting" | "intent";
  metrics: SimulationMetrics;
  selectedPatient: Patient;
  toggleMotorIntent: () => void;
}

export const NeuromorphicDashboard: React.FC<NeuromorphicDashboardProps> = ({
  snnConfig,
  setSnnConfig,
  frames,
  state,
  metrics,
  selectedPatient,
  toggleMotorIntent,
}) => {
  return (
    <div className="space-y-8">
      {/* High-Tech Horizontal Signal Flow Mapping Diagram */}
      <div className="bg-gray-950/60 border border-gray-850 rounded-2xl p-6 shadow-2xl space-y-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 block leading-none">REHABLITATION SYSTEM TOPOLOGY</span>
          <h4 className="font-sans font-bold text-gray-200 text-sm mt-1.5">Edge-Directed Neuromorphic Translation Pipeline</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-stretch text-left font-mono text-[10px]">
          <div className="bg-gray-900/60 border border-gray-800/80 p-3.5 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-cyan-400 font-bold block mb-1">01. ANALOG EEG SOURCE</span>
              <p className="text-gray-400 text-[9px] font-sans leading-relaxed">Continuous patient motor brainwaves recorded via non-invasive cortex headband feed.</p>
            </div>
            <span className="text-[9px] text-gray-500 font-mono italic mt-2 uppercase">10Hz Mu Wave</span>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/80 p-3.5 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-emerald-400 font-bold block mb-1">02. SPIKE DELTA ENCODER</span>
              <p className="text-gray-400 text-[9px] font-sans leading-relaxed">Level-crossing threshold crossings emit discrete event spikes, saving 90% power load.</p>
            </div>
            <span className="text-[9px] text-emerald-500/80 font-mono italic mt-2 uppercase">Voltage Crossing</span>
          </div>
          <div className="bg-purple-950/20 border border-purple-900/40 p-3.5 rounded-xl flex flex-col justify-between shadow-[0_0_10px_rgba(168,85,247,0.05)]">
            <div>
              <span className="text-[9px] text-purple-400 font-bold block mb-1">03. SNN LIF NEURON</span>
              <p className="text-gray-400 text-[9px] font-sans leading-relaxed">Leaky integrate-and-fire soma integrates input spikes. Integrates, leaks over time, and fires.</p>
            </div>
            <span className="text-[9px] text-purple-400 font-mono italic mt-2 uppercase">Vm Potential</span>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/80 p-3.5 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-red-400 font-bold block mb-1">04. CLASSIFIED INTENT</span>
              <p className="text-gray-400 text-[9px] font-sans leading-relaxed">Sustained firing triggers bionic intent activation command within sub-millisecond speeds.</p>
            </div>
            <span className="text-[9px] text-red-400/80 font-mono italic mt-2 uppercase">Soma Command</span>
          </div>
          <div className="bg-amber-950/20 border border-amber-900/40 p-3.5 rounded-xl flex flex-col justify-between shadow-[0_0_12px_rgba(245,158,11,0.05)]">
            <div>
              <span className="text-[9px] text-amber-500 font-bold block mb-1">05. PATIENT ACTUATION</span>
              <p className="text-gray-300 text-[9px] font-sans leading-relaxed">Asynchronous pulse triggers mechanical exoskeleton sleeve to active-grip patient hand.</p>
            </div>
            <span className="text-[9px] text-amber-500 font-mono italic mt-2 uppercase">Assisted Flexion</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          <ChipArchitecture
            config={snnConfig}
            metrics={metrics}
            onConfigChange={setSnnConfig}
          />
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-sans font-bold text-sm text-gray-200 flex items-center gap-2">
              <GraduationCap className="text-purple-400 w-5 h-5" /> Neuromorphic Stroke Rehab Glossary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <strong className="text-purple-400 font-mono text-[11px] block">Mu-Rhythm Desynchronization (ERD)</strong>
                <p className="text-gray-400 leading-normal text-xs"> resting state features prominent 10Hz motor-cortex brainwaves. Suppressed amplitudes drop when attempting physical grasp. Ideal trigger threshold.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-cyan-400 font-mono text-[11px] block">Level-Crossing Delta Modulator</strong>
                <p className="text-gray-400 leading-normal text-xs">Replaces high-power ADCs by transmitting an asynchronous spike pulse ONLY when raw bio-voltages spike over Δ_th, saving substantial continuous power.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-amber-500 font-mono text-[11px] block">Spike-Timing-Dependent Plasticity</strong>
                <p className="text-gray-400 leading-normal text-xs">Biomimetic on-chip learning rate. Strengthens weights when inputs fire before output triggers, automatically compensating for neural stroke deficits over hours of active training.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-red-400 font-mono text-[11px] block">Functional Electrical Stimulation (FES)</strong>
                <p className="text-gray-400 leading-normal text-xs">Timed electrical impulses sent directly into physical muscles to stimulate forearm motor neurons, enabling hand wrist dorsiflexion immediately.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 space-y-8">
          <LIFGraph
            frames={frames}
            config={snnConfig}
            isActive={state === "intent"}
            state={state}
            patient={selectedPatient}
            mode="neuromorphic-only"
          />
          <DeviceSimulator
            frames={frames}
            metrics={metrics}
            patient={selectedPatient}
            state={state}
            toggleMotorIntent={toggleMotorIntent}
          />
        </div>
      </div>
    </div>
  );
};
