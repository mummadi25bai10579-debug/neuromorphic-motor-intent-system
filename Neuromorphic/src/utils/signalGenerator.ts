import { SNNConfig, SignalFrame } from "../types";
import rawEegSamples from "../data/eeg_samples.json";

// Fully cloned mutable reference of patient EEG/EMG sample logs to bypass browser freeze protections
export const mutableEegSamples = JSON.parse(JSON.stringify(rawEegSamples));

function getPatientIdByBaselineMu(baselineMu: number): string {
  if (Math.abs(baselineMu - 18.5) < 0.1) return "pat-elena";
  if (Math.abs(baselineMu - 14.1) < 0.1) return "pat-david";
  if (Math.abs(baselineMu - 22.0) < 0.1) return "pat-marcus";
  return "pat-elena";
}

// Generates raw biological signal value for a given timestamp
// state: "resting" or "intent"
export function generateRawSignals(
  timeMs: number,
  state: "resting" | "intent",
  baselineMu: number,
  activeMu: number,
  baselineEMG: number,
  activeEMG: number,
  patientIdParam?: string
): { eeg: number; emg: number } {
  const patientId = patientIdParam || getPatientIdByBaselineMu(baselineMu);
  let sampleArray = Array.isArray(mutableEegSamples) 
    ? mutableEegSamples 
    : ((mutableEegSamples as any)[patientId] || (mutableEegSamples as any)["pat-elena"]);
  
  // Partition based on resting vs active intent EMG amplitude thresholds to offer genuine dynamic responses
  const restPoints = sampleArray.filter((pt: any) => pt.emg < 15.0);
  const intentPoints = sampleArray.filter((pt: any) => pt.emg >= 15.0);

  const activePool = (state === "resting" ? restPoints : intentPoints).length > 0
    ? (state === "resting" ? restPoints : intentPoints)
    : sampleArray;

  const index = Math.floor(timeMs / 10) % activePool.length;
  const currentSample = activePool[index];

  // Overlay minor raw biological jitter to keep live streaming looking energetic and real
  const jitterEEG = (Math.random() - 0.5) * 0.35;
  const jitterEMG = (Math.random() - 0.5) * 0.95;

  return {
    eeg: Math.max(-50, Math.min(50, currentSample.eeg + jitterEEG)),
    emg: Math.max(0, Math.min(300, currentSample.emg + jitterEMG))
  };
}

// Spiking Simulator State container
export class NeuromorphicCore {
  private config: SNNConfig;
  private eegVref = 0;
  private emgVref = 0;
  private vMem = 0;
  private refractoryCounter = 0;
  private lastEegSpikeTime = -100;
  private lastEmgSpikeTime = -100;

  constructor(config: SNNConfig) {
    this.config = { ...config };
  }

  updateConfig(newConfig: SNNConfig) {
    this.config = { ...newConfig };
  }

  // Processes a custom raw input signal value (e.g. from an uploaded file or microphone)
  processExternalFrame(
    timeMs: number,
    eeg: number,
    emg: number
  ): SignalFrame {
    // 2. Delta Modulation (Spike Encoders)
    let eegSpike = false;
    let emgSpike = false;

    // EEG Spike Detection
    const eegDiff = eeg - this.eegVref;
    if (Math.abs(eegDiff) >= this.config.deltaThresholdEEG) {
      eegSpike = true;
      this.eegVref += Math.sign(eegDiff) * this.config.deltaThresholdEEG;
      this.lastEegSpikeTime = timeMs;
    } else {
      this.eegVref *= 0.98;
    }

    // EMG Spike Detection
    const emgDiff = emg - this.emgVref;
    if (Math.abs(emgDiff) >= this.config.deltaThresholdEMG) {
      emgSpike = true;
      this.emgVref += Math.sign(emgDiff) * this.config.deltaThresholdEMG;
      this.lastEmgSpikeTime = timeMs;
    } else {
      this.emgVref *= 0.98;
    }

    // 3. LIF Neuron Integration
    let outputSpike = false;

    if (this.refractoryCounter > 0) {
      this.vMem = 0;
      this.refractoryCounter--;
    } else {
      this.vMem *= (1 - this.config.leak);

      if (eegSpike) {
        this.vMem += this.config.inputWeightEEG;
      }
      if (emgSpike) {
        this.vMem += this.config.inputWeightEMG;
      }

      if (this.vMem >= this.config.threshold) {
        outputSpike = true;
        this.vMem = 0;
        this.refractoryCounter = this.config.refractoryTicks;

        if (this.config.stdpEnabled) {
          const eegDt = timeMs - this.lastEegSpikeTime;
          const emgDt = timeMs - this.lastEmgSpikeTime;

          if (eegDt > 0 && eegDt < 30) {
            this.config.inputWeightEEG = Math.min(15.0, this.config.inputWeightEEG + this.config.stdpRate * 0.8);
          }
          if (emgDt > 0 && emgDt < 30) {
            this.config.inputWeightEMG = Math.min(25.0, this.config.inputWeightEMG + this.config.stdpRate * 1.2);
          }
        }
      }
    }

    return {
      timestamp: timeMs,
      eegValue: eeg,
      emgValue: emg,
      eegSpike,
      emgSpike,
      membranePotential: this.vMem,
      outputSpike
    };
  }

