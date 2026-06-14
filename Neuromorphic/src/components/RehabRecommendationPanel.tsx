import React from "react";
import { Patient } from "../types";
import {
  Stethoscope,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ArrowRight,
  Brain,
} from "lucide-react";
import { motion } from "motion/react";

interface RehabRecommendationPanelProps {
  patient: Patient;
  motorIntentConfidence?: number;
  avgEEG?: number;
  avgEMG?: number;
  spikeRate?: number;
  recoveryProgress?: number;
}

export function RehabRecommendationPanel({
  patient,
  motorIntentConfidence = 0,
  avgEEG = 0,
  avgEMG = 0,
  spikeRate = 0,
  recoveryProgress = 0,
}: RehabRecommendationPanelProps) {
  const getRecommendation = () => {
    // Dynamic Decision Engine based on metrics AND patient-specific capability
    let focus = "Monitoring";
    let intensity = "Low (5mA)";
    let reason = "Neuromorphic monitor initializing...";
    let status: "Monitoring" | "Processing" | "Therapy Recommended" | "Active Rehabilitation" = "Monitoring";

    // Use patient's activeEMG as a reference point for normality
    const emgEfficiency = avgEMG / (patient.activeEMG || 100);
    // Use Mu rhythm data for cortical engagement score
    const corticalEngagement = (patient.activeMu || 1) / (patient.baselineMu || 10);
    
    // Adjusted thresholds
    const isHighIntent = motorIntentConfidence > 0.65;
    const isGoodEngagement = corticalEngagement < 0.6; // Improved Mu suppression

    if (isHighIntent && emgEfficiency > 0.4) {
      status = "Active Rehabilitation";
      focus = "Active Stimulation Therapy";
      intensity = "High (45mA)";
      reason = `Cortical engagement optimized (Mu suppression: ${((1 - corticalEngagement) * 100).toFixed(0)}%). Patient ${patient.name} shows high capacity for ${patient.condition.toLowerCase().includes("hemiplegia") ? "limb" : "muscle"} activation.`;
    } else if (isHighIntent || emgEfficiency > 0.2) {
      status = "Therapy Recommended";
      focus = "Motor Imagery Training";
      intensity = "Medium (25mA)";
      reason = `Moderate intent detected. Focus on reinforcing ${patient.rehabGoal.toLowerCase()}.`;
    } else {
      status = "Processing";
      focus = "Assisted Rehab Mode";
      intensity = "Low (10mA)";
      reason = "Baseline activity low. Re-calibrating to patient's specific neuromorphic intensity thresholds.";
    }

    return { focus, intensity, reason, status };
  };

  const rec = getRecommendation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#03040a]/80 backdrop-blur-3xl border border-purple-500/20 rounded-[32px] p-6 shadow-[0_0_50px_rgba(168,85,247,0.1)] space-y-5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="flex justify-between items-center z-10 relative">
        <h3 className="font-sans font-black text-lg text-gray-100 tracking-tight flex items-center gap-2">
            Clinical AI Copilot
        </h3>
        <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[9px] font-bold uppercase tracking-widest">
            {rec.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[10px] uppercase tracking-widest font-mono text-zinc-500 z-10 relative">
        <div className="bg-zinc-900/50 p-2 rounded-xl border border-white/5">
            <span className="block text-zinc-400">Confidence</span>
            <span className="text-emerald-400 text-sm font-bold">{(motorIntentConfidence * 100).toFixed(0)}%</span>
        </div>
        <div className="bg-zinc-900/50 p-2 rounded-xl border border-white/5">
            <span className="block text-zinc-400">EMG Strength</span>
            <span className="text-emerald-400 text-sm font-bold">{(avgEMG).toFixed(0)}uV</span>
        </div>
        <div className="bg-zinc-900/50 p-2 rounded-xl border border-white/5">
            <span className="block text-zinc-400">Spike Rate</span>
            <span className="text-emerald-400 text-sm font-bold">{spikeRate.toFixed(1)}Hz</span>
        </div>
        <div className="bg-zinc-900/50 p-2 rounded-xl border border-white/5">
            <span className="block text-zinc-400">Recovery</span>
            <span className="text-emerald-400 text-sm font-bold">{recoveryProgress}%</span>
        </div>
      </div>

      <div className="bg-zinc-900/80 rounded-2xl border border-white/5 p-4 relative z-10 space-y-3">
        <div>
          <h4 className="text-[10px] uppercase font-mono text-zinc-500">Recommended Therapy</h4>
          <p className="text-sm font-bold text-gray-100">{rec.focus}</p>
        </div>
        <div>
          <h4 className="text-[10px] uppercase font-mono text-zinc-500">Clinical Notes</h4>
          <p className="text-xs text-zinc-400 font-sans">{patient.notes}</p>
        </div>
        <div>
          <h4 className="text-[10px] uppercase font-mono text-zinc-500">AI Context</h4>
          <p className="text-xs text-zinc-400 font-sans">{rec.reason}</p>
        </div>
      </div>

      <p className="text-[8px] text-zinc-600 italic font-mono text-center">
        Prototype Mode – Using Synthetic EEG/EMG Signals
      </p>
    </motion.div>
  );
}
