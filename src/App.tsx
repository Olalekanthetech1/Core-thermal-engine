import React, { useState, useEffect } from 'react';
import { Settings, AlertTriangle, CheckCircle, Activity, Info, Zap, Cpu } from 'lucide-react';

type SafetyStatus = 'GREEN' | 'YELLOW' | 'RED' | 'IDLE';

interface CalculationResult {
  heatInput: number;
  status: SafetyStatus;
  message: string;
  aiConsultantAdvice?: string | null;
}

export default function App() {
  const [alloy, setAlloy] = useState('6061');
  const [thickness, setThickness] = useState<number | ''>(5);
  const [amperage, setAmperage] = useState<number | ''>(120);
  const [voltage, setVoltage] = useState<number | ''>(15);
  const [speed, setSpeed] = useState<number | ''>(4);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchPrediction() {
      if (thickness === '' || amperage === '' || voltage === '' || speed === '' || speed === 0 || thickness === 0) {
        setResult(null);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch('/api/weld-predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            alloy,
            thickness,
            amperage,
            voltage,
            speed
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (active) {
            setResult(data);
          }
        } else {
          console.error("API error");
          if (active) setResult(null);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        if (active) setResult(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    // Debounce the call to prevent spamming while typing
    const timeoutId = setTimeout(() => {
      fetchPrediction();
    }, 500);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [alloy, thickness, amperage, voltage, speed]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center space-x-3 pb-6 border-b border-slate-800">
          <div className="p-3 bg-cyan-950/50 rounded-lg border border-cyan-900/50">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Core Thermal Engine</h1>
            <p className="text-sm text-slate-400 mt-1">AI Material Defect Predictor (Assignment 2)</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Input Form Module */}
          <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-medium text-slate-200">Data Input Payload</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Alloy Type</label>
                <select
                  value={alloy}
                  onChange={(e) => setAlloy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all appearance-none"
                >
                  <option value="6061">Aluminum 6061 (General Purpose)</option>
                  <option value="5083">Aluminum 5083 (Marine Grade)</option>
                  <option value="7075">Aluminum 7075 (Aerospace)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Material Thickness</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={thickness}
                      onChange={(e) => setThickness(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-4 pr-12 py-2.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      placeholder="e.g. 5.0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">mm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Travel Speed (S)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-4 pr-16 py-2.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      placeholder="e.g. 4.0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">mm/s</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Current / Amperage (A)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={amperage}
                      onChange={(e) => setAmperage(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-4 pr-12 py-2.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      placeholder="e.g. 150"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">A</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Voltage (V)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={voltage}
                      onChange={(e) => setVoltage(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-4 pr-12 py-2.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      placeholder="e.g. 15.0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">V</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Engine Output Module */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex-1 flex flex-col">
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-medium text-slate-200">Engine Output</h2>
              </div>

              {!result && !isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50 flex-grow">
                  <Info className="w-8 h-8 text-slate-600 mb-3" />
                  <p className="text-sm text-slate-400">Awaiting valid input parameters to calculate thermal dynamics.</p>
                </div>
              ) : isLoading && !result ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50 flex-grow">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-3"></div>
                  <p className="text-sm text-slate-400">Calculating thermals & running AI analysis...</p>
                </div>
              ) : result ? (
                <div className="space-y-6 flex-grow relative">
                  {isLoading && (
                    <div className="absolute -top-4 -right-4 p-2 bg-slate-900 rounded-bl-xl border-b border-l border-slate-800">
                      <div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
                    </div>
                  )}
                  {/* Heat Input Display */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-slate-500 mb-1">Calculated Heat Input (H)</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-light text-slate-100 tracking-tight">
                        {result.heatInput.toFixed(1)}
                      </span>
                      <span className="text-slate-400 font-medium">J/mm</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <code className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                        H = ({amperage}A × {voltage}V) / {speed}mm/s
                      </code>
                    </div>
                  </div>

                  {/* Dynamic Status Banner */}
                  <div className={`rounded-xl p-5 shadow-lg ${
                    result.status === 'GREEN' ? 'bg-emerald-600 text-white' :
                    result.status === 'YELLOW' ? 'bg-amber-500 text-slate-900' :
                    'bg-rose-600 text-white'
                  }`}>
                    <div className="flex items-center space-x-3 mb-2">
                      {result.status === 'GREEN' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <AlertTriangle className="w-6 h-6" />
                      )}
                      <h3 className="font-bold tracking-wide text-lg">
                        STATUS: {result.status}
                      </h3>
                    </div>
                    <p className="font-medium leading-relaxed opacity-90">
                      {result.message}
                    </p>
                  </div>

                  {/* AI Consultant View */}
                  {result.status !== 'GREEN' && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                      <div className="flex items-center space-x-2 mb-3">
                        <Cpu className={`w-5 h-5 ${result.status === 'YELLOW' ? 'text-amber-400' : 'text-rose-400'}`} />
                        <h4 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">AI Metallurgical Consultant Advice</h4>
                      </div>
                      
                      {!result.aiConsultantAdvice && isLoading ? (
                         <div className="flex items-center space-x-3 text-slate-400 py-2">
                           <div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
                           <span className="text-sm">Consulting AI for structural adjustments...</span>
                         </div>
                      ) : (
                        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {result.aiConsultantAdvice}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Payload Preview */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">JSON Payload Output</p>
                    <pre className="text-xs text-slate-400 p-2 bg-slate-900 rounded border border-slate-800">
{JSON.stringify({
  heatInput: Number(result.heatInput.toFixed(2)),
  status: result.status,
  message: result.message,
  ...(result.aiConsultantAdvice ? { aiConsultantAdvice: result.aiConsultantAdvice } : {})
}, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
