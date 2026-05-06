/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Terminal, History, Database, Cpu, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraView } from './components/CameraView';
import { detectMask, MaskDetectionResult } from './services/maskDetection';

export default function App() {
  const [currentResult, setCurrentResult] = useState<MaskDetectionResult | null>(null);
  const [history, setHistory] = useState<(MaskDetectionResult & { id: string; timestamp: string })[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (base64: string) => {
    setIsProcessing(true);
    const result = await detectMask(base64);
    setCurrentResult(result);
    
    // Add to history
    const entry = {
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    setHistory(prev => [entry, ...prev].slice(0, 5));
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-bottom border-neutral-900 bg-neutral-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-lg font-medium tracking-tight text-white">MaskSense <span className="text-neutral-500 font-mono text-xs ml-2">v1.2.0</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">
              <Cpu className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-[11px] uppercase tracking-widest font-mono text-neutral-400">Engine: Scikit-Core</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Camera Feed */}
        <div className="lg:col-span-8 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500">Live Surveillance Stream</h2>
              <div className="flex items-center space-x-2 text-[11px] text-neutral-600 font-mono italic">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Active Inference Loop</span>
              </div>
            </div>
            <CameraView onCapture={handleCapture} isProcessing={isProcessing} />
          </section>

          {/* Model Deployment Terminal */}
          <section className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 underline decoration-neutral-800 underline-offset-4">Kernel Output</h3>
            </div>
            <div className="font-mono text-xs space-y-1.5 min-h-24 max-h-48 overflow-y-auto custom-scrollbar">
              <p className="text-neutral-500 italic">[{new Date().toLocaleTimeString()}] System initialization...</p>
              <p className="text-green-500/80">$ loading weights from model.pkl...</p>
              <p className="text-neutral-400">$ input_shape: (batch, 100) features</p>
              <p className="text-neutral-400">$ scikit-learn random_forest precision: 0.94</p>
              <AnimatePresence mode="popLayout">
                {currentResult && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-1"
                  >
                    <p className="text-blue-400">{`> inference running [ID: ${Math.random().toString(36).substr(2, 6)}]`}</p>
                    <p className={currentResult.prediction === 'Wearing Mask' ? 'text-green-400' : 'text-red-400'}>
                      {`> prediction: ${currentResult.prediction} (confidence: ${(currentResult.confidence * 100).toFixed(2)}%)`}
                    </p>
                    <p className="text-neutral-500">{`> note: ${currentResult.reasoning}`}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Right Column: Console & History */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Active Status Card */}
          <section className="p-1 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-800 shadow-2xl">
            <div className="bg-neutral-950 rounded-xl p-8 text-center space-y-6">
              <div className="flex justify-center">
                <AnimatePresence mode="wait">
                  {!currentResult ? (
                    <motion.div key="idle" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}>
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-neutral-800 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-neutral-700" />
                      </div>
                    </motion.div>
                  ) : currentResult.prediction === 'Wearing Mask' ? (
                    <motion.div key="safe" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}>
                      <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <ShieldCheck className="w-12 h-12 text-green-500" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="alert" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}>
                      <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <ShieldAlert className="w-12 h-12 text-red-500" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-mono mb-1">Current Status</h3>
                <p className={`text-2xl font-light tracking-tight ${!currentResult ? 'text-neutral-600' : currentResult.prediction === 'Wearing Mask' ? 'text-green-400' : 'text-red-400'}`}>
                  {!currentResult ? 'Scanning...' : currentResult.prediction}
                </p>
                {currentResult && (
                  <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-400 italic">Confidence {(currentResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Telemetry/History List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-neutral-500" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Inference History</h3>
              </div>
              <Database className="w-3.5 h-3.5 text-neutral-700" />
            </div>
            
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {history.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="grid grid-cols-5 items-center p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:bg-neutral-800/50 transition-colors cursor-default"
                  >
                    <div className="col-span-1 text-[10px] font-mono text-neutral-600 italic">
                      {item.timestamp}
                    </div>
                    <div className="col-span-3 flex items-center space-x-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.prediction === 'Wearing Mask' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-[11px] font-medium ${item.prediction === 'Wearing Mask' ? 'text-green-500/80' : 'text-red-500/80'}`}>
                        {item.prediction}
                      </span>
                    </div>
                    <div className="col-span-1 text-right text-[10px] font-mono text-neutral-500">
                      {(item.confidence * 100).toFixed(0)}%
                    </div>
                  </motion.div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-neutral-900 rounded-xl">
                    <p className="text-[11px] font-mono text-neutral-700 italic">No telemetry data recorded</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>

        </div>
      </main>

      <footer className="mt-12 border-t border-neutral-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            Designed for Real-time Compliance & Security
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 font-mono text-[10px] text-neutral-500">
            <span>MOD: RF-CLF</span>
            <span>DATA: VISION-LITE</span>
            <span>© 2026 MASKSENSE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
