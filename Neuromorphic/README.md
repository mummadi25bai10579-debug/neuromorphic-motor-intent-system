# Neuromorphic Clinical Rehabilitation AI Platform

A professional-grade clinical rehabilitation platform for stroke neurorehabilitation. It bridges the gap between raw biological signals (EEG/EMG) and assistive actuation devices (exoskeletons/FES) using edge-directed Spiking Neural Networks (SNNs) and neuromorphic computing principles.

Designed for clinical engineers and rehabilitation therapists to architect, simulate, and fine-tune biomimetic neural control systems tailored to individual patient motor recovery profiles.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Architecture](#solution-architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Workflow](#system-workflow)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Performance Characteristics](#performance-characteristics)
- [Disclaimer](#disclaimer)

---

## Problem Statement

Conventional stroke rehabilitation is dependent on continuous therapist intervention, which limits scalability, consistency, and session duration. Existing automated assistive devices introduce three critical failure points:

- **High control latency** — delayed motor intent detection reduces therapeutic efficacy and patient trust
- **Excessive power consumption** — prevents practical deployment in portable or wearable edge configurations
- **Static control logic** — systems fail to adapt to the progressive neural reorganization occurring across a patient's rehabilitation trajectory

This platform addresses all three through a neuromorphic computational model that mirrors the brain's own sparse, event-driven signaling mechanisms.

---

## Solution Architecture

The platform implements a multi-stage hybrid neuromorphic pipeline:

```
Biosignal Acquisition (EEG / EMG)
            |
            v
  Spike Delta Encoder
  [Continuous voltage --> sparse spike representation]
            |
            v
  LIF Neuron Core
  [Leaky Integrate-and-Fire SNN processing on simulated edge hardware]
            |
            v
  STDP Adaptation Layer
  [Spike-Timing-Dependent Plasticity -- real-time synaptic weight updates]
            |
            v
  Motor Intent Classifier
            |
            v
  Actuation Trigger (FES / Exoskeleton)
```

| Pipeline Stage | Description |
|---|---|
| Biosignal Input | Raw EEG capturing motor cortex Mu rhythms alongside EMG muscle activity recordings |
| SNN Processing | Asynchronous Spike Delta Encoders translate analog voltage into sparse spikes processed by LIF neurons on mimicked neuromorphic edge hardware |
| Dynamic Adaptation | STDP continuously adjusts synaptic weights in response to patient neural state, enabling session-over-session plasticity tracking |
| Clinical AI Copilot | Gemini-powered assistant supports real-time parameter tuning, threshold calibration, and rehabilitation metric interpretation |

---

## Key Features

### Neuromorphic Pipeline Visualization

An interactive topological interface renders the complete signal pathway from raw EEG/EMG acquisition through spike encoding, SNN processing, and final actuation command generation. Clinicians can observe the system state at each stage in real time.

### Clinical Copilot

An AI-powered co-pilot integrated directly into the clinical dashboard. Clinicians can submit natural language queries about current neural metrics and SNN configuration. The copilot provides diagnostic guidance on calibrating voltage thresholds (`V_th`), adjusting leak parameters, optimizing synaptic learning rates, and interpreting rehabilitation progress indicators.

### Biomimetic Data Simulation

AI-driven synthetic patient data generation produces clinically realistic EEG/EMG signals parameterized to specific rehabilitation intents and neurological deficit profiles. Enables system testing, clinician training, and algorithm validation without requiring live patient sessions.

### LIF Neuron Graph Monitoring

Real-time visualization of individual Leaky Integrate-and-Fire neuron dynamics, including membrane potential trajectories, integration curves, threshold crossings, and output spike emission events.

### Patient Management Module

Centralized patient profile administration supporting stroke assessment records, historical session data, biosignal archives, and longitudinal motor recovery tracking across rehabilitation episodes.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Recharts, Lucide React, Motion |
| Backend | Express (Node.js), tsx |
| AI Integration | @google/genai SDK (Gemini API) |
| Neuromorphic Engine | Custom biomimetic SNN simulation implementing LIF neuron models, STDP learning rules, and Spike Delta modulation |
| Build Tooling | Vite |

---

## System Workflow

**Step 1 — Patient Assessment**
The clinician selects an existing patient profile or initiates a new session with AI-generated synthetic biosignal data representative of the target neurological deficit.

**Step 2 — Signal Injection**
Raw EEG and EMG data is fed into the pipeline via internal stream, file upload, or live microphone/sensor input depending on the clinical setup.

**Step 3 — Neuromorphic Translation**
Incoming analog signals are encoded into spike trains by the Spike Delta Encoder, processed through the LIF SNN core, and decoded into a classified motor intent output.

**Step 4 — Actuation Trigger**
Upon detection of an active motor intent event above the configured firing threshold, the system dispatches a trigger signal to the connected FES unit or exoskeleton controller.

**Step 5 — Clinical Optimization**
The clinician uses the AI Copilot and the Chip Architecture panel to iteratively adjust SNN parameters — including `V_th`, leak constants, and synaptic weights — based on observed latency, trigger efficiency, and power metrics.

---

## Installation

### Prerequisites

- Node.js v18 or higher
- A valid Gemini API key from Google AI Studio

### Setup

Clone the repository:

```bash
git clone <repository-url>
cd neuromorphic-rehab-platform
```

Install all dependencies:

```bash
npm install
```

Configure environment variables:

```bash
cp .env.example .env
```

Open `.env` and set your API key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

---

## Usage Guide

### Clinical Dashboard

The primary landing interface. Use it to manage patient profiles, ingest EEG/EMG data streams, monitor real-time intent detection status, and interact with the Clinical Copilot chat panel for diagnostic queries.

### Neuromorphic Core View

Toggle to the neuromorphic layout to inspect and modify the SNN architecture while the system is running. The Chip Architecture panel exposes controls for voltage thresholds, synaptic weight matrices, leak rates, and STDP learning mode toggles.

### Clinical Copilot

Accessible from the dashboard chat panel. Accepts natural language input describing current patient state, observed SNN behavior, or rehabilitation targets. Returns clinically grounded parameter recommendations and diagnostic observations based on the live system configuration.

---

## Performance Characteristics

| Metric | Characteristic |
|---|---|
| Edge Power Efficiency | Neuromorphic SNN architecture operates at simulated micro-watt power levels, consistent with hardware neuromorphic chip benchmarks |
| Control Latency | Motor intent classification and actuation trigger dispatch operates within sub-millisecond response windows |
| Adaptive Learning | STDP-enabled synaptic plasticity dynamically responds to evolving patient neural deficits across training sessions without manual recalibration |

---

## Disclaimer

This platform is a clinical research prototype developed for rehabilitation engineering research and educational purposes. It is not a certified or approved medical device and must not be used as the sole basis for clinical decision-making.

All rehabilitation strategies, SNN configurations, and actuation protocols derived from this system must be reviewed and validated by qualified medical professionals and certified rehabilitation specialists prior to any patient application.

---

## Authors

Developed by the Quantum drift
