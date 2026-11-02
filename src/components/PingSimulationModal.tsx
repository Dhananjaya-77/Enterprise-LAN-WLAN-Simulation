import React, { useState, useEffect } from 'react';
import { 
  Device, 
  Link, 
  VLAN, 
  SimulationResult, 
  PacketHop 
} from '../types/network';
import { simulatePing } from '../utils/packetSimulator';
import { 
  X, 
  Send, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Layers, 
  ShieldAlert, 
  Activity 
} from 'lucide-react';

interface PingSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  links: Link[];
  vlans: VLAN[];
  onSimulationStateChange: (sim: SimulationResult | null, hopIndex: number) => void;
}

export const PingSimulationModal: React.FC<PingSimulationModalProps> = ({
  isOpen,
  onClose,
  devices,
  links,
  vlans,
  onSimulationStateChange,
}) => {
  const [sourceId, setSourceId] = useState<string>('client-pc1');
  const [destId, setDestId] = useState<string>('srv-web');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [currentHopIndex, setCurrentHopIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Sync animation position with parent canvas
  useEffect(() => {
    onSimulationStateChange(simResult, currentHopIndex);
  }, [simResult, currentHopIndex]);

  // Auto-play interval
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && simResult && simResult.hops.length > 0) {
      interval = setInterval(() => {
        setCurrentHopIndex(prev => {
          if (prev >= simResult.hops.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simResult]);

  if (!isOpen) return null;

  const handleRunPing = () => {
    const src = devices.find(d => d.id === sourceId);
    const dst = devices.find(d => d.id === destId);
    if (!src || !dst) return;

    const result = simulatePing(src, dst, devices, links, vlans);
    setSimResult(result);
    setCurrentHopIndex(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setCurrentHopIndex(0);
    setIsPlaying(false);
  };

  const currentHop: PacketHop | undefined = simResult?.hops[currentHopIndex];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11192d]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Enterprise Packet Tracer & Connectivity Simulator
              </h2>
              <p className="text-xs text-slate-400">
                L2 Switching • L3 SVI Inter-VLAN Routing • CAPWAP RF • OSI Layer Analysis
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onSimulationStateChange(null, -1);
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Source and Destination Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-[#11192d] p-3.5 rounded-xl border border-slate-800 items-end">
            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400 font-medium">Source Node (Host / Client)</label>
              <select
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                className="w-full mt-1 bg-[#0a0f1c] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-cyan-500 outline-none font-mono"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.interfaces[0]?.ip || 'No IP'}) [{d.tier}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center items-center py-2 text-cyan-400">
              <ArrowRight className="w-5 h-5" />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400 font-medium">Destination Node (Server / Target)</label>
              <select
                value={destId}
                onChange={e => setDestId(e.target.value)}
                className="w-full mt-1 bg-[#0a0f1c] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-cyan-500 outline-none font-mono"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.interfaces[0]?.ip || 'No IP'}) [{d.tier}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action & Playback Controls */}
          <div className="flex items-center justify-between bg-[#11192d] p-3 rounded-xl border border-slate-800">
            <button
              onClick={handleRunPing}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-lg shadow-md transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Initiate ICMP Ping (Type 8)</span>
            </button>

            {simResult && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => setCurrentHopIndex(prev => Math.min(simResult.hops.length - 1, prev + 1))}
                  disabled={currentHopIndex >= simResult.hops.length - 1}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700 transition"
                  title="Step Next Hop"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                  title="Reset to Hop 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <span className="text-[11px] font-mono text-slate-400 pl-2">
                  Hop {currentHopIndex + 1} of {simResult.hops.length}
                </span>
              </div>
            )}
          </div>

          {/* Simulation Outcome Banner */}
          {simResult && (
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              simResult.success 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center space-x-2.5">
                {simResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-xs">
                    {simResult.success ? 'ICMP Echo Reply Received (0% Packet Loss)' : 'Ping Failed: Destination Unreachable'}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {simResult.failureReason || `Round-Trip Time: ${simResult.rttMs} ms • Path Traversed: ${simResult.hops.length} network hops`}
                  </div>
                </div>
              </div>

              {simResult.success && (
                <span className="font-mono text-xs px-2.5 py-1 bg-emerald-500/20 rounded-md border border-emerald-500/40 font-bold">
                  RTT {simResult.rttMs} ms
                </span>
              )}
            </div>
          )}

          {/* OSI Model Layer Analysis Card for the Current Hop */}
          {currentHop && (
            <div className="bg-[#11192d] p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-xs flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Hop {currentHopIndex + 1}: {currentHop.deviceName}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">[{currentHop.action.toUpperCase()}]</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentHop.detail}
                </span>
              </div>

              {/* 4 OSI Layers Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                {/* Layer 4: Transport / ICMP */}
                <div className="bg-[#0a0f1c] p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    OSI Layer 4: Transport
                  </div>
                  <div className="text-white font-mono text-[11px]">
                    {currentHop.layer4?.type || 'ICMP (Type 8 / Code 0)'}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono">
                    Seq #{currentHop.layer4?.seq || 1}
                  </div>
                </div>

                {/* Layer 3: Network */}
                <div className="bg-[#0a0f1c] p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    OSI Layer 3: Network
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    Src: <span className="text-cyan-300">{currentHop.layer3.srcIp}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    Dst: <span className="text-cyan-300">{currentHop.layer3.dstIp}</span>
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono">
                    TTL: {currentHop.layer3.ttl} • Proto: 1
                  </div>
                </div>

                {/* Layer 2: Data Link */}
                <div className="bg-[#0a0f1c] p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    OSI Layer 2: Data Link
                  </div>
                  <div className="text-[9.5px] font-mono text-slate-300 truncate" title={currentHop.layer2.srcMac}>
                    Src MAC: {currentHop.layer2.srcMac}
                  </div>
                  <div className="text-[9.5px] font-mono text-slate-300 truncate" title={currentHop.layer2.dstMac}>
                    Dst MAC: {currentHop.layer2.dstMac}
                  </div>
                  <div className="text-[9.5px] font-mono text-indigo-400">
                    802.1Q VLAN Tag: {currentHop.layer2.vlanTag || 'None'}
                  </div>
                </div>

                {/* Layer 1: Physical */}
                <div className="bg-[#0a0f1c] p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    OSI Layer 1: Physical
                  </div>
                  <div className="text-[10px] font-mono text-white">
                    {currentHop.layer1}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono">
                    Interface: {currentHop.interfaceName}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Packet Hop Timeline & Terminal Logs */}
          {simResult && (
            <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
              <div className="text-slate-500 border-b border-slate-800/80 pb-1 uppercase font-semibold">
                Event Log & Terminal Diagnostics:
              </div>
              {simResult.logs.map((log, idx) => (
                <div key={idx} className={log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('ERROR') ? 'text-rose-400' : 'text-slate-300'}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0a0f1c] flex justify-end">
          <button
            onClick={() => {
              onSimulationStateChange(null, -1);
              onClose();
            }}
            className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
