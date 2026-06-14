import React, { useState, useEffect } from 'react';
import { RealTimeChart } from './RealTimeChart';
import { fetchPrediction } from '../api';
import eegData from '../data/eeg_samples.json';

export const MotorIntentDashboard: React.FC = () => {
  const [dataStream, setDataStream] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<{ motor_intent: boolean, confidence: number } | null>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(async () => {
      if (index >= eegData.length) index = 0;
      const currentEntry = eegData[index];
      
      setDataStream(prev => [...prev.slice(-20), currentEntry]);

      try {
        const result = await fetchPrediction(currentEntry);
        setPrediction(result);
      } catch (e) {
        console.error(e);
      }
      index++;
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">Motor Intent Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <RealTimeChart data={dataStream} dataKey="eeg" color="#3b82f6" title="EEG Signal" />
        <RealTimeChart data={dataStream} dataKey="emg" color="#ef4444" title="EMG Signal" />
      </div>

      <div className={`p-6 rounded-lg shadow-lg border-2 text-center ${prediction?.motor_intent ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
        <h2 className="text-2xl font-bold">{prediction?.motor_intent ? 'Intent Detected' : 'No Intent Detected'}</h2>
        <p className="text-xl mt-2">Confidence: {(prediction?.confidence ? prediction.confidence * 100 : 0).toFixed(1)}%</p>
      </div>
    </div>
  );
};
