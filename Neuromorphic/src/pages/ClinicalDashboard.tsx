import React from "react";
import { Patient, SNNConfig, SignalFrame, SimulationMetrics, CopilotMessage } from "../types";
import { PatientSelector } from "../components/PatientSelector";
import { BiosignalSourceManager } from "../components/BiosignalSourceManager";
import { DatasetModifier } from "../components/DatasetModifier";
import { MotorIntentPredictionPanel } from "../components/MotorIntentPredictionPanel";
import { LIFGraph } from "../components/LIFGraph";
import { RehabRecommendationPanel } from "../components/RehabRecommendationPanel";
import { CopilotPanel } from "../components/CopilotPanel";
import { ArrowDown } from "lucide-react";

interface ClinicalDashboardProps {
  selectedPatient: Patient;
  setSelectedPatient: (p: Patient) => void;
  snnConfig: SNNConfig;
  setSnnConfig: (c: SNNConfig) => void;
  frames: SignalFrame[];
  state: "resting" | "intent";
  setState: (s: "resting" | "intent") => void;
  sourceMode: "internal" | "benchmark" | "upload" | "microphone";
  setSourceMode: (m: "internal" | "benchmark" | "upload" | "microphone") => void;
  setDatasetVersion: (v: (prev: number) => number) => void;
  metrics: SimulationMetrics;
  messages: CopilotMessage[];
  handleSendMessage: (text: string) => void;
  isSending: boolean;
  generateSyntheticWaveform: (p: Patient, intent: string) => void;
  isGeneratingSynthetic: boolean;
  syntheticNotes: string;
  handleInjectExternalFrame: (f: SignalFrame) => void;
  toggleMotorIntent: () => void;
  setActiveTab: (tab: "clinical" | "neuromorphic" | "hackathon") => void;
}

export const ClinicalDashboard: React.FC<ClinicalDashboardProps> = ({
  selectedPatient,
  setSelectedPatient,
  snnConfig,
  setSnnConfig,
  frames,
  state,
  setState,
  sourceMode,
  setSourceMode,
  setDatasetVersion,
  metrics,
  messages,
  handleSendMessage,
  isSending,
  generateSyntheticWaveform,
  isGeneratingSynthetic,
  syntheticNotes,
  handleInjectExternalFrame,
  toggleMotorIntent,
  setActiveTab,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 space-y-8">
        <PatientSelector
          selectedPatient={selectedPatient}
          onSelectPatient={(p) => {
            setSelectedPatient(p);
          }}
          onUpdatePatient={setSelectedPatient}
          generateSyntheticWaveform={generateSyntheticWaveform}
          isGeneratingSynthetic={isGeneratingSynthetic}
          syntheticNotes={syntheticNotes}
        />

        <BiosignalSourceManager
          onInjectExternalFrame={handleInjectExternalFrame}
          selectedPatient={selectedPatient}
          snnConfig={snnConfig}
          isActive={state === "intent"}
          onSetState={setState}
          sourceMode={sourceMode}
          onSourceModeChange={setSourceMode}
        />

        <DatasetModifier
          onDatasetReloaded={() => {
            setDatasetVersion((prev) => prev + 1);
          }}
        />

        <MotorIntentPredictionPanel
          frames={frames}
          patient={selectedPatient}
          state={state}
        />

        <div className="bg-gradient-to-r from-purple-950/40 via-black to-cyan-950/40 border border-purple-900/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-1.5 text-left max-w-lg">
            <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest block leading-none">Spiking Neural Translation Engine</span>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              The clinical database collected above is converted in real-time into sub-millisecond asynchronous binary event spikes inside the Neuromorphic Core processing layer.
            </p>
          </div>
          <button
            id="process-to-core-cta"
            onClick={() => setActiveTab("neuromorphic")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-sans font-black text-xs tracking-wider uppercase hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.45)] flex items-center gap-2 shrink-0 group cursor-pointer active:scale-95"
          >
            Process Through Neuromorphic Core
            <ArrowDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-8">
        <LIFGraph
          frames={frames}
          config={snnConfig}
          isActive={state === "intent"}
          state={state}
          patient={selectedPatient}
          mode="analog-only"
        />

        <RehabRecommendationPanel 
          patient={selectedPatient}
          motorIntentConfidence={state === "intent" ? 0.82 : 0.05}
          avgEEG={metrics.firingRateEEG}
          avgEMG={metrics.firingRateEMG}
          spikeRate={metrics.snnSpikeCount}
          recoveryProgress={72}
        />

        <CopilotPanel
          patient={selectedPatient}
          config={snnConfig}
          metrics={metrics}
          messages={messages}
          onSendMessage={handleSendMessage}
          isSending={isSending}
        />
      </div>
    </div>
  );
};
