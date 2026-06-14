import numpy as np
import json

def emg_threshold_labeling(emg_signals, threshold=15.0):
    """Labels motor intent based on EMG signal amplitude."""
    return [1 if s > threshold else 0 for s in emg_signals]

def spike_encode(signals, threshold=0.1):
    """Delta-Sigma spike encoding."""
    spikes = []
    accumulator = 0
    for s in signals:
        accumulator += s
        if accumulator >= threshold:
            spikes.append(1)
            accumulator -= threshold
        elif accumulator <= -threshold:
            spikes.append(-1)
            accumulator += threshold
        else:
            spikes.append(0)
    return spikes

def process_data(input_file):
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    emg_vals = [d['emg'] for d in data]
    eeg_vals = [d['eeg'] for d in data]
    
    # 3. Create labels automatically
    labels = emg_threshold_labeling(emg_vals)
    
    # 4. Spike encoding
    eeg_spikes = spike_encode(eeg_vals)
    
    processed_data = []
    for i in range(len(data)):
        processed_data.append({
            **data[i],
            "label": labels[i],
            "spike": eeg_spikes[i]
        })
        
    return processed_data

if __name__ == "__main__":
    # Assuming the input file exists
    processed = process_data('src/data/eeg_samples.json')
    with open('src/data/processed_data.json', 'w') as f:
        json.dump(processed, f)
