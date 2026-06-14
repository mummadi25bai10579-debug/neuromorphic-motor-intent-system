const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchPrediction(data: { eeg: number, emg: number, timestamp: number, subject: string }) {
  const response = await fetch(`${API_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch prediction');
  }
  return response.json();
}
