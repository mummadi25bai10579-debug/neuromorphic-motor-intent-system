import React, { useState, useEffect, useMemo } from 'react';
import { RealTimeChart } from '../components/RealTimeChart';
import { PatientSelector } from '../components/PatientSelector';
import { SpikeRasterChart } from '../components/SpikeRasterChart';
import { KpiOverview } from '../components/KpiOverview';
import { RehabRecommendationPanel } from '../components/RehabRecommendationPanel';
import { fetchPrediction } from '../api';
import { patientProfiles } from '../data/patients';
import { Patient } from '../types';
import eegData from '../data/eeg_samples.json';

const patientSubjectMap: Record<string, string> = {
  "pat-elena": "S001",
  "pat-david": "S002",
  "pat-marcus": "S003"
};

interface MotorIntentDashboardProps {
  selectedPatient: Patient;
  setSelectedPatient: (p: Patient) => void;
}

export const MotorIntentDashboard: React.FC<MotorIntentDashboardProps> = ({ selectedPatient, setSelectedPatient }) => {
  const [dataStream, setDataStream] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<{ motor_intent: boolean, confidence: number } | null>(null);

  const filteredPatientData = useMemo(() => {
    const subject = patientSubjectMap[selectedPatient.id] || "S001";
    return eegData.filter(d => d.subject === subject);
  }, [selectedPatient]);

  useEffect(() => {
    let index = 0;
    setDataStream([]);
    const interval = setInterval(() => {
      if (index >= filteredPatientData.length) index = 0;
      const currentEntry = filteredPatientData[index];
      setDataStream(prev => [...prev.slice(-30), currentEntry]);
      
      // Async prediction update (non-blocking)
      fetchPrediction(currentEntry)
        .then(setPrediction)
        .catch(console.error);
        
      index++;
    }, 500);
    return () => clearInterval(interval);
  }, [filteredPatientData]);

  const { avgEEG, avgEMG, spikeRate } = useMemo(() => {
    if (dataStream.length === 0) return { avgEEG: 0, avgEMG: 0, spikeRate: 0 };
    const avgEEG = dataStream.reduce((acc, d) => acc + Math.abs(d.eegValue), 0) / dataStream.length;
    const avgEMG = dataStream.reduce((acc, d) => acc + Math.abs(d.emgValue), 0) / dataStream.length;
    const spikeRate = dataStream.filter(d => d.eegSpike).length * (1000 / 500); // Simple Hz estimate based on 500ms
    return { avgEEG, avgEMG, spikeRate };
  }, [dataStream]);

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 pb-6 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight text-white uppercase tracking-widest">
          Neuromorphic <span className="text-emerald-500">Clinical BCI</span>
        </h1>
        <PatientSelector
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          onUpdatePatient={() => {}}
          generateSyntheticWaveform={() => {}}
          isGeneratingSynthetic={false}
          syntheticNotes=""
        />
      </header>
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
           <div className="grid md:grid-cols-2 gap-4">
            <RealTimeChart data={dataStream} dataKey="eegValue" color="#3b82f6" title="EEG Signal" />
            <RealTimeChart data={dataStream} dataKey="emgValue" color="#ef4444" title="EMG Signal" />
           </div>
           <SpikeRasterChart data={dataStream} />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <KpiOverview accuracy={94.5} latency={12.4} power={4.2} />
          
          <div className={`p-8 rounded-2xl border ${prediction?.motor_intent ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-red-950/20 border-red-500/50'}`}>
            <h2 className="text-xs uppercase text-zinc-400 font-bold tracking-widest">Motor Intent</h2>
            <div className={`text-5xl font-mono mt-3 ${prediction?.motor_intent ? 'text-emerald-400' : 'text-red-400'}`}>
              {prediction?.motor_intent ? 'ACTIVE' : 'RESTING'}
            </div>
            <p className="text-zinc-500 text-sm mt-3 font-mono">Confidence: {(prediction?.confidence ? prediction.confidence * 100 : 0).toFixed(1)}%</p>
          </div>

          <RehabRecommendationPanel 
            patient={selectedPatient} 
            motorIntentConfidence={prediction?.confidence || 0}
            avgEEG={avgEEG}
            avgEMG={avgEMG}
            spikeRate={spikeRate}
            recoveryProgress={72} 
          />
        </div>
      </div>
    </div>
  );
};
