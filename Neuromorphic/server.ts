import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Prediction
  app.post("/api/predict", (req, res) => {
    const { eeg, emg } = req.body;
    // Simple heuristic to mimic the ML model's behavior based on requirements
    const motor_intent = emg > 12;
    const confidence = motor_intent ? 0.92 : 0.88;
    res.json({
        motor_intent: motor_intent,
        confidence: confidence
    });
  });

  // API Route for Gemini Neuromorphic Copilot
  app.post("/api/copilot", async (req, res) => {
    try {
      const { patient, config, metrics, messages } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey
      });

      // Prepare message context
      const formattedHistory = messages
        .slice(-6) // Take last 6 messages
        .map((m: any) => `${m.sender === 'user' ? 'User/Clinician' : 'Neuromorphic Copilot'}: ${m.text}`)
        .join("\n");

      const systemInstruction = `You are "NeuroLinker Copilot", an expert clinical neuromorphic medical systems specialist.
Your primary role is assisting clinical engineers and therapists in stroke neurorehabilitation. You optimize biosignal processing (EEG motor cortex Mu-rhythm Event-Related Desynchronization, and EMG muscle activity signals) as trigger sources for assistive devices such as motorized exoskeletons or functional electrical stimulation (FES) gloves.

You specialize in Spiking Neural Networks (SNNs) running on edge neuromorphic ASIC silicons:
- Spike Encoders: Translate continuous EEG voltage and EMG voltage to discrete spike trains.
- LIF (Leaky Integrate-and-Fire) Neurons compile these spike trains into membrane potential V_m(t).
- Trigger condition: If neural activity pushes V_m(t) above V_th (threshold), the LIF neuron fires, initiating physical rehabilitation assistive mechanical movement immediately.
- STDP (Spike-Timing-Dependent Plasticity) dynamically tunes synaptic weights.

Provide professional, concise advice regarding:
1. SNN parameter adjustments (V_th, leak constant, synaptic weights) to improve latency and reduce false-positive activations.
2. Signal artifact filtering in clinical settings (e.g. eye-blinks, muscle noise).
3. Adapting control systems to the specific severe-to-moderate stroke profiles.

Keep responses structured, practical, and heavily grounded in quantitative neural metrics (microwatts, target trigger thresholds, membrane potential millivolts, and milliseconds). Avoid high-level vagueness or general health advice. No robotic intro/outros. Minimum conversational fluff. Use elegant Markdown formatting. Keep it under 250 words.`;

      const prompt = `Patient Clinical Assessment profile:
- Name: ${patient.name} (${patient.age} y/o)
- Condition: ${patient.condition}
- Deficit: ${patient.affectedSide} Side paralysis
- Baseline Brainwave Mu Rhythm: ${patient.baselineMu} uV
- Active Motor Intent Mu rhythm: ${patient.activeMu} uV (Drop represents intent level via desynchronization)
- Muscle EMG Baseline noise: ${patient.baselineEMG} uV
- Active Muscle EMG flexion attempt: ${patient.activeEMG} uV

Integrated Neuromorphic SNN Configuration:
- Spike threshold V_th: ${config.threshold} mV
- Leak constant fraction: ${config.leak}
- Synaptic Input weight EEG: ${config.inputWeightEEG} mV/spike
- Synaptic Input weight EMG: ${config.inputWeightEMG} mV/spike
- Learning Protocol: STDP ${config.stdpEnabled ? 'Enabled (Speed: ' + config.stdpRate + ')' : 'Disabled'}
- Spike Modulators: EEG Delta threshold (${config.deltaThresholdEEG} uV), EMG Delta threshold (${config.deltaThresholdEMG} uV)

Diagnostic Edge Metrics:
- Neuromorphic Processor Power: ${metrics.currentPowerUW} microwatts
- Detection-to-Trigger Latency: ${metrics.currentLatencyMS} milliseconds
- Dynamic Synaptic Gain multiplier: ${metrics.synapticEfficiency.toFixed(2)}x

Message Thread History:
${formattedHistory}

Clinician Diagnostic Request: Determine how to optimize the SNN parameters or suggest customized therapies. Respond to the clinician's latest inquiry directly and clearly. Provide specific param guidelines.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
        }
      });

      const reply = response.text || "No diagnostics available. Make sure parameters are within healthy boundaries.";
      return res.json({ reply });

    } catch (error: any) {
      console.error("Copilot Diagnostic Error:", error);
      return res.status(500).json({ error: error.message || "An issue occurred communicating with the clinical neuromorphic assistant." });
    }
  });

  // API Route for generating synthetic EEG/EMG data files or specific test parameters
  app.post("/api/generate-patient-signals", async (req, res) => {
    try {
      const { patientName, motorIntentType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey
      });

      const prompt = `Synthesize a short EEG & EMG time-series waveform mimicking a patient named "${patientName}" who performs a "${motorIntentType}" attempt.
EEG represents motor cortex Mu rhythm (usually drops dramatically when moving, which is ERD desynchronization).
EMG represents muscle activation (usually spikes during flexion).
Make exactly 10 sequential steps. Each step must have eegUv (microvolts), emgUv (microvolts), and a computed intent detection trigger.

Structure according to the desired JSON schema. Do not include markdown blocks.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              signals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeMs: { type: Type.INTEGER },
                    eegUv: { type: Type.NUMBER },
                    emgUv: { type: Type.NUMBER },
                    intent: { type: Type.BOOLEAN }
                  },
                  required: ["timeMs", "eegUv", "emgUv", "intent"]
                }
              },
              clinicianNotes: { type: Type.STRING }
            },
            required: ["signals", "clinicianNotes"]
          },
          temperature: 0.1,
        }
      });

      const rawText = response.text || "{}";
      let cleaned = rawText.trim();
      const startIdx = cleaned.indexOf("{");
      const endIdx = cleaned.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleaned = cleaned.substring(startIdx, endIdx + 1);
      }
      const data = JSON.parse(cleaned);
      return res.json(data);

    } catch (error: any) {
      console.error("Interactive Signal Generator Error:", error);
      return res.status(500).json({ error: error.message || "Could not synthesize signal samples." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Neuromorphic backend and static file server running on port ${PORT}`);
  });
}

startServer();
