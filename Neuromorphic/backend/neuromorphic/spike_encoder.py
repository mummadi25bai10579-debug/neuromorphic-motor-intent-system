import numpy as np

class SpikeEncoder:
    def __init__(self, threshold=0.0001):
        self.threshold = threshold
        self.last_value = 0

    def encode(self, signal):
        """Delta-Sigma spike encoding."""
        spikes = []
        for value in signal:
            diff = value - self.last_value
            if abs(diff) > self.threshold:
                spike = 1 if diff > 0 else -1
                spikes.append(spike)
                self.last_value = value
            else:
                spikes.append(0)
        return spikes
