import numpy as np

class AnomalyDetector:
    def __init__(self, window_size=50):
        self.window_size = window_size
        self.history = []

    def check(self, value):
        self.history.append(value)
        if len(self.history) > self.window_size:
            self.history.pop(0)
            
            mean = np.mean(self.history)
            std = np.std(self.history)
            
            if abs(value - mean) > 3 * std:
                return True # Anomaly detected
        return False
