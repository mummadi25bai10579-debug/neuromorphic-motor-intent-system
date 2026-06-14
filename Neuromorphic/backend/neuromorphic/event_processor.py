class EventProcessor:
    def __init__(self, spike_rate_window=20):
        self.spike_rate_window = spike_rate_window
        self.buffer = []

    def process(self, spike):
        """Processes events only when a spike occurs."""
        if spike != 0:
            self.buffer.append(spike)
            if len(self.buffer) > self.spike_rate_window:
                self.buffer.pop(0)
        
        return len(self.buffer) / self.spike_rate_window
