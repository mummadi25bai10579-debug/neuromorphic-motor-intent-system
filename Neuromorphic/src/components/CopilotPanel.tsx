import React, { useState, useRef, useEffect } from "react";
import {
  Patient,
  SNNConfig,
  SimulationMetrics,
  CopilotMessage,
} from "../types";
import {
  Sparkles,
  Send,
  BrainCircuit,
  Activity,
  Cpu,
  Laptop,
  MessageCircle,
  AlertCircle,
  Sparkle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CopilotPanelProps {
  patient: Patient;
  config: SNNConfig;
  metrics: SimulationMetrics;
  messages: CopilotMessage[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
}

export function CopilotPanel({
  patient,
  config,
  metrics,
  messages,
  onSendMessage,
  isSending,
}: CopilotPanelProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const loadPresetQuery = (queryText: string) => {
    if (isSending) return;
    onSendMessage(queryText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#03040a]/80 backdrop-blur-3xl border border-purple-500/20 rounded-[32px] p-8 shadow-[0_0_50px_rgba(168,85,247,0.05)] flex flex-col h-[560px] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-3/4 h-full bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.05)_0%,transparent_60%)] pointer-events-none" />

      {/* Dynamic Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-black text-lg text-gray-100 flex items-center gap-2 tracking-tight">
              Clinical Command AI{" "}
              <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded border border-emerald-500/20 tracking-[0.2em] shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                ACTIVE
              </span>
            </h3>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.15em] mt-0.5">
              Neural Graph Optimizer
            </p>
          </div>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 font-sans text-sm scrollbar-thin z-10 relative">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`p-4 rounded-2xl max-w-[85%] leading-relaxed ${
                msg.sender === "user"
                  ? "bg-zinc-800/80 ml-auto text-gray-100 border border-white/5"
                  : "bg-purple-900/10 border border-purple-500/20 text-purple-200 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {msg.sender === "copilot" ? (
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-500">
                  {msg.sender === "copilot" ? "System Core" : "Clinician"}
                </span>
                <span className="text-[9px] text-zinc-600 font-mono ml-auto">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div
                className="font-sans text-sm whitespace-pre-wrap mt-2 user-select-text markdown-body"
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {isSending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-2xl bg-purple-900/10 border border-purple-500/20 max-w-[85%] flex items-center gap-3 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)]"
          >
            <div className="w-4 h-4 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
            <span className="text-xs text-purple-400 font-mono italic tracking-wider">
              Analyzing state vectors...
            </span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Action Prompts Grid */}
      <div className="mt-4 grid grid-cols-1 gap-2 shrink-0 z-10 relative">
        <p className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-widest mb-1 pl-1">
          Suggested Inquiries
        </p>
        <button
          disabled={isSending}
          onClick={() =>
            loadPresetQuery(
              `Analyze SNN parameters setup specifically for patient ${patient.name}. Are weights calibrated correctly?`,
            )
          }
          className="text-left text-xs bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 py-2.5 px-3.5 rounded-xl text-zinc-400 hover:text-gray-200 transition-colors flex items-center gap-2 group cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors" />{" "}
          Evaluate ASIC Configuration
        </button>
      </div>

      <div className="mt-4 z-10 relative">
        <form onSubmit={handleSubmit} className="flex gap-2 isolate">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder="Ask about neural logic or patient states..."
            className="flex-1 bg-zinc-900/80 border border-white/5 text-gray-100 placeholder:text-zinc-600 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="px-5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
