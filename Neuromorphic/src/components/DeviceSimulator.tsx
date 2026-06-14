import React from "react";
import {
  Hand,
  Zap,
  HeartHandshake,
  BatteryCharging,
  Check,
  Clock,
} from "lucide-react";
import { SignalFrame, SimulationMetrics, Patient } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DeviceSimulatorProps {
  frames: SignalFrame[];
  metrics: SimulationMetrics;
  patient: Patient;
  state: "resting" | "intent";
  toggleMotorIntent: () => void;
}

export const DeviceSimulator = React.memo(({
  frames,
  metrics,
  patient,
  state,
  toggleMotorIntent,
}: DeviceSimulatorProps) => {
  const last15Frames = frames.slice(-15);
  const wasTriggeredRecently = last15Frames.some((f) => f.outputSpike);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#03040a]/80 backdrop-blur-3xl border border-amber-500/20 rounded-[32px] p-8 shadow-[0_0_50px_rgba(245,158,11,0.05)] flex flex-col justify-between space-y-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.05)_0%,transparent_50%)] pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/5 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Hand className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-black text-lg text-gray-100 tracking-tight">
              Kinetic Actuator Module
            </h3>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.15em] mt-0.5">
              Bionic Orthosis + FES Generator
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#010103] border border-amber-900/40 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-[260px] shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

        <AnimatePresence>
          {wasTriggeredRecently && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="absolute w-44 h-44 rounded-full border-4 border-amber-500/40 blur-sm"></span>
              <span className="absolute w-32 h-32 rounded-full border-2 border-amber-500/60 blur-sm"></span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="z-10 flex flex-col items-center space-y-4">
          <motion.svg
            viewBox="0 0 100 100"
            className="w-36 h-36 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            animate={{
              scale: wasTriggeredRecently ? 1.05 : 1,
              rotate: wasTriggeredRecently ? -5 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <path
              d="M30,80 C30,90 40,90 50,90 C60,90 70,90 70,80 L70,40 C70,35 65,35 65,40 L65,70 L60,70 L60,25 C60,20 55,20 55,25 L55,70 L50,70 L50,20 C50,15 45,15 45,20 L45,70 L40,70 L40,30 C40,25 35,25 35,30 L35,80 Z"
              fill={wasTriggeredRecently ? "transparent" : "#1f2937"}
              stroke={wasTriggeredRecently ? "#f59e0b" : "#374151"}
              strokeWidth="4"
              strokeLinejoin="round"
              className="transition-colors duration-300"
            />
            {wasTriggeredRecently && (
              <motion.circle
                cx="50"
                cy="55"
                r="8"
                fill="#f59e0b"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ filter: "blur(2px)" }}
              />
            )}
          </motion.svg>
        </div>

        <div className="absolute bottom-4 bg-[#0a0a0a]/80 backdrop-blur border border-white/5 px-4 py-2 rounded-xl flex items-center justify-between min-w-[200px] z-10">
          <div className="text-[9px] font-mono uppercase text-zinc-500 font-bold tracking-widest">
            Actuator State
          </div>
          <div
            className={`text-[10px] uppercase font-mono font-black ${wasTriggeredRecently ? "text-amber-400" : "text-zinc-600"}`}
          >
            {wasTriggeredRecently ? "ENGAGED" : "IDLE / RELAXED"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 z-10 mt-6">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 items-start">
          <span className="text-zinc-500 text-[9px] uppercase tracking-[0.2em] font-mono">
            Motor Response
          </span>
          <span className="text-gray-100 font-sans font-bold text-base flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />{" "}
            {metrics.currentLatencyMS.toFixed(2)} ms
          </span>
          <span className="text-zinc-600 text-[10px] font-mono pt-1">
            Event to motion latency
          </span>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 items-start">
          <span className="text-zinc-500 text-[9px] uppercase tracking-[0.2em] font-mono">
            Bionic Energy Draw
          </span>
          <span className="text-gray-100 font-sans font-bold text-base flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-zinc-500" />{" "}
            {metrics.currentPowerUW.toFixed(2)} μW
          </span>
          <span className="text-zinc-600 text-[10px] font-mono pt-1">
            Ultra-low power drain
          </span>
        </div>
      </div>
    </motion.div>
  );
});
