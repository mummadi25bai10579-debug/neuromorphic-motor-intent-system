import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

def load_and_preprocess(json_data):
    df = pd.DataFrame(json_data)
    
    # Clean missing values
    df = df.fillna(method='ffill').fillna(0)
    
    # 4. Create labels (1 if emg > 12 else 0)
    df['intent'] = (df['emg'] > 12).astype(int)
    
    # 5. Spike encoding
    df['prev_eeg'] = df['eeg'].shift(1).fillna(0)
    threshold = 0.00005 # Example threshold
    df['spike'] = (abs(df['eeg'] - df['prev_eeg']) > threshold).astype(int)
    
    # 6. Feature Engineering
    # Rolling features over a window of 10 samples
    window = 10
    df['mean_eeg'] = df['eeg'].rolling(window=window).mean().fillna(0)
    df['std_eeg'] = df['eeg'].rolling(window=window).std().fillna(0)
    df['mean_emg'] = df['emg'].rolling(window=window).mean().fillna(0)
    df['std_emg'] = df['emg'].rolling(window=window).std().fillna(0)
    df['spike_rate'] = df['spike'].rolling(window=window).mean().fillna(0)
    
    # Normalize features
    scaler = StandardScaler()
    features = ['mean_eeg', 'std_eeg', 'mean_emg', 'std_emg', 'spike_rate']
    df[features] = scaler.fit_transform(df[features])
    
    return df, features
