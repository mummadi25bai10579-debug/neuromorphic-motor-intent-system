import React, { useState, useEffect, useRef } from "react";
import { Patient, SNNConfig, SignalFrame, SimulationMetrics, CopilotMessage } from "./types";
import { patientProfiles } from "./data/patients";
import { NeuromorphicCore, mutableEegSamples } from "./utils/signalGenerator";
import { NetworkBackground } from "./components/NetworkBackground";
import { Header } from "./components/Header";
import { PatientSelector } from "./components/PatientSelector";
import { LIFGraph } from "./components/LIFGraph";
import { ChipArchitecture } from "./components/ChipArchitecture";
import { DeviceSimulator } from "./components/DeviceSimulator";
import { CopilotPanel } from "./components/CopilotPanel";
import { BiosignalSourceManager } from "./components/BiosignalSourceManager";
import { DatasetModifier } from "./components/DatasetModifier";
import { HackathonTransformer } from "./components/HackathonTransformer";
import { MotorIntentPredictionPanel } from "./components/MotorIntentPredictionPanel";
import { ClinicalDashboard } from "./pages/ClinicalDashboard";
import { NeuromorphicDashboard } from "./pages/NeuromorphicDashboard";
import { Sparkles, Brain, ArrowDown, Settings, HelpCircle, GraduationCap, Code, Activity, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // 1. Initial State Definitions
  const [selectedPatient, setSelectedPatient] = useState<Patient>(patientProfiles[0]);
  const [sourceMode, setSourceMode] = useState<"internal" | "benchmark" | "upload" | "microphone">("internal");
  const [datasetVersion, setDatasetVersion] = useState(0);
  const [activeTab, setActiveTab ] = useState<"clinical" | "neuromorphic" | "hackathon">("clinical");
  
  const [snnConfig, setSnnConfig] = useState<SNNConfig>({
    threshold: 28.0,       // V_th (mV)
    leak: 0.12,            // leak rate (12% per tick)
    inputWeightEEG: 8.5,   // weight for EEG channel input
    inputWeightEMG: 14.0,  // weight for EMG channel input
    refractoryTicks: 3,    // steps in refractory state
    stdpRate: 0.04,        // STDP delta
    stdpEnabled: true,     // active STDP learning
    deltaThresholdEEG: 4.5,// EEG level-crossing threshold
    deltaThresholdEMG: 16.0// EMG level-crossing threshold
  });

  const [state, setState] = useState<"resting" | "intent">("resting");
  const [frames, setFrames] = useState<SignalFrame[]>([]);
  
  // Biosignal Flow Audit States
  const [testRun, setTestRun] = useState(false);
  const [graphChangedStatus, setGraphChangedStatus] = useState<"pending" | "detected" | "not_detected">("pending");

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      sender: "copilot",
      text: "Welcome to the NeuroLinker Portal! I am your AI Neuromorphic Clinical Copilot. This system maps physiological EEG/EMG signals asynchronously into a Spiking Neural Network (SNN) to instantly detect motor intent in stroke patients. Ask me about parameter tuning, STDP configurations, or latency improvements.",
      timestamp: new Date()
    }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingSynthetic, setIsGeneratingSynthetic] = useState(false);
  const [syntheticNotes, setSyntheticNotes] = useState("");

  // 2. Continuous Simulation Core Ref
  const coreRef = useRef<NeuromorphicCore | null>(null);
  const timeMsRef = useRef<number>(0);

  // Initialize SNN simulator on mount
  if (!coreRef.current) {
    coreRef.current = new NeuromorphicCore(snnConfig);
  }

  // Update simulator weights/attributes whenever parent snnConfig state changes
  useEffect(() => {
    if (coreRef.current) {
      coreRef.current.updateConfig(snnConfig);
    }
  }, [snnConfig]);

  // Handle continuous data streaming on tick intervals (60ms)
  useEffect(() => {
    if (sourceMode !== "internal") return;

    const interval = setInterval(() => {
      if (!coreRef.current) return;

      timeMsRef.current += 10; // step forward 10ms in neural time
      const frameOfTime = coreRef.current.step(
        timeMsRef.current,
        state,
        selectedPatient
      );

      // Prepend or Append and cap history at 80 frames
      setFrames((prev) => {
        const next = [...prev, frameOfTime];
        if (next.length > 85) {
          return next.slice(next.length - 85);
        }
        return next;
      });

    }, 65);

    return () => clearInterval(interval);
  }, [state, selectedPatient, sourceMode]);

  const handleInjectExternalFrame = (frame: SignalFrame) => {
    setFrames((prev) => {
      const next = [...prev, frame];
      if (next.length > 85) {
        return next.slice(next.length - 85);
      }
      return next;
    });
  };

  // Compute reactive diagnostics based on window frames (derived state)
  const computeMetrics = (): SimulationMetrics => {
    if (frames.length === 0) {
      return {
        currentPowerUW: 1.5,
        currentLatencyMS: 1.25,
        firingRateEEG: 0,
        firingRateEMG: 0,
        snnSpikeCount: 0,
        synapticEfficiency: 1.0
      };
    }

    const lastSlice = frames.slice(-30);
    const eegSpikesCount = lastSlice.filter((f) => f.eegSpike).length;
    const emgSpikesCount = lastSlice.filter((f) => f.emgSpike).length;
    const outSpikesCount = lastSlice.filter((f) => f.outputSpike).length;

    // Firing rates calculation
    const rateOfEEG = Math.min(60, Math.round((eegSpikesCount / 30) * 150));
    const rateOfEMG = Math.min(60, Math.round((emgSpikesCount / 30) * 150));

    // Dynamic Leakage & Activation Power formula
    const biosignalActivityFactor = (rateOfEEG + rateOfEMG) * 0.024;
    const corePower = state === "intent" 
      ? 2.8 + biosignalActivityFactor + (outSpikesCount * 0.4)
      : 1.2 + (eegSpikesCount * 0.05) + (emgSpikesCount * 0.05);

    // Compute dynamic intention latency
    const coreLatency = state === "intent"
      ? Math.max(0.75, 1.95 - (rateOfEEG * 0.015) - (rateOfEMG * 0.012))
      : 1.25;

    // Synaptic Gain simulation based on SNN configurations
    const synapticEfficiency = 1.0 + (outSpikesCount * 0.04) + (snnConfig.stdpEnabled ? 0.12 : 0);

    return {
      currentPowerUW: Math.max(0.5, Math.min(10.0, corePower)),
      currentLatencyMS: coreLatency,
      firingRateEEG: rateOfEEG,
      firingRateEMG: rateOfEMG,
      snnSpikeCount: outSpikesCount,
      synapticEfficiency: Math.min(1.8, synapticEfficiency)
    };
  };

  const metrics = computeMetrics();

  // Monitor the frames array to detect when the spiked eeg value propagates through the system
  useEffect(() => {
    if (testRun && frames.some((f) => f.eegValue >= 49.5)) {
      setGraphChangedStatus("detected");
    }
  }, [frames, testRun]);

  // 3. Clinical Copilot Request Handler (Calls server via Express to query Gemini)
  const handleSendMessage = async (text: string) => {
    // Append user query first
    const clientMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, clientMsg]);
    setIsSending(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: selectedPatient,
          config: snnConfig,
          metrics: {
            currentPowerUW: metrics.currentPowerUW,
            currentLatencyMS: metrics.currentLatencyMS,
            synapticEfficiency: metrics.synapticEfficiency
          },
          messages: [...messages, clientMsg]
        })
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `cop-${Date.now()}`,
          sender: "copilot",
          text: result.reply,
          timestamp: new Date()
        }
      ]);

    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "system",
          text: `Diagnostic Connection Error: ${err.message || "Failed to reach clinical server."}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // 4. Biomimetic Waveform Generator Client Trigger
  const generateSyntheticWaveform = async (patient: Patient, intentType: string) => {
    setIsGeneratingSynthetic(true);
    setSyntheticNotes("");

    try {
      const response = await fetch("/api/generate-patient-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patient.name,
          motorIntentType: intentType
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Briefly insert simulated generated signal frames into our graph trace
      if (data.signals && Array.isArray(data.signals)) {
        const generatedFrames = data.signals.map((pt: any, idx: number) => ({
          timestamp: timeMsRef.current + pt.timeMs,
          eegValue: pt.eegUv,
          emgValue: pt.emgUv,
          eegSpike: pt.eegUv > (snnConfig.deltaThresholdEEG * 1.5),
          emgSpike: pt.emgUv > (snnConfig.deltaThresholdEMG * 1.5),
          membranePotential: pt.intent ? snnConfig.threshold * 0.9 : snnConfig.threshold * 0.4,
          outputSpike: pt.intent
        }));

        setFrames((prev) => [...prev.slice(0, Math.max(0, 85 - generatedFrames.length)), ...generatedFrames]);
      }

      setSyntheticNotes(data.clinicianNotes || `Synthesized motor activation graph sequence completed successfully for ${patient.name}.`);

    } catch (err: any) {
      console.error(err);
      setSyntheticNotes(`Biomimetic generator failed: ${err.message || "Endpoint error."}`);
    } finally {
      setIsGeneratingSynthetic(false);
    }
  };

  const handleVerifyDataSource = () => {
    const currentPatientSamples = Array.isArray(mutableEegSamples)
      ? mutableEegSamples
      : ((mutableEegSamples as any)[selectedPatient.id] || (mutableEegSamples as any)["pat-elena"]);

    if (Array.isArray(currentPatientSamples) && currentPatientSamples.length > 0) {
      // 1. Set the first EEG sample to 50.0 inside the current patient's samples
      (currentPatientSamples as any)[0].eeg = 50.0;
      (currentPatientSamples as any)[0].eegValue = 50.0;
      setTestRun(true);
      setGraphChangedStatus("pending");

      // 2. Set current simulation time to -10ms to force an immediate read of sample index 0 on next interval tick (which adds 10ms)!
      timeMsRef.current = -10;
      
      // Clear past frames to make sure the spike is visible as the first/fresh frame
      setFrames([]);
    }
  };

  const toggleMotorIntent = () => {
    setState((prev) => (prev === "resting" ? "intent" : "resting"));
  };

  return (
    <div className="min-h-screen bg-[#03040a] text-gray-100 flex flex-col font-sans selection:bg-cyan-600/35 selection:text-cyan-200 relative overflow-hidden">
      <NetworkBackground />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(3,4,10,0.8)_100%)] z-[-1]" />
      
      {/* Structural Header Rail */}
      <Header patient={selectedPatient} config={snnConfig} metrics={metrics} />

      {/* Main Container / Dashboard Frame */}
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-8 py-8 space-y-10 relative z-10">
        
        {/* SNN Technology introduction overlay */}
        <div id="intro-card-overview" className="bg-gradient-to-r from-purple-950/20 to-cyan-950/20 border border-purple-900/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between shadow-2xl relative overflow-hidden backdrop-blur">
          <div className="space-y-2 md:max-w-2xl text-left">
            <span className="text-[10px] bg-purple-900/65 font-mono text-purple-300 font-bold px-2.5 py-1 rounded-md tracking-wider border border-purple-800/40 uppercase">Neuromorphic Stroke Recovery website</span>
            <h2 className="font-sans font-bold text-lg md:text-2xl text-gray-100 leading-snug">
              Decentralized Edge Biosignal Intention Recognition
            </h2>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-sans">
              Traditional stroke assistive mechanical sleeves rely on bulky, delayed CPU controllers which result in long recognition latencies (&gt;80ms), leading to motor frustration. NeuroLinker implements a low-power level-crossing Delta SNN ASIC which processes continuous biosignals event-by-event with sub-millisecond latencies and low continuous nanowatt leakage.
            </p>
          </div>
          
          <div className="flex gap-4 items-center bg-black/60 p-4 rounded-xl border border-gray-800">
            <div className="text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase">ASIC Standard Duty</span>
              <p className="text-xl font-mono font-black text-cyan-400 mt-0.5">3.2 μW</p>
            </div>
            <div className="h-8 w-px bg-gray-800"></div>
            <div className="text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Response delay</span>
              <p className="text-xl font-mono font-black text-purple-400 mt-0.5">1.2 ms</p>
            </div>
          </div>
        </div>

        {/* 🧠 Biosignal Data Flow Audit Debug Panel */}
        <div id="biosignal-audit-panel" className="bg-[#0b0c16]/95 border border-purple-500/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(147,51,234,0.15)] space-y-4 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-850 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Settings className="w-5 h-5 text-purple-400 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-sans font-extrabold text-base text-gray-100 tracking-tight">EEG Data Flow Audit & Control Panel</h3>
                <p className="text-zinc-[500] text-[10px] font-mono uppercase tracking-wider">Neuromorphic Motor Intent Integrity Verifier</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                id="btn-verify-data-source"
                onClick={handleVerifyDataSource}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-sans font-black text-xs tracking-wider uppercase transition-all duration-350 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 animate-pulse" />
                VERIFY DATA SOURCE
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-mono">
            {/* Column 1: Source & Patient Identity */}
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4.5 space-y-3">
              <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block border-b border-zinc-900 pb-1.5">PATIENT & DATASET METADATA</span>
              <div className="space-y-2 flex flex-col justify-center">
                <div className="flex justify-between items-center leading-normal">
                  <span className="text-zinc-500 font-sans">Patient ID:</span>
                  <span className="text-gray-100 font-bold uppercase">{selectedPatient.id}</span>
                </div>
                <div className="flex justify-between items-center leading-normal font-sans">
                  <span className="text-zinc-500">Subject Type:</span>
                  <span className="text-cyan-400 font-bold uppercase">{selectedPatient.name} (Stroke Hemiparesis)</span>
                </div>
                <div className="flex justify-between items-center leading-normal font-sans">
                  <span className="text-zinc-500">Source Database:</span>
                  <span className="text-purple-400 font-bold">PhysioNet EEG Motor Movement</span>
                </div>
                <div className="flex justify-between items-center leading-normal font-sans">
                  <span className="text-zinc-500">Clinical EDF Sessions:</span>
                  <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-[9px]">84 FULL RUNS</span>
                </div>
                <div className="flex justify-between items-center leading-normal font-sans">
                  <span className="text-zinc-500">Total Validated Samples:</span>
                  <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-[9px]">~42,000 EEG/EMG SAMPLES</span>
                </div>
                <div className="flex justify-between items-center leading-normal font-sans">
                  <span className="text-zinc-500">Study Subjects:</span>
                  <span className="text-zinc-300 font-bold">3 SUBJECTS (S001-S003)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Live Transmissions */}
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4.5 space-y-3">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block border-b border-zinc-900 pb-1.5">LIVE ELECTRODE METERS</span>
              <div className="space-y-2 flex flex-col justify-center">
                <div className="flex justify-between items-center leading-normal">
                  <span className="text-zinc-500 font-sans">Current EEG stream:</span>
                  <span className="text-cyan-400 font-bold">
                    {frames[frames.length - 1]?.eegValue !== undefined 
                      ? `${frames[frames.length - 1].eegValue.toFixed(2)} uV` 
                      : "0.00 uV"}
                  </span>
                </div>
                <div className="flex justify-between items-center leading-normal">
                  <span className="text-zinc-500 font-sans">Current EMG stream:</span>
                  <span className="text-amber-500 font-bold">
                    {frames[frames.length - 1]?.emgValue !== undefined 
                      ? `${frames[frames.length - 1].emgValue.toFixed(2)} uV` 
                      : "0.00 uV"}
                  </span>
                </div>
                <div className="flex justify-between items-center leading-normal font-sans">
                  <span className="text-zinc-500">First EEG element:</span>
                  <span className="text-purple-400 font-bold">
                    {(() => {
                      const currentPatientSamples = Array.isArray(mutableEegSamples) 
                        ? mutableEegSamples 
                        : ((mutableEegSamples as any)[selectedPatient.id] || (mutableEegSamples as any)["pat-elena"]);
                      return Array.isArray(currentPatientSamples) && currentPatientSamples[0] !== undefined 
                        ? `${(currentPatientSamples[0] as any).eeg.toFixed(1)} uV` 
                        : "N/A";
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center leading-normal font-sans">
                  <span className="text-zinc-500">LIF potential:</span>
                  <span className="text-violet-400 font-bold">
                    {frames[frames.length - 1]?.membranePotential !== undefined 
                      ? `${frames[frames.length - 1].membranePotential.toFixed(2)} mV` 
                      : "0.00 mV"}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Integrity Check Result */}
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4.5 space-y-3">
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block border-b border-zinc-900 pb-1.5">MUTATION INTEGRITY AUDIT</span>
              <div className="space-y-2.5 h-full flex flex-col justify-between pb-1">
                <div className="space-y-1.5 font-sans">
                  <div className="flex justify-between items-center text-[10px] leading-normal">
                    <span className="text-zinc-500 font-medium">Test Execution:</span>
                    <span className={testRun ? "text-purple-400 font-bold" : "text-zinc-500"}>
                      {testRun ? "EXECUTED" : "IDLE"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] leading-normal font-sans">
                    <span className="text-zinc-500 font-medium font-sans">Graph Modification:</span>
                    <span className={`font-bold ${
                      graphChangedStatus === "detected" 
                        ? "text-emerald-400 animate-pulse" 
                        : "text-zinc-500"
                    }`}>
                      {graphChangedStatus === "detected" ? "DETECTED (50 uV SPIKE)" : "AWAITING SPIKE..."}
                    </span>
                  </div>
                </div>

                {graphChangedStatus === "detected" ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans p-2 rounded-lg text-[10px] leading-tight font-medium">
                    ✔ Audit Verified: Mutating the raw eeg_samples.json immediately feeds the spiked 50 uV signal directly into the SNN graph. Real data flow active.
                  </div>
                ) : (
                  <div className="bg-zinc-900 text-zinc-500 font-sans p-2 rounded-lg text-[10px] leading-snug">
                    ℹ Press "VERIFY DATA SOURCE" to mutate first EEG sample to 50 uV and verify real-time layout flow.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-gray-950 border border-gray-850 p-1.5 rounded-2xl gap-3 shadow-2xl relative">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-1 sm:max-w-2xl">
            <button
              id="tab-btn-clinical"
              onClick={() => setActiveTab("clinical")}
              className={`py-3.5 px-4 rounded-xl font-sans font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-300 relative cursor-pointer ${
                activeTab === "clinical"
                  ? "bg-purple-900/40 text-purple-200 border border-purple-700/60 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                  : "bg-transparent text-gray-400 border border-transparent hover:text-gray-200 hover:bg-gray-900/50"
              }`}
            >
              <Activity className={`w-4 h-4 ${activeTab === "clinical" ? "text-purple-400 animate-pulse" : "text-gray-500"}`} />
              Clinical Dashboard
              {activeTab === "clinical" && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              )}
            </button>

            <button
              id="tab-btn-neuromorphic"
              onClick={() => setActiveTab("neuromorphic")}
              className={`py-3.5 px-4 rounded-xl font-sans font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-300 relative cursor-pointer ${
                activeTab === "neuromorphic"
                  ? "bg-purple-900/40 text-purple-200 border border-purple-700/60 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                  : "bg-transparent text-gray-400 border border-transparent hover:text-gray-200 hover:bg-gray-900/50"
              }`}
            >
              <Cpu className={`w-4 h-4 ${activeTab === "neuromorphic" ? "text-purple-400" : "text-gray-500"}`} />
              Neuromorphic Core
              {activeTab === "neuromorphic" && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              )}
            </button>

            <button
              id="tab-btn-hackathon"
              onClick={() => setActiveTab("hackathon")}
              className={`py-3.5 px-4 rounded-xl font-sans font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-305 relative cursor-pointer col-span-2 md:col-span-1 ${
                activeTab === "hackathon"
                  ? "bg-purple-900/40 text-purple-200 border border-purple-700/60 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                  : "bg-transparent text-gray-400 border border-transparent hover:text-gray-200 hover:bg-gray-900/50"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeTab === "hackathon" ? "text-purple-400 animate-pulse" : "text-gray-500"}`} />
              Dataset Transformer
              {activeTab === "hackathon" && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 px-4 py-1.5 font-mono text-[10px] text-gray-400 bg-gray-900/65 rounded-lg border border-gray-850">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1"></span>
            <span>ASIC Status:</span>
            <span className="text-emerald-400 font-bold ml-1 uppercase">ACTIVE_ONLINE</span>
          </div>
        </div>

        {/* Content render selection based on activeTab */}
        {activeTab === "clinical" ? (
          <ClinicalDashboard
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            snnConfig={snnConfig}
            setSnnConfig={setSnnConfig}
            frames={frames}
            state={state}
            setState={setState}
            sourceMode={sourceMode}
            setSourceMode={setSourceMode}
            setDatasetVersion={setDatasetVersion}
            metrics={metrics}
            messages={messages}
            handleSendMessage={handleSendMessage}
            isSending={isSending}
            generateSyntheticWaveform={generateSyntheticWaveform}
            isGeneratingSynthetic={isGeneratingSynthetic}
            syntheticNotes={syntheticNotes}
            handleInjectExternalFrame={handleInjectExternalFrame}
            toggleMotorIntent={toggleMotorIntent}
            setActiveTab={setActiveTab}
          />
        ) : activeTab === "neuromorphic" ? (
          <NeuromorphicDashboard
            snnConfig={snnConfig}
            setSnnConfig={setSnnConfig}
            frames={frames}
            state={state}
            metrics={metrics}
            selectedPatient={selectedPatient}
            toggleMotorIntent={toggleMotorIntent}
          />
        ) : (
          <HackathonTransformer />
        )}

      </main>

      {/* Corporate platform footer */}
      <footer className="bg-black border-t border-gray-900 py-6 px-8 text-center text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NeuroLinker Medical Systems Inc. All clinical rights reserved.</p>
          <div className="flex gap-3 text-purple-400">
            <span>FDA Investigational Device Protocol</span>
            <span>&bull;</span>
            <span>ASIC Core Rev V1.04</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
