import React from "react";
import { Cpu, Zap, Activity, ShieldAlert } from "lucide-react";
import { Patient, SNNConfig, SimulationMetrics } from "../types";
import { motion } from "motion/react";

interface HeaderProps {
  patient: Patient;
  config: SNNConfig;
  metrics: SimulationMetrics;
}

export function Header({ patient, config, metrics }: HeaderProps) {
  return (
    <header className="relative z-50 border-b border-cyan-500/20 bg-[#03040a]/70 backdrop-blur-3xl">
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-30 animate-pulse" />
              <div className="relative p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Cpu className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="font-sans font-black text-xl tracking-tight text-white flex items-center gap-3">
                OMNI-CORE{" "}
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded uppercase tracking-[0.2em] font-mono shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  Medical HUD
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                  Target Focus: PhysioNet Neuromorphic Analysis
                </p>
              </div>
            </div>
          </motion.div>

          {/* Core Telemetry */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            {/* Latency */}
            <div className="bg-black/40 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-4 backdrop-blur-md">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold mb-0.5">
                  Soma Latency
                </span>
                <span className="text-sm font-mono font-black text-purple-300 tracking-tighter">
                  {metrics.currentLatencyMS.toFixed(2)} ms
                </span>
              </div>
            </div>

            {/* Power */}
            <div className="bg-black/40 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-4 backdrop-blur-md">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold mb-0.5">
                  Core Power
                </span>
                <span className="text-sm font-mono font-black text-emerald-300 tracking-tighter">
                  {metrics.currentPowerUW.toFixed(2)} μW
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