  // Processes single frame step (delta time in ms, e.g. 10ms)
  step(
    timeMs: number,
    state: "resting" | "intent",
    patient: { id?: string; baselineMu: number; activeMu: number; baselineEMG: number; activeEMG: number }
  ): SignalFrame {
    // 1. Generate Raw Waveforms
    const { eeg, emg } = generateRawSignals(
      timeMs,
      state,
      patient.baselineMu,
      patient.activeMu,
      patient.baselineEMG,
      patient.activeEMG,
      patient.id
    );

    // 2. Delta Modulation (Spike Encoders)
    let eegSpike = false;
    let emgSpike = false;

    // EEG Spike Detection
    const eegDiff = eeg - this.eegVref;
    if (Math.abs(eegDiff) >= this.config.deltaThresholdEEG) {
      eegSpike = true;
      this.eegVref += Math.sign(eegDiff) * this.config.deltaThresholdEEG;
      this.lastEegSpikeTime = timeMs;
    } else {
      // Slow leak reference back to zero to prevent drift
      this.eegVref *= 0.98;
    }

    // EMG Spike Detection
    const emgDiff = emg - this.emgVref;
    if (Math.abs(emgDiff) >= this.config.deltaThresholdEMG) {
      emgSpike = true;
      this.emgVref += Math.sign(emgDiff) * this.config.deltaThresholdEMG;
      this.lastEmgSpikeTime = timeMs;
    } else {
      this.emgVref *= 0.98;
    }

    // 3. LIF Neuron Integration
    let outputSpike = false;

    if (this.refractoryCounter > 0) {
      this.vMem = 0; // clamped to restingpotential during refractory
      this.refractoryCounter--;
    } else {
      // Apply Leak: V_m(t) = V_m(t-1) * (1 - leak)
      this.vMem *= (1 - this.config.leak);

      // Integrate inputs
      if (eegSpike) {
        this.vMem += this.config.inputWeightEEG;
      }
      if (emgSpike) {
        this.vMem += this.config.inputWeightEMG;
      }

      // Check spike trigger threshold
      if (this.vMem >= this.config.threshold) {
        outputSpike = true;
        this.vMem = 0; // Reset
        this.refractoryCounter = this.config.refractoryTicks;

        // Apply STDP (Spike-Timing-Dependent Plasticity)
        if (this.config.stdpEnabled) {
          // If input spike happened shortly before output spike, increase weight (LTP)
          // Else if input happened after output, decrease weight (LTD)
          const eegDt = timeMs - this.lastEegSpikeTime;
          const emgDt = timeMs - this.lastEmgSpikeTime;

          if (eegDt > 0 && eegDt < 30) {
            // Potentiate EEG weight
            this.config.inputWeightEEG = Math.min(15.0, this.config.inputWeightEEG + this.config.stdpRate * 0.8);
          }
          if (emgDt > 0 && emgDt < 30) {
            // Potentiate EMG weight
            this.config.inputWeightEMG = Math.min(25.0, this.config.inputWeightEMG + this.config.stdpRate * 1.2);
          }
        }
      }
    }

    return {
      timestamp: timeMs,
      eegValue: eeg,
      emgValue: emg,
      eegSpike,
      emgSpike,
      membranePotential: this.vMem,
      outputSpike
    };
  }
}
