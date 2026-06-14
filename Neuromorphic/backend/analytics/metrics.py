import time

class MetricsTracker:
    def __init__(self):
        self.latencies = []

    def record_latency(self, start_time):
        self.latencies.append(time.time() - start_time)
        
    def get_throughput(self):
        return len(self.latencies) / sum(self.latencies) if self.latencies else 0
