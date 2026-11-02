import React, { useState } from 'react';
import { LabScenario, Device, Link, VLAN } from '../types/network';
import { LAB_SCENARIOS } from '../data/labScenarios';
import { 
  X, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Play, 
  RotateCcw, 
  Award, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LabScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  links: Link[];
  vlans: VLAN[];
  onLoadScenario: (scenario: LabScenario) => void;
}

export const LabScenariosModal: React.FC<LabScenariosModalProps> = ({
  isOpen,
  onClose,
  devices,
  links,
  vlans,
  onLoadScenario,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(LAB_SCENARIOS[0].id);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<{ passed: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const activeScenario = LAB_SCENARIOS.find(s => s.id === selectedScenarioId) || LAB_SCENARIOS[0];

  const handleVerify = () => {
    const res = activeScenario.validationCheck(devices, links, vlans);
    setEvalResult(res);
    if (res.passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11192d]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Enterprise Network Engineering Lab Challenges
              </h2>
              <p className="text-xs text-slate-400">
                Hands-on troubleshooting for CCNA / CCNP / Enterprise Wi-Fi engineers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Scenario Selector Sidebar */}
          <div className="w-64 border-r border-slate-800 bg-[#0a0f1c] p-3 space-y-2 overflow-y-auto">
            <div className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-wider">
              Scenarios ({LAB_SCENARIOS.length})
            </div>

            {LAB_SCENARIOS.map(scen => {
              const isSelected = scen.id === selectedScenarioId;
              return (
                <button
                  key={scen.id}
                  onClick={() => {
                    setSelectedScenarioId(scen.id);
                    setShowHint(false);
                    setEvalResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/50 text-white shadow-md'
                      : 'bg-[#11192d] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {scen.category}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {scen.difficulty}
                    </span>
                  </div>
                  <div className="font-semibold text-xs leading-snug">
                    {scen.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scenario Details & Playground */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            <div className="bg-[#11192d] p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>{activeScenario.title}</span>
                </h3>
                <span className="text-xs font-mono text-cyan-400">
                  Category: {activeScenario.category}
                </span>
              </div>

              <div className="text-slate-300 leading-relaxed">
                {activeScenario.description}
              </div>

              <div className="p-3 bg-[#0a0f1c] rounded-lg border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Target Objective:</span>
                </div>
                <div className="text-slate-200 font-medium">
                  {activeScenario.objective}
                </div>
              </div>

              {/* Actions: Inject Broken State */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    onLoadScenario(activeScenario);
                    setEvalResult(null);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold shadow transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>1. Load Broken State into Topology</span>
                </button>

                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{showHint ? 'Hide Hint' : 'View Engineering Hint'}</span>
                </button>
              </div>

              {showHint && (
                <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-cyan-200 text-xs">
                  <span className="font-bold">Hint: </span>
                  {activeScenario.hint}
                </div>
              )}
            </div>

            {/* Validation Evaluation Box */}
            <div className="bg-[#11192d] p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Solution Validation Engine</span>
                <button
                  onClick={handleVerify}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. Verify My Fix</span>
                </button>
              </div>

              {evalResult && (
                <div className={`p-3 rounded-lg border flex items-center space-x-2.5 ${
                  evalResult.passed
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}>
                  {evalResult.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-xs">
                      {evalResult.passed ? 'Challenge Solved Successfully!' : 'Fix Incomplete'}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {evalResult.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0a0f1c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
