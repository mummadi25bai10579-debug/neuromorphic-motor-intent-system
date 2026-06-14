import { Patient } from "../types";

export const patientProfiles: Patient[] = [
  {
    id: "pat-elena",
    name: "Elena Rostova",
    age: 62,
    condition: "Post-Stroke Left Hemiparesis (Cortical Infarction)",
    onset: "3 months post-ictus",
    affectedSide: "Left",
    baselineMu: 18.5,  // Raw resting brain amplitude over sensory cortex (uV)
    activeMu: 7.2,     // Average target motor imagery desynchronized power (uV)
    baselineEMG: 6.0,  // Rested extensor noise floor (uV)
    activeEMG: 85.0,   // Flexion capacity voltage (uV) - diminished muscle feedback
    rehabGoal: "Grasp and lift objects with interactive soft robotic glove assistance",
    notes: "Elena shows strong motor imagery focus (good Mu rhythm suppression) but struggles to activate bicep/extensor motor units. Requires high EEG synaptic gain and low SNN spike threshold."
  },
  {
    id: "pat-david",
    name: "David Kim",
    age: 49,
    condition: "Right-sided Hemiplegia (Subcortical Stroke)",
    onset: "9 months post-ictus",
    affectedSide: "Right",
    baselineMu: 14.1,
    activeMu: 11.2,    // Poor desynchronization
    baselineEMG: 4.5,
    activeEMG: 220.0,  // Good residual EMG but highly spastic muscle activity
    rehabGoal: "Re-train forearm control with functional electrical stimulation (FES) sleeve",
    notes: "David has low brain wave intent differentiation (poor Mu suppression) due to extensive subcortical damage, but has strong, spastic EMG signals. SNN should be weighted heavily toward EMG with robust noise filtering thresholds."
  },
  {
    id: "pat-marcus",
    name: "Marcus Aurelius Vance",
    age: 71,
    condition: "Bilateral Lower Limb Spasticity & Upper Hand Deficit",
    onset: "1 year post-ictus",
    affectedSide: "Bilateral",
    baselineMu: 22.0,
    activeMu: 8.5,
    baselineEMG: 8.0,
    activeEMG: 140.0,
    rehabGoal: "Adaptive wrist flexion triggering motorized wrist exoskeleton",
    notes: "Marcus shows late-stage recovery potential. Significant cross-talk and high baseline EMG noise. Needs strict neuromorphic Delta encoding threshold and adaptive STDP learning turned on."
  }
];
