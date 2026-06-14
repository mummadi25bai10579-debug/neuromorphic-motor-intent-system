# Neuromorphic EEG-EMG Motor Intent Detection System

A low-latency, neuromorphic-inspired system to detect motor intent in stroke patients for personalized rehabilitation support using real-time EEG and EMG analysis.

## Problem Statement
Stroke rehabilitation requires precise, personalized, and low-latency feedback. Current systems often fail to bridge the gap between intent detection and adaptive feedback efficiently, leading to sub-optimal recovery outcomes.

## Proposed Solution
A neuromorphic architecture that processes EEG and EMG signals using event-driven spike encoding, significantly reducing computational overhead while enabling rapid detection of motor intent.

## Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Backend:** FastAPI, Python, Scikit-learn, Pandas
- **Neuromorphic Layer:** Event-driven spike encoding, Intent Prediction Engine
- **Data:** EEG/EMG signal analysis

## Features
- **Real-time Visualization:** Live telemetry for EEG and EMG signals.
- **Motor Intent Detection:** High-confidence prediction powered by a Random Forest ML pipeline.
- **Explainable AI:** Neuro-analytic feedback showing spike rates and EMG activity.
- **Neuromorphic Core:** Event-based processing for efficient signal tracking.
