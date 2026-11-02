import React, { useState } from 'react';
import { Device, VLAN, Link } from '../types/network';
import { generateCiscoIosConfig, generateArubaOsConfig } from '../utils/configGenerator';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Server 
} from 'lucide-react';

interface ConfigGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  vlans: VLAN[];
  links: Link[];
}

export const ConfigGeneratorModal: React.FC<ConfigGeneratorModalProps> = ({
  isOpen,
  onClose,
  devices,
  vlans,
  links,
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');
  const [platform, setPlatform] = useState<'cisco' | 'aruba'>('cisco');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentDevice = devices.find(d => d.id === selectedDeviceId) || devices[0];
  const configText = currentDevice
    ? platform === 'cisco'
      ? generateCiscoIosConfig(currentDevice, vlans, links)
      : generateArubaOsConfig(currentDevice, vlans)
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([configText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDevice.hostname}_${platform.toUpperCase()}_config.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11192d]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Enterprise Switch & Router Configuration Studio
              </h2>
              <p className="text-xs text-slate-400">
                Production-ready CLI scripts for Cisco IOS 15.x / IOS-XE and ArubaOS-CX
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

        {/* Device & Platform Selectors */}
        <div className="p-4 border-b border-slate-800 bg-[#0a0f1c] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 font-medium">Select Target Node:</span>
            </div>
            <select
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              className="bg-[#11192d] border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.hostname}) - [{d.model}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPlatform('cisco')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                platform === 'cisco'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cisco IOS / XE
            </button>
            <button
              onClick={() => setPlatform('aruba')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                platform === 'aruba'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ArubaOS-CX
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 flex-1 overflow-y-auto bg-[#070b14]">
          <pre className="font-mono text-[11px] text-emerald-400/90 whitespace-pre leading-relaxed select-text">
            {configText}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0a0f1c] flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            {configText.split('\n').length} lines generated
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied CLI' : 'Copy CLI Script'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
