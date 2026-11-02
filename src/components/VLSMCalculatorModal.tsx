import React, { useState } from 'react';
import { 
  SubnetRequirement, 
  SubnetAllocated, 
  VLAN, 
  Device 
} from '../types/network';
import { 
  calculateVLSM, 
  subnetsToVlans, 
  cidrToSubnetMask, 
  intToIp, 
  ipToInt 
} from '../utils/subnetting';
import { 
  X, 
  Calculator, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Copy, 
  Check, 
  Download, 
  Layers 
} from 'lucide-react';

interface VLSMCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirements: SubnetRequirement[];
  onUpdateRequirements: (reqs: SubnetRequirement[]) => void;
  onApplyToTopology: (subnets: SubnetAllocated[]) => void;
  currentVlans: VLAN[];
}

export const VLSMCalculatorModal: React.FC<VLSMCalculatorModalProps> = ({
  isOpen,
  onClose,
  requirements,
  onUpdateRequirements,
  onApplyToTopology,
  currentVlans,
}) => {
  const [baseNetwork, setBaseNetwork] = useState('10.100.0.0');
  const [baseCidr, setBaseCidr] = useState(16);
  const [copiedTable, setCopiedTable] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // New requirement inputs
  const [newSubnetName, setNewSubnetName] = useState('');
  const [newNeededHosts, setNewNeededHosts] = useState(50);
  const [newVlanId, setNewVlanId] = useState(70);

  if (!isOpen) return null;

  // Run VLSM engine
  const vlsmResult = calculateVLSM(baseNetwork, baseCidr, requirements);

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubnetName.trim()) return;

    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
    const randomColor = colors[requirements.length % colors.length];

    const newReq: SubnetRequirement = {
      id: `req-${Date.now()}`,
      name: newSubnetName.trim(),
      neededHosts: Number(newNeededHosts),
      vlanId: Number(newVlanId),
      color: randomColor,
      description: `${newSubnetName.trim()} Subnet`,
    };

    onUpdateRequirements([...requirements, newReq]);
    setNewSubnetName('');
    setNewNeededHosts(30);
    setNewVlanId(v => v + 10);
  };

  const handleDeleteRequirement = (id: string) => {
    onUpdateRequirements(requirements.filter(r => r.id !== id));
  };

  const handleUpdateHostCount = (id: string, count: number) => {
    onUpdateRequirements(
      requirements.map(r => (r.id === id ? { ...r, neededHosts: Math.max(2, count) } : r))
    );
  };

  const handleApply = () => {
    onApplyToTopology(vlsmResult.allocatedSubnets);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 2500);
  };

  const handleCopyMarkdown = () => {
    let md = `| VLAN ID | Subnet Name | Needed | Allocated | Network Address | CIDR | Subnet Mask | Usable Host Range | Broadcast |\n`;
    md += `|---|---|---|---|---|---|---|---|---|\n`;
    vlsmResult.allocatedSubnets.forEach(s => {
      md += `| ${s.vlanId} | ${s.name} | ${s.neededHosts} | ${s.usableAddresses} | ${s.network} | /${s.cidr} | ${s.subnetMask} | ${s.firstUsable} - ${s.lastUsable} | ${s.broadcast} |\n`;
    });
    navigator.clipboard.writeText(md);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11192d]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Variable Length Subnet Masking (VLSM) Studio
              </h2>
              <p className="text-xs text-slate-400">
                Hierarchical address planning, waste minimization, and zero-overlap calculation
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

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
          {/* Base Major Network Settings Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#11192d] p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] font-medium text-slate-300">Base Major Network</label>
              <input
                type="text"
                value={baseNetwork}
                onChange={e => setBaseNetwork(e.target.value)}
                placeholder="10.100.0.0"
                className="mt-1 w-full bg-[#0a0f1c] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300">Major CIDR Prefix</label>
              <select
                value={baseCidr}
                onChange={e => setBaseCidr(parseInt(e.target.value, 10))}
                className="mt-1 w-full bg-[#0a0f1c] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
              >
                <option value={8}>/8 (16,777,216 IPs - Class A)</option>
                <option value={16}>/16 (65,536 IPs - Class B Standard)</option>
                <option value={20}>/20 (4,096 IPs)</option>
                <option value={22}>/22 (1,024 IPs)</option>
                <option value={24}>/24 (256 IPs - Class C)</option>
              </select>
            </div>

            <div className="bg-[#0a0f1c] p-2.5 rounded-lg border border-slate-800/80 flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 uppercase">Total Major Capacity</span>
              <span className="text-base font-bold font-mono text-white">
                {vlsmResult.totalAvailableAddresses.toLocaleString()} IPs
              </span>
            </div>

            <div className="bg-[#0a0f1c] p-2.5 rounded-lg border border-slate-800/80 flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 uppercase">Address Utilization</span>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold font-mono text-cyan-400">
                  {vlsmResult.utilizationPercentage}%
                </span>
                <span className="text-[10px] text-slate-500">
                  ({vlsmResult.totalAllocatedAddresses.toLocaleString()} IPs used)
                </span>
              </div>
            </div>
          </div>

          {/* Subnet Visual Memory Map Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">Subnet Space Allocation Map</span>
              <span className="text-slate-400 font-mono">
                {vlsmResult.allocatedSubnets.length} Subnets Allocated
              </span>
            </div>

            <div className="h-6 w-full bg-slate-900 rounded-lg overflow-hidden flex border border-slate-800 p-0.5">
              {vlsmResult.allocatedSubnets.map(s => {
                const widthPercent = Math.max(1, (s.totalAddresses / vlsmResult.totalAvailableAddresses) * 100);
                return (
                  <div
                    key={s.id}
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: s.color,
                    }}
                    className="h-full rounded-sm opacity-90 hover:opacity-100 transition relative group cursor-pointer"
                    title={`VLAN ${s.vlanId}: ${s.name} (${s.network}/${s.cidr}) - ${s.totalAddresses} IPs`}
                  />
                );
              })}
              <div
                style={{
                  width: `${Math.max(0, 100 - vlsmResult.utilizationPercentage)}%`,
                }}
                className="h-full bg-slate-800/60 flex items-center justify-center text-[9px] text-slate-500 font-mono"
              >
                Available Space
              </div>
            </div>
          </div>

          {/* Add Subnet Requirement Bar */}
          <form onSubmit={handleAddRequirement} className="flex items-end space-x-2 bg-[#11192d] p-3 rounded-xl border border-slate-800">
            <div className="flex-1">
              <label className="text-[10px] text-slate-400">Department / Function</label>
              <input
                type="text"
                value={newSubnetName}
                onChange={e => setNewSubnetName(e.target.value)}
                placeholder="e.g. Finance & Accounting"
                className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2.5 py-1 text-slate-100 text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="w-28">
              <label className="text-[10px] text-slate-400">Needed Hosts</label>
              <input
                type="number"
                min={2}
                value={newNeededHosts}
                onChange={e => setNewNeededHosts(parseInt(e.target.value, 10) || 2)}
                className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="w-24">
              <label className="text-[10px] text-slate-400">VLAN ID</label>
              <input
                type="number"
                min={1}
                max={4094}
                value={newVlanId}
                onChange={e => setNewVlanId(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1 shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Allocated Subnets Table */}
          <div className="bg-[#11192d] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0a0f1c] text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <th className="py-2.5 px-3">VLAN</th>
                    <th className="py-2.5 px-3">Department / Network</th>
                    <th className="py-2.5 px-3">Needed Hosts</th>
                    <th className="py-2.5 px-3">Network Address</th>
                    <th className="py-2.5 px-3">Prefix</th>
                    <th className="py-2.5 px-3">Subnet Mask</th>
                    <th className="py-2.5 px-3">Usable Range</th>
                    <th className="py-2.5 px-3">Broadcast</th>
                    <th className="py-2.5 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {vlsmResult.allocatedSubnets.map(subnet => (
                    <tr key={subnet.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3">
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${subnet.color}25`,
                            color: subnet.color,
                            border: `1px solid ${subnet.color}50`,
                          }}
                        >
                          VLAN {subnet.vlanId}
                        </span>
                      </td>

                      <td className="py-2 px-3 font-sans font-medium text-white">
                        {subnet.name}
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min={2}
                          value={subnet.neededHosts}
                          onChange={e => handleUpdateHostCount(subnet.id, parseInt(e.target.value, 10))}
                          className="w-16 bg-[#0a0f1c] border border-slate-700 rounded px-1.5 py-0.5 text-cyan-400 font-mono text-xs focus:border-cyan-500 outline-none"
                        />
                      </td>

                      <td className="py-2 px-3 text-cyan-400 font-bold">
                        {subnet.network}
                      </td>

                      <td className="py-2 px-3 text-emerald-400 font-bold">
                        /{subnet.cidr}
                      </td>

                      <td className="py-2 px-3 text-slate-300">
                        {subnet.subnetMask}
                      </td>

                      <td className="py-2 px-3 text-slate-300 text-[11px]">
                        {subnet.firstUsable} - {subnet.lastUsable}
                      </td>

                      <td className="py-2 px-3 text-slate-400">
                        {subnet.broadcast}
                      </td>

                      <td className="py-2 px-3">
                        <button
                          onClick={() => handleDeleteRequirement(subnet.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Delete Requirement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0f1c] flex items-center justify-between">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            {copiedTable ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTable ? 'Copied Table!' : 'Copy Markdown Table'}</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              onClick={handleApply}
              className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-lg shadow-md shadow-blue-600/30 transition"
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Applied to Topology!</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Apply Scheme to Topology</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
