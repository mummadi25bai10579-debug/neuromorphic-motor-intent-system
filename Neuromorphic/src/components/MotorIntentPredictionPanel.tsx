import React, { useMemo } from "react";
import { SignalFrame, Patient } from "../types";
import { Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MotorIntentPredictionPanelProps {
  frames: SignalFrame[];
  patient: Patient;
  state: "resting" | "intent";
}

export function MotorIntentPredictionPanel({
  frames,
  patient,
  state,
}: MotorIntentPredictionPanelProps) {
  // Grab the last 20 frames to calculate current signal characteristics
  const recentFrames = useMemo(() => frames.slice(-20), [frames]);

  const avgEEG =
    recentFrames.length > 0
      ? recentFrames.reduce((acc, f) => acc + Math.abs(f.eegValue), 0) /
        recentFrames.length
      : 15.0;

  // Compute Mu Suppression (Event-Related Desynchronization - ERD %)
  const baseline = patient.baselineMu || 15.0;
  const erdPercent = Math.max(
    0,
    Math.min(100, ((baseline - avgEEG) / baseline) * 100),
  );

  // Predictive scoring setup
  let leftHandScore = 0;
  let rightHandScore = 0;
  let restStateScore = 0;

  // Confidence based on signal variance and spike timing reliability
  const variance =
    recentFrames.length > 0
      ? recentFrames.reduce(
          (acc, f) => acc + Math.pow(Math.abs(f.eegValue) - avgEEG, 2),
          0,
        ) / recentFrames.length
      : 0;
  const modelConfidence = Math.min(99.9, Math.max(50, 100 - variance / 10));

  // Classifier Logic
  if (erdPercent < 30) {
    restStateScore = 95 - erdPercent;
    leftHandScore = Math.max(0, erdPercent * 1.5);
    rightHandScore = Math.max(0, erdPercent * 1.5);
  } else {
    restStateScore = Math.max(5, 100 - erdPercent * 2);
    if (variance < 25) {
      leftHandScore = Math.min(98, erdPercent + 15);
      rightHandScore = Math.max(2, 100 - leftHandScore - restStateScore);
    } else {
      rightHandScore = Math.min(98, erdPercent + 12);
      leftHandScore = Math.max(2, 100 - rightHandScore - restStateScore);
    }
  }

  const total = leftHandScore + rightHandScore + restStateScore || 1;
  const scores = [
    { label: "Left Hand", value: (leftHandScore / total) * 100 },
    { label: "Right Hand", value: (rightHandScore / total) * 100 },
    { label: "Rest", value: (restStateScore / total) * 100 },
  ];

  scores.sort((a, b) => b.value - a.value);

  const topIntent =
    state === "intent" && erdPercent >= 30 ? scores[0].label : "Resting/Idle";
  const confidence =
    state === "intent" && topIntent !== "Resting/Idle" ? modelConfidence : 99.9;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[32px] bg-[#03040a]/80 backdrop-blur-3xl border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)] p-8 h-full flex flex-col justify-between"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.1)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1)_0%,transparent_50%)] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 z-10">
        <div>
          <h3 className="text-cyan-400 text-[10px] font-mono tracking-[0.25em] uppercase mb-1.5 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Cortical
            Decode
          </h3>
          <p className="text-gray-400 text-sm font-sans font-medium">
            SNN Target Intent Classification
          </p>
        </div>

        <div className="flex gap-2">
          {erdPercent >= 30 && state === "intent" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                repeatType: "reverse",
              }}
              className="px-3 py-1 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-cyan-300 text-[9px] font-bold font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Motor Cortex Active
            </motion.div>
          ) : (
            <div className="px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-500 text-[9px] font-bold font-mono tracking-widest uppercase">
              Baseline State
            </div>
          )}
        </div>
      </div>

      {/* Main Prediction Display */}
      <div className="flex flex-col items-center justify-center py-6 border-y border-white/5 relative z-10 flex-grow">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={topIntent}
            initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{
              scale: 1.1,
              opacity: 0,
              filter: "blur(10px)",
              position: "absolute",
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-center ${
              topIntent === "Resting/Idle"
                ? "text-zinc-600 drop-shadow-none"
                : "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400 drop-shadow-[0_0_25px_rgba(139,92,246,0.4)]"
            }`}
          >
            {topIntent === "Resting/Idle"
              ? "IDLE / REST"
              : `${topIntent.toUpperCase()}`}
          </motion.div>
        </AnimatePresence>

        <motion.div
          layout
          className={`mt-4 text-xs lg:text-sm font-mono tracking-widest px-4 py-1.5 rounded-full border ${topIntent === "Resting/Idle" ? "text-zinc-600 border-zinc-800 bg-zinc-900/30" : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]"}`}
        >
          {confidence.toFixed(1)}% CONFIDENCE
        </motion.div>
      </div>

      {/* Probability Bars */}
      <div className="grid grid-cols-3 gap-3 h-[140px] items-end pt-8 z-10">
        {scores.map((stat, idx) => {
          const isHighest = stat.label === topIntent;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-3 h-full"
            >
              <div className="w-full bg-zinc-900/40 rounded-t-xl overflow-hidden flex items-end h-[90px] border-b border-white/5 relative group pb-[2px]">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: `${Math.min(100, Math.max(5, stat.value))}%`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`w-full rounded-t-xl relative transition-all ${
                    isHighest && topIntent !== "Resting/Idle"
                      ? "bg-gradient-to-t from-indigo-600 to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                      : "bg-zinc-800"
                  }`}
                />
                <div className="absolute top-1 left-1 right-1 text-center font-mono text-[9px] text-zinc-400 font-bold mix-blend-screen drop-shadow-md">
                  {stat.value.toFixed(1)}%
                </div>
              </div>
              <span
                className={`text-[10px] md:text-[11px] font-bold font-sans uppercase tracking-[0.15em] text-center ${isHighest && topIntent !== "Resting/Idle" ? "text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" : "text-zinc-500"}`}
              >
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
