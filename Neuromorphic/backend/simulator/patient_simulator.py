import numpy as np

class PatientSimulator:
    def simulate_eeg(self, trend):
        # Simulate EEG based on recovery trend
        return np.random.normal(0, 0.0001) + (trend * 0.00001)

    def simulate_emg(self, trend):
        # Simulate EMG based on recovery trend
        return np.random.normal(10, 5) + (trend * 2)

    def get_progress_data(self, history):
        # Calculate improvement percentage
        return (history[-1] - history[0]) / history[0] * 100
