import React, { useState } from "react";
import { Patient } from "../types";
import { patientProfiles } from "../data/patients";
import {
  User,
  Activity,
  Plus,
  BrainCircuit,
  HeartHandshake,
  EyeOff,
  Clipboard,
  Sparkles,
} from "lucide-react";

interface PatientSelectorProps {
  selectedPatient: Patient;
  onSelectPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  generateSyntheticWaveform: (patient: Patient, intentType: string) => void;
  isGeneratingSynthetic: boolean;
  syntheticNotes: string;
}

export function PatientSelector({
  selectedPatient,
  onSelectPatient,
  onUpdatePatient,
  generateSyntheticWaveform,
  isGeneratingSynthetic,
  syntheticNotes,
}: PatientSelectorProps) {
  const [showCreator, setShowCreator] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: "Custom Patient Alpha",
    age: 55,
    condition: "Active Stroke Recovery Level 3",
    onset: "4 months post-stroke",
    affectedSide: "Right",
    baselineMu: 16.0,
    activeMu: 8.0,
    baselineEMG: 5.0,
    activeEMG: 100.0,
    rehabGoal: "Restoring active grasp reflexes",
    notes:
      "Custom parameters calibrated for experimental neuromorphic evaluation.",
  });

  const handleCreatePatient = () => {
    if (!newPatient.name) return;
    const constructed: Patient = {
      id: `pat-custom-${Date.now()}`,
      name: newPatient.name,
      age: newPatient.age || 60,
      condition: newPatient.condition || "Moderate Stroke Recovery",
      onset: newPatient.onset || "Unknown",
      affectedSide: newPatient.affectedSide || "Left",
      baselineMu: newPatient.baselineMu || 15.0,
      activeMu: newPatient.activeMu || 6.0,
      baselineEMG: newPatient.baselineEMG || 5.0,
      activeEMG: newPatient.activeEMG || 100.0,
      rehabGoal: newPatient.rehabGoal || "Restore finger motor flexion",
      notes: newPatient.notes || "Custom patient profile.",
    };
    onSelectPatient(constructed);
    setShowCreator(false);
  };

  return (
    <div className="bg-[#03040a]/80 backdrop-blur-3xl border border-cyan-500/20 rounded-[32px] p-8 shadow-[0_0_50px_rgba(6,182,212,0.05)] space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-3/4 h-full bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.05)_0%,transparent_50%)] pointer-events-none" />

      {/* Target heading */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-black text-lg text-gray-100 tracking-tight">
              Physiological Case Registry
            </h3>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.15em] mt-0.5">
              Patient Biosignal Matching Index
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreator(!showCreator)}
          className="flex items-center gap-2 text-[10px] font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 py-2.5 px-4 rounded-xl border border-cyan-500/30 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        >
          <Plus className="w-3.5 h-3.5" />
          REGISTRY NEW CASE
        </button>
      </div>

      {/* Patient case list selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        {patientProfiles.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPatient(p)}
            className={`p-5 rounded-2xl text-left border transition-all duration-300 relative overflow-hidden cursor-pointer ${
              selectedPatient.id === p.id
                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-100 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]"
                : "bg-zinc-900/40 border-white/5 hover:border-white/10 text-zinc-400 hover:bg-zinc-800/40"
            }`}
          >
            {selectedPatient.id === p.id && (
              <span className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] !rotate-45 translate-x-4 -translate-y-4"></span>
            )}
            <p
              className={`font-black text-sm ${selectedPatient.id === p.id ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "text-gray-200"}`}
            >
              {p.name}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-1 tracking-tight uppercase line-clamp-1">
              {p.condition}
            </p>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-[9px] text-zinc-500 font-mono font-bold tracking-widest">
              <span>AGE: {p.age}</span>
              <span>SIDE: {p.affectedSide.toUpperCase()}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Patient Creator Form */}
      {showCreator && (
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-5 space-y-4 shadow-inner">
          <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4" /> Instantiate Experimental Case
            File
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-mono">
            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase">Patient Name</label>
              <input
                type="text"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 text-gray-200 outline-none focus:border-cyan-500 text-xs"
                value={newPatient.name}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase">
                Pathological Condition
              </label>
              <input
                type="text"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 text-gray-200 outline-none focus:border-cyan-500 text-xs"
                value={newPatient.condition}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, condition: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase">Onset Duration</label>
              <input
                type="text"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 text-gray-200 outline-none focus:border-cyan-500 text-xs"
                value={newPatient.onset}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, onset: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase">
                Affected Hemiparetic Side
              </label>
              <select
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 text-gray-200 outline-none focus:border-cyan-500 text-xs cursor-pointer"
                value={newPatient.affectedSide}
                onChange={(e) =>
                  setNewPatient({
                    ...newPatient,
                    affectedSide: e.target.value as any,
                  })
                }
              >
                <option value="Left">Left Side Hemiparesis</option>
                <option value="Right">Right Side Hemiparesis</option>
                <option value="Bilateral">Bilateral Paralysis</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase">
                Resting Mu rhythm (uV)
              </label>
              <input
                type="number"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 text-gray-200 outline-none text-xs"
                value={newPatient.baselineMu}
                onChange={(e) =>
                  setNewPatient({
                    ...newPatient,
                    baselineMu: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase">
                Resting EMG noise (uV)
              </label>
              <input
                type="number"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 text-gray-200 outline-none text-xs"
                value={newPatient.baselineEMG}
                onChange={(e) =>
                  setNewPatient({
                    ...newPatient,
                    baselineEMG: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setShowCreator(false)}
              className="py-1.5 px-3.5 bg-zinc-900 text-zinc-500 hover:text-zinc-450 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleCreatePatient}
              className="py-1.5 px-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-mono font-bold cursor-pointer"
            >
              CREATE PATIENT RECORD
            </button>
          </div>
        </div>
      )}

      {/* Selected Patient Medical summary card */}
      <div className="bg-[#04040a]/80 rounded-xl p-5 border border-zinc-900 space-y-5">
        <div className="flex items-start lg:items-center justify-between flex-col lg:flex-row gap-4">
          <div>
            <h4 className="text-gray-100 font-sans font-extrabold text-base">
              {selectedPatient.name}
            </h4>
            <p className="text-cyan-400 text-[10px] font-mono uppercase tracking-wider mt-0.5">
              {selectedPatient.condition} &bull; {selectedPatient.onset}
            </p>
          </div>
          <span className="bg-cyan-500/10 text-cyan-300 font-mono text-[9px] px-2.5 py-1 rounded-lg border border-cyan-500/20 font-bold uppercase tracking-widest">
            {selectedPatient.affectedSide.toUpperCase()} LIMB DEFICIT
          </span>
        </div>

        {/* Dynamic Patient Biosignal Tune Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#04040a] p-4.5 rounded-xl border border-zinc-800/80 text-[10px] font-mono">
          <div className="space-y-4.5">
            <h5 className="text-cyan-400 font-bold uppercase text-[9px] tracking-widest flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-cyan-400" /> SENSORY CORTEX
              EEG CALIBRATION
            </h5>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase tracking-tight">
                  Rest Base Mu-Rhythm Amplitude:
                </span>
                <span className="font-bold text-gray-300">
                  {selectedPatient.baselineMu.toFixed(1)} uV
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                step="0.5"
                value={selectedPatient.baselineMu}
                onChange={(e) =>
                  onUpdatePatient({
                    ...selectedPatient,
                    baselineMu: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-400 h-1 rounded bg-zinc-900 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase tracking-tight">
                  Active Motor Imagery (ERD):
                </span>
                <span className="font-bold text-gray-300">
                  {selectedPatient.activeMu.toFixed(1)} uV
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={selectedPatient.activeMu}
                onChange={(e) =>
                  onUpdatePatient({
                    ...selectedPatient,
                    activeMu: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-400 h-1 rounded bg-zinc-900 cursor-pointer"
              />
              <span className="text-[9px] text-zinc-500 italic block">
                Expected suppression: -
                {(
                  (1 - selectedPatient.activeMu / selectedPatient.baselineMu) *
                  100
                ).toFixed(0)}
                % amplitude reduction
              </span>
            </div>
          </div>

          <div className="space-y-4.5">
            <h5 className="text-amber-500 font-bold uppercase text-[9px] tracking-widest flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" /> FOREARM EXTENSOR
              EMG CALIBRATION
            </h5>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase tracking-tight">
                  Rest Muscle Noise floor:
                </span>
                <span className="font-bold text-gray-300">
                  {selectedPatient.baselineEMG.toFixed(1)} uV
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={selectedPatient.baselineEMG}
                onChange={(e) =>
                  onUpdatePatient({
                    ...selectedPatient,
                    baselineEMG: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-amber-500 h-1 rounded bg-zinc-900 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase tracking-tight">
                  Forearm Grip Muscle Flexion:
                </span>
                <span className="font-bold text-gray-300">
                  {selectedPatient.activeEMG.toFixed(1)} uV
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="5"
                value={selectedPatient.activeEMG}
                onChange={(e) =>
                  onUpdatePatient({
                    ...selectedPatient,
                    activeEMG: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-amber-500 h-1 rounded bg-zinc-900 cursor-pointer"
              />
              <span className="text-[9px] text-zinc-500 block italic">
                Therapeutic efferent gain:{" "}
                {Math.round(
                  selectedPatient.activeEMG / selectedPatient.baselineEMG,
                )}
                x signal factor
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs border-zinc-900/60 leading-relaxed">
          <p className="text-zinc-300 font-sans">
            <strong className="text-gray-100 font-mono uppercase text-[9px] tracking-wider font-semibold mr-1">
              Primary Goal:
            </strong>{" "}
            {selectedPatient.rehabGoal}
          </p>
          <p className="text-zinc-500 text-xs italic font-sans leading-relaxed mt-1">
            <strong className="text-zinc-400 font-mono uppercase text-[9px] tracking-wider not-italic font-semibold mr-1">
              Clinical Therapist Case evaluation:
            </strong>{" "}
            {selectedPatient.notes}
          </p>
        </div>

        {/* Generate synthetic biological signals API trigger */}
        <div className="pt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-t border-zinc-900">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-violet-400 font-bold block">
              Biomimetic Waveform Playground
            </span>
            <p className="text-[10px] text-zinc-400 leading-tight">
              Request Gemini to write a customized physiological time series
              signal track.
            </p>
          </div>

          <div className="flex gap-2 text-[10px] font-mono">
            <button
              disabled={isGeneratingSynthetic}
              onClick={() =>
                generateSyntheticWaveform(
                  selectedPatient,
                  "Grasp Object Attempt",
                )
              }
              className="py-2.5 px-3.5 rounded-xl border border-violet-500/20 bg-violet-600/10 text-violet-300 hover:bg-violet-600/20 transition-all font-bold font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGeneratingSynthetic
                ? "SYNTHESIZING..."
                : "SYNTHESIZE GRASP FEED"}
            </button>
            <button
              disabled={isGeneratingSynthetic}
              onClick={() =>
                generateSyntheticWaveform(
                  selectedPatient,
                  "Finger Flick Attempt",
                )
              }
              className="py-2.5 px-3.5 rounded-xl border border-violet-500/20 bg-violet-600/10 text-violet-300 hover:bg-violet-600/20 transition-all font-bold font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGeneratingSynthetic ? "SYNTHESIZING..." : "SYNTHESIZE FLEXION"}
            </button>
          </div>
        </div>

        {/* Synthetic feedback commentary output */}
        {syntheticNotes && (
          <div className="bg-violet-950/20 border border-violet-900/40 rounded-xl p-4 font-mono text-xs text-violet-300 mt-4 leading-relaxed animate-fade-in shadow-inner">
            <div className="flex items-center gap-2 mb-2 border-b border-violet-900/30 pb-2">
              <Clipboard className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-bold uppercase tracking-wider text-[9px] text-violet-400">
                Clinical Synthetic Diagnostic report
              </span>
            </div>
            <p>{syntheticNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
