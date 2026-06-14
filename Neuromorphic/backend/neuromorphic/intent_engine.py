class IntentEngine:
    def predict(self, eeg_spike_rate, emg_activity):
        """Predicts motor intent based on spike rate and EMG."""
        if emg_activity > 20 and eeg_spike_rate > 0.5:
            return "Strong Intent", 0.95
        elif emg_activity > 10 and eeg_spike_rate > 0.2:
            return "Weak Intent", 0.65
        else:
            return "No Intent", 0.2
