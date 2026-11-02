import React from 'react';
import { 
  Network, 
  Calculator, 
  Send, 
  Radio, 
  Terminal, 
  GraduationCap, 
  Layers, 
  PlusCircle, 
  RotateCcw, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface HeaderProps {
  onOpenSubnetCalc: () => void;
  onOpenPingSim: () => void;
  onOpenVlanManager: () => void;
  onToggleWlanCoverage: () => void;
  showWlanCoverage: boolean;
  onOpenConfigGen: () => void;
  onOpenLabScenarios: () => void;
  onOpenAddDevice: () => void;
  onResetTopology: () => void;
  onExportImport: () => void;
  deviceCount: number;
  vlanCount: number;
  wifiIssuesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSubnetCalc,
  onOpenPingSim,
  onOpenVlanManager,
  onToggleWlanCoverage,
  showWlanCoverage,
  onOpenConfigGen,
  onOpenLabScenarios,
  onOpenAddDevice,
  onResetTopology,
  onExportImport,
  deviceCount,
  vlanCount,
  wifiIssuesCount,
}) => {
  return (
    <header className="h-16 bg-[#0d1424] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 shadow-lg z-20">
      {/* Brand & Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#0d1424] rounded-[10px] flex items-center justify-center">
            <Network className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-white tracking-wide">
              Enterprise LAN / WLAN Studio
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
              v2.5 Pro
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-Tier Campus Backbone • VLSM Engine • 802.11ax Wi-Fi RF • Packet Ping
          </p>
        </div>
      </div>

      {/* Main Action Navigation */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenSubnetCalc}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/80 rounded-lg transition shadow-sm"
          title="Variable Length Subnet Masking (VLSM) Calculator & IP Planner"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span>VLSM Subnetting</span>
        </button>

        <button
          onClick={onOpenVlanManager}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/80 rounded-lg transition shadow-sm"
          title="Manage VLANs, Subnets & 802.1Q tags"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>VLANs ({vlanCount})</span>
        </button>

        <button
          onClick={onToggleWlanCoverage}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition border active:scale-95 shadow-sm ${
            showWlanCoverage
              ? 'bg-cyan-600/30 text-cyan-200 border-cyan-500/50 shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-300 border-slate-700/80 hover:bg-slate-700'
          }`}
          title="Toggle 2.4GHz / 5GHz Wi-Fi Radio Coverage Heatmap Circles"
        >
          <Radio className={`w-3.5 h-3.5 ${showWlanCoverage ? 'text-cyan-300' : 'text-slate-400'}`} />
          <span>RF Heatmap</span>
          {wifiIssuesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={onOpenPingSim}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-lg shadow-md shadow-blue-600/30 transition"
          title="Simulate ICMP Ping and Inspect OSI Layer packet trajectory"
        >
          <Send className="w-3.5 h-3.5 text-cyan-200" />
          <span>Simulate Ping</span>
        </button>

        <button
          onClick={onOpenConfigGen}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/80 rounded-lg transition shadow-sm"
          title="Generate Production Cisco IOS & Aruba CX CLI Scripts"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>CLI Configs</span>
        </button>

        <button
          onClick={onOpenLabScenarios}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-purple-300 bg-purple-900/30 hover:bg-purple-800/40 active:scale-95 border border-purple-700/50 rounded-lg transition shadow-sm"
          title="Interactive Enterprise Troubleshooting Challenges"
        >
          <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
          <span>Lab Challenges</span>
        </button>
      </div>

      {/* Right Tools: Add Device, Reset, Export */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenAddDevice}
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/40 rounded-lg transition"
          title="Add Device to Topology"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Node</span>
        </button>

        <button
          onClick={onExportImport}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition"
          title="Export / Import Network State (JSON)"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onResetTopology}
          className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition"
          title="Reset Topology to Enterprise Campus Default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
