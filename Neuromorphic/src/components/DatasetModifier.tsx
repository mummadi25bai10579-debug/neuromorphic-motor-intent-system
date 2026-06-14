import React, { useState, useEffect } from "react";
import {
  Database,
  Plus,
  Trash2,
  RefreshCw,
  TrendingUp,
  Download,
  FileJson,
  Check,
  AlertTriangle,
  Play,
  Sparkles,
  Info,
} from "lucide-react";
import { mutableEegSamples } from "../utils/signalGenerator";
import rawEegSamples from "../data/eeg_samples.json";

interface DatasetModifierProps {
  onDatasetReloaded: () => void;
}

export function DatasetModifier({ onDatasetReloaded }: DatasetModifierProps) {
  // Sync state with the global mutableEegSamples reference
  const [samples, setSamples] = useState<any[]>([]);
  const [jsonPasteOpen, setJsonPasteOpen] = useState(false);
  const [pastedJson, setPastedJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "resting" | "intent">(
    "all",
  );

  // Load active values from simulation pointer on mount
  useEffect(() => {
    loadActiveFromRuntime();
  }, []);

  const loadActiveFromRuntime = () => {
    setSamples(JSON.parse(JSON.stringify(mutableEegSamples)));
    setStatusMessage("Active brainwave signals loaded successfully.");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // Reverts simulation elements to factory clinical records
  const handleResetDefaults = () => {
    const confirmation = window.confirm(
      "Are you sure you want to reset the clinical dataset? This will clear all active custom mutations.",
    );
    if (!confirmation) return;

    // Direct atomic write to master references
    mutableEegSamples.length = 0;
    rawEegSamples.forEach((item: any) => {
      mutableEegSamples.push({ ...item });
    });

    setSamples(JSON.parse(JSON.stringify(mutableEegSamples)));
    onDatasetReloaded();
    setStatusMessage("Dataset reset to clinical PhysioNet baselines.");
    setTimeout(() => setStatusMessage(""), 4000);
  };

  // Commit current modified table values back to the active simulation context
  const handleApplyToASIC = () => {
    if (samples.length === 0) {
      alert("Error: Cannot commit an empty dataset to the Neuromorphic core.");
      return;
    }

    // Overwrite the exported mutableEegSamples directly
    mutableEegSamples.length = 0;
    samples.forEach((row, idx) => {
      // Ensure all fields standard EEG readers expect are set properly
      const formatted = {
        ...row,
        timestamp: row.timestamp !== undefined ? row.timestamp : idx * 10,
        eegValue: parseFloat(row.eeg) || 0,
        eeg: parseFloat(row.eeg) || 0,
        emg: parseFloat(row.emg) || 0,
        emgValue: parseFloat(row.emg) || 0,
      };
      mutableEegSamples.push(formatted);
    });

    onDatasetReloaded();
    setStatusMessage(
      "✓ SNN silicon registers updated. Changes hot-loaded in memory.",
    );
    setTimeout(() => setStatusMessage(""), 4000);
  };

  // Handles updating input field of individual row cell
  const handleValueChange = (
    index: number,
    field: "eeg" | "emg",
    val: string,
  ) => {
    const numeric = parseFloat(val);
    const textSafeVal = isNaN(numeric) ? 0 : numeric;

    setSamples((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: textSafeVal,
        ...(field === "eeg" ? { eegValue: textSafeVal } : {}),
      };
      return copy;
    });
  };

  // Add blank/interpolated row to dataset
  const handleAddSample = () => {
    const lastSample = samples[samples.length - 1] || { eeg: 15.0, emg: 5.0 };
    const newRow = {
      eeg: lastSample.eeg,
      emg: lastSample.emg,
      eegValue: lastSample.eeg,
      timestamp: samples.length * 10,
      subject: "S001",
      file: "CustomSet.edf",
    };

    setSamples((prev) => [...prev, newRow]);
    setStatusMessage(
      "Appended raw biosignal checkpoint at row index " + samples.length,
    );
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // Remove row
  const handleDeleteSample = (index: number) => {
    setSamples((prev) => prev.filter((_, idx) => idx !== index));
    setStatusMessage(
      "Somatic sample index " + index + " pruned from memory buffer.",
    );
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // Download modified dataset as JSON format
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(samples, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      "neurolinker_custom_eeg_samples.json",
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setStatusMessage("Custom JSON schema package exported successfully.");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // Bulk Import through JSON textarea
  const handleBulkImportJSON = () => {
    try {
      setJsonError("");
      const parsed = JSON.parse(pastedJson);

      if (!Array.isArray(parsed)) {
        setJsonError(
          "Root container must be a standard JSON array of frames [ {eeg, emg}, ... ]",
        );
        return;
      }

      if (parsed.length === 0) {
        setJsonError(
          "Dataset array must contain at least 1 validated checkpoint.",
        );
        return;
      }

      // Format elements
      const sanitized = parsed.map((item: any, idx: number) => {
        const eegVal = parseFloat(
          item.eeg !== undefined
            ? item.eeg
            : item.eegValue !== undefined
              ? item.eegValue
              : 15.0,
        );
        const emgVal = parseFloat(
          item.emg !== undefined
            ? item.emg
            : item.emgValue !== undefined
              ? item.emgValue
              : 5.0,
        );
        return {
          eeg: eegVal,
          eegValue: eegVal,
          emg: emgVal,
          emgValue: emgVal,
          timestamp:
            item.timestamp !== undefined ? parseInt(item.timestamp) : idx * 10,
          subject: item.subject || "S001-IMPORT",
          file: item.file || "PastedCustom.edf",
        };
      });

      setSamples(sanitized);
      setJsonPasteOpen(false);
      setPastedJson("");
      setStatusMessage(
        `✓ Bulk parsed ${sanitized.length} time-series frames! Apply changes to deploy to background SNN.`,
      );
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (e: any) {
      setJsonError("Parse failure: " + e.message);
    }
  };

  // Generate synthetic values (simple sine wave combination helper) to easily seed nice mock shapes
  const handleSeedWaveform = (type: "alpha" | "seizure" | "burst") => {
    const size = 40;
    const array = [];
    for (let i = 0; i < size; i++) {
      let eeg = 15.0;
      let emg = 4.0;
      if (type === "alpha") {
        // Nice alpha rhythm resting wave
        eeg = 18.0 + Math.sin(i / 1.5) * 6.5;
        emg = 4.2 + Math.random() * 1.5;
      } else if (type === "seizure") {
        // High-amplitude spike-and-wave discharges
        eeg = i % 4 === 0 ? 45.0 : -15.0 + Math.sin(i / 2) * 5.0;
        emg = 5.0 + Math.random() * 3.0;
      } else if (type === "burst") {
        // High motor intent burst (low power EEG desynch, high capacity EMG flexion ripple)
        eeg = 5.0 + Math.sin(i / 0.8) * 2.0;
        emg =
          i >= 15 && i <= 32
            ? 140.0 + Math.sin(i * 3.1) * 35.0
            : 4.5 + Math.random() * 1.8;
      }
      array.push({
        eeg,
        eegValue: eeg,
        emg,
        emgValue: emg,
        timestamp: i * 10,
        subject: "S001-WAVE",
        file: `Generated_${type}.edf`,
      });
    }
    setSamples(array);
    setStatusMessage(
      `Generated ${type.toUpperCase()} template signals. Remember to Apply to ASIC!`,
    );
    setTimeout(() => setStatusMessage(""), 5000);
  };

  // Computed fields
  const filteredSamples = samples.filter((sample, idx) => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const subjectMatch = (sample.subject || "").toLowerCase().includes(term);
      const valMatch =
        sample.eeg.toFixed(1).includes(term) ||
        sample.emg.toFixed(1).includes(term);
      if (!subjectMatch && !valMatch) return false;
    }

    // Categorization filter based on active intent threshold (EMG > 15uV)
    if (filterMode === "resting") return sample.emg < 15.0;
    if (filterMode === "intent") return sample.emg >= 15.0;
    return true;
  });

  // Calculate coordinates for visual inline sparkline charts
  const getSomaticSparkPaths = () => {
    if (samples.length < 2) return { eegPath: "", emgPath: "" };
    const width = 360;
    const height = 48;
    const maxEEG = Math.max(...samples.map((s) => Math.abs(s.eeg)), 10.0);
    const maxEMG = Math.max(...samples.map((s) => s.emg), 10.0);

    const pointsEEG = samples.map((s, idx) => {
      const x = (idx / (samples.length - 1)) * width;
      // map center value around 24 height
      const y = 24 - (s.eeg / maxEEG) * 20;
      return `${x},${y}`;
    });

    const pointsEMG = samples.map((s, idx) => {
      const x = (idx / (samples.length - 1)) * width;
      // map bottom to top
      const y = height - (s.emg / maxEMG) * 40 - 2;
      return `${x},${y}`;
    });

    return {
      eegPath: `M ${pointsEEG.join(" L ")}`,
      emgPath: `M ${pointsEMG.join(" L ")}`,
    };
  };

  const { eegPath, emgPath } = getSomaticSparkPaths();

  return (
    <div
      id="interactive-dataset-modifier"
      className="bg-[#0b0c16]/90 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-6 medical-glow-purple text-left"
    >
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-sans font-extrabold text-base text-gray-100 tracking-tight">
              Physiological Dataset Calibration Worksheet
            </h3>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Dynamic SNN Electrode Sample Matrix Editor
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-[10px] font-mono font-bold bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-300 py-2 px-3 rounded-xl border border-zinc-850 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REVERT FACTORY
          </button>
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
        The spiking neural network feeds off continuous raw frames sourced from
        the clinical calibration dataset below. Modify cells in this table,
        delete elements, generate waveforms, or bulk paste logs. Click{" "}
        <strong className="text-purple-400">Apply to ASIC Runtime</strong> to
        hot-reload values into the active neuromorphic crossbars.
      </p>

      {/* Somatic Sparkline Monitor */}
      {samples.length > 1 && (
        <div className="bg-[#04040a] border border-zinc-900 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase font-black tracking-widest text-zinc-500">
            <span>Electrode Sparkline (40-Channel Buffer Grid)</span>
            <div className="flex items-center gap-4">
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-cyan-400 rounded-full inline-block"></span>{" "}
                EEG Brain Wave
              </span>
              <span className="text-amber-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full inline-block"></span>{" "}
                EMG Muscle Flex
              </span>
            </div>
          </div>

          <div className="relative h-16 w-full bg-zinc-950/80 rounded-lg flex items-center justify-center p-1 overflow-hidden border border-zinc-900">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 360 48"
              preserveAspectRatio="none"
            >
              {/* EEG path */}
              <path
                d={eegPath}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* EMG path */}
              <path
                d={emgPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[9px] text-zinc-600 font-mono">
            <span>START FRAME [0ms]</span>
            <span className="italic uppercase">
              Buffer Capacity: {samples.length} clinical time-slices
            </span>
            <span>END FRAME [{(samples.length - 1) * 10}ms]</span>
          </div>
        </div>
      )}

      {/* Wave Seeding Tool Box */}
      <div className="bg-[#030308] border border-zinc-900 rounded-xl p-4 space-y-3 text-[10px] font-mono">
        <div className="text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />{" "}
          WAVE SEEDING COPIES (PRE-BUILT TRACES)
        </div>
        <p className="text-zinc-500 text-[10px] font-sans">
          Instantly seed clean physical wave parameters into the worksheet table
          before refining:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSeedWaveform("alpha")}
            className="py-2.5 px-3 rounded-lg border border-cyan-500/10 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 font-bold hover:border-cyan-500/30 transition-all cursor-pointer cursor-custom"
          >
            α MU-REST RHYTHM
          </button>
          <button
            onClick={() => handleSeedWaveform("burst")}
            className="py-2.5 px-3 rounded-lg border border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 font-bold hover:border-amber-500/30 transition-all cursor-pointer"
          >
            ACTIVE MOTOR GRIP
          </button>
          <button
            onClick={() => handleSeedWaveform("seizure")}
            className="py-2.5 px-3 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold hover:border-red-500/30 transition-all cursor-pointer"
          >
            SPIKED EEG RIPPLES
          </button>
        </div>
      </div>

      {/* Control Actions Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3.5">
        {/* Search / Category Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <input
            type="text"
            placeholder="Search records..."
            className="bg-zinc-950 border border-zinc-850 hover:border-zinc-800 rounded-xl px-3.5 py-2 text-xs outline-none text-gray-200 font-mono w-full sm:w-44 focus:border-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl text-[9px] font-mono border border-zinc-900">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1 text-center rounded transition-all font-bold cursor-pointer font-sans uppercase ${
                filterMode === "all"
                  ? "bg-zinc-900 text-purple-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              All ({samples.length})
            </button>
            <button
              onClick={() => setFilterMode("resting")}
              className={`px-3 py-1 text-center rounded transition-all font-bold cursor-pointer font-sans uppercase ${
                filterMode === "resting"
                  ? "bg-zinc-900 text-cyan-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Rest
            </button>
            <button
              onClick={() => setFilterMode("intent")}
              className={`px-3 py-1 text-center rounded transition-all font-bold cursor-pointer font-sans uppercase ${
                filterMode === "intent"
                  ? "bg-zinc-900 text-amber-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Intent
            </button>
          </div>
        </div>

        {/* Action utility cluster */}
        <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
          <button
            onClick={() => setJsonPasteOpen(!jsonPasteOpen)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-indigo-300 font-bold cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            BULK RAW JSON
          </button>

          <button
            onClick={handleAddSample}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-emerald-400 font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD CHANNEL ROW
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-gray-300 font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            EXPORT
          </button>
        </div>
      </div>

      {/* JSON Import Overlay Section */}
      {jsonPasteOpen && (
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-4 shadow-inner animate-fade-in font-mono text-[10px]">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <span className="font-bold text-indigo-300 uppercase">
              Somatic Cluster JSON Importer
            </span>
            <span className="text-[8px] text-zinc-500">ROOT MUST BE ARRAY</span>
          </div>

          <textarea
            placeholder={`[\n  { "eeg": 15.3, "emg": 4.1 },\n  { "eeg": 18.2, "emg": 130.4 }\n]`}
            className="w-full bg-[#030308] border border-zinc-900 rounded-lg p-3 text-xs text-indigo-200 font-mono outline-none focus:border-indigo-500 h-32"
            value={pastedJson}
            onChange={(e) => setPastedJson(e.target.value)}
          />

          {jsonError && (
            <div className="text-[10px] text-red-400 bg-red-500/5 border border-red-500/15 p-2.5 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setJsonPasteOpen(false);
                setJsonError("");
              }}
              className="py-1.5 px-3.5 bg-zinc-900 text-zinc-500 rounded-lg font-bold cursor-pointer uppercase text-[9px]"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkImportJSON}
              className="py-1.5 px-3.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg font-bold cursor-pointer uppercase text-[9px]"
            >
              Parse Data Array
            </button>
          </div>
        </div>
      )}

      {/* Interactive Data Table list */}
      <div className="border border-zinc-900/80 rounded-xl overflow-hidden bg-zinc-950/20 max-h-72 overflow-y-auto">
        <table className="w-full text-left font-mono text-[10px] leading-normal border-collapse">
          <thead className="bg-[#030308] border-b border-zinc-900 text-zinc-500 text-[9px] uppercase tracking-wider sticky top-0 z-10 font-bold">
            <tr>
              <th className="py-2.5 px-4 font-bold">Idx</th>
              <th className="py-2.5 px-3 font-bold">EEG Brain (uV)</th>
              <th className="py-2.5 px-3 font-bold">EMG Muscle (uV)</th>
              <th className="py-2.5 px-3 font-bold">Somatic Class</th>
              <th className="py-2.5 px-3 font-bold">Clinical File</th>
              <th className="py-2.5 px-4 text-center font-bold">Prune</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {filteredSamples.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-zinc-650 font-sans italic"
                >
                  No records matching the active query filters were found.
                </td>
              </tr>
            ) : (
              filteredSamples.map((sample, idx) => {
                // Find actual indexes matching full samples array to delete correctly
                const trueIdx = samples.findIndex((s) => s === sample);
                const isIntent = sample.emg >= 15.0;

                return (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-900/40 transition-colors duration-100 group"
                  >
                    <td className="py-2 px-4 text-zinc-600 font-bold text-[9px]">
                      #{trueIdx >= 0 ? trueIdx : idx}
                    </td>

                    {/* EEG Field */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.5"
                          className="w-16 bg-[#04040a] border border-zinc-900 group-hover:border-zinc-800 focus:border-cyan-400 rounded p-1.5 text-cyan-400 font-bold text-[10px] outline-none"
                          value={sample.eeg}
                          onChange={(e) =>
                            handleValueChange(trueIdx, "eeg", e.target.value)
                          }
                        />
                        <span className="text-[8px] text-zinc-650">uV</span>
                      </div>
                    </td>

                    {/* EMG Field */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="1"
                          className="w-16 bg-[#04040a] border border-zinc-900 group-hover:border-zinc-800 focus:border-amber-400 rounded p-1.5 text-amber-500 font-bold text-[10px] outline-none"
                          value={sample.emg}
                          onChange={(e) =>
                            handleValueChange(trueIdx, "emg", e.target.value)
                          }
                        />
                        <span className="text-[8px] text-zinc-650">uV</span>
                      </div>
                    </td>

                    {/* Class Indicator */}
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tight ${
                          isIntent
                            ? "bg-amber-500/10 text-amber-500 border border-amber-550/15"
                            : "bg-cyan-500/10 text-cyan-400 border border-cyan-550/15"
                        }`}
                      >
                        {isIntent ? "ACTIVE INTENT" : "RESTING"}
                      </span>
                    </td>

                    {/* Context details */}
                    <td className="py-2 px-3 text-zinc-500 text-[9px] truncate max-w-[100px] leading-relaxed">
                      {sample.file || "S001R01.edf"}
                    </td>

                    {/* Delete action */}
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => handleDeleteSample(trueIdx)}
                        className="p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                        title="Delete checkpoint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {statusMessage && (
        <div className="text-[10px] text-purple-300 italic animate-fade-in font-mono bg-purple-500/5 border border-purple-500/15 p-2.5 rounded-xl flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-purple-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Deploy/Save section */}
      <div className="border-t border-zinc-900/60 pt-5 flex items-center justify-between gap-3 flex-col sm:flex-row">
        <span className="text-[9px] text-zinc-500 font-mono italic leading-normal">
          Active samples buffer capacity size: {samples.length} clinical
          records.
        </span>

        <button
          onClick={handleApplyToASIC}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-650 hover:bg-purple-600 active:scale-95 text-white font-sans font-black text-xs tracking-wider uppercase transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          APPLY TO ASIC RUNTIME
        </button>
      </div>
    </div>
  );
}
