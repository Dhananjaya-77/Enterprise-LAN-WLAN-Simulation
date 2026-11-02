import React, { useState } from 'react';
import { Device, Link, VLAN, SubnetRequirement } from '../types/network';
import { 
  X, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  FileText, 
  RotateCcw 
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  links: Link[];
  vlans: VLAN[];
  subnetRequirements: SubnetRequirement[];
  onImportState: (state: {
    devices: Device[];
    links: Link[];
    vlans: VLAN[];
    subnetRequirements?: SubnetRequirement[];
  }) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  devices,
  links,
  vlans,
  subnetRequirements,
  onImportState,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportPayload = {
    metadata: {
      title: 'Enterprise Campus LAN/WLAN Topology & VLSM Subnets',
      exportDate: new Date().toISOString(),
      version: '2.5',
    },
    vlans,
    subnetRequirements,
    devices,
    links,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enterprise_network_design_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed.devices) || !Array.isArray(parsed.links) || !Array.isArray(parsed.vlans)) {
        throw new Error('Invalid schema: Missing devices, links, or vlans array.');
      }
      onImportState({
        devices: parsed.devices,
        links: parsed.links,
        vlans: parsed.vlans,
        subnetRequirements: parsed.subnetRequirements,
      });
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11192d]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export & Import Network Project</h2>
              <p className="text-xs text-slate-400">Save your campus topology, VLSM subnets, and configs as JSON</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Export Box */}
          <div className="bg-[#11192d] p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Current Network Topology JSON</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-2.5 py-1 text-slate-200 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1 px-2.5 py-1 text-white bg-blue-600 hover:bg-blue-500 rounded transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={jsonString}
              rows={6}
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] text-cyan-300/90 outline-none resize-none"
            />
          </div>

          {/* Import Box */}
          <div className="bg-[#11192d] p-4 rounded-xl border border-slate-800 space-y-2.5">
            <span className="font-semibold text-white">Import Network JSON</span>
            <p className="text-slate-400 text-[11px]">Paste a valid network topology JSON file to restore a previous simulation session.</p>

            <textarea
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              placeholder="Paste JSON here..."
              rows={4}
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] text-slate-200 outline-none resize-none focus:border-cyan-500"
            />

            {importError && (
              <div className="text-rose-400 text-[11px] font-mono">
                Error: {importError}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!jsonInput.trim()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-semibold transition shadow"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Load Into Simulator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
