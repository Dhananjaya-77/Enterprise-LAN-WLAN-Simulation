import React, { useState } from 'react';
import { VLAN, Device } from '../types/network';
import { 
  X, 
  Layers, 
  Plus, 
  Trash2, 
  Network, 
  Tag, 
  Server 
} from 'lucide-react';

interface VlanManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vlans: VLAN[];
  devices: Device[];
  onAddVlan: (newVlan: VLAN) => void;
  onDeleteVlan: (vlanId: number) => void;
}

export const VlanManagerModal: React.FC<VlanManagerModalProps> = ({
  isOpen,
  onClose,
  vlans,
  devices,
  onAddVlan,
  onDeleteVlan,
}) => {
  const [vlanId, setVlanId] = useState(70);
  const [name, setName] = useState('');
  const [subnet, setSubnet] = useState('10.100.70.0');
  const [cidr, setCidr] = useState(24);
  const [department, setDepartment] = useState('Operations');
  const [color, setColor] = useState('#ec4899');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const baseInt = subnet.split('.').reduce((acc, o) => ((acc << 8) + parseInt(o, 10)) >>> 0, 0);
    const maskInt = ((0xffffffff << (32 - cidr)) >>> 0);
    const netInt = (baseInt & maskInt) >>> 0;
    const bcastInt = (netInt + Math.pow(2, 32 - cidr) - 1) >>> 0;
    const gwInt = netInt + 1;

    const intToIp = (num: number) => [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join('.');

    const newVlan: VLAN = {
      id: Number(vlanId),
      name: name.trim(),
      color,
      subnet: intToIp(netInt),
      cidr,
      subnetMask: intToIp(maskInt),
      gateway: intToIp(gwInt),
      broadcast: intToIp(bcastInt),
      usableRange: `${intToIp(gwInt)} - ${intToIp(bcastInt - 1)}`,
      totalHosts: Math.pow(2, 32 - cidr),
      usableHosts: Math.max(0, Math.pow(2, 32 - cidr) - 2),
      description: `${name.trim()} Subnet Segment`,
      department,
    };

    onAddVlan(newVlan);
    setName('');
    setVlanId(v => v + 10);
    setSubnet(s => s.replace(/\.\d+\./, `.${vlanId + 10}.`));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11192d]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Enterprise 802.1Q VLAN Segment Manager
              </h2>
              <p className="text-xs text-slate-400">
                Broadcast domain segmentation, default gateways, and department assignment
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

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Create new VLAN form */}
          <form onSubmit={handleAdd} className="bg-[#11192d] p-3.5 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-6 gap-2.5 items-end">
            <div>
              <label className="text-[10px] text-slate-400">VLAN ID (1-4094)</label>
              <input
                type="number"
                min={1}
                max={4094}
                value={vlanId}
                onChange={e => setVlanId(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400">VLAN Name</label>
              <input
                type="text"
                placeholder="e.g. Operations & Logistics"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400">Subnet Network</label>
              <input
                type="text"
                value={subnet}
                onChange={e => setSubnet(e.target.value)}
                className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400">Prefix (CIDR)</label>
              <select
                value={cidr}
                onChange={e => setCidr(parseInt(e.target.value, 10))}
                className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
              >
                <option value={23}>/23 (510 hosts)</option>
                <option value={24}>/24 (254 hosts)</option>
                <option value={25}>/25 (126 hosts)</option>
                <option value={26}>/26 (62 hosts)</option>
                <option value={27}>/27 (30 hosts)</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold flex items-center justify-center space-x-1 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create VLAN</span>
            </button>
          </form>

          {/* VLAN List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vlans.map(v => {
              const assignedDevices = devices.filter(d => d.vlanId === v.id);

              return (
                <div
                  key={v.id}
                  className="bg-[#11192d] p-3.5 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                        style={{
                          backgroundColor: `${v.color}25`,
                          color: v.color,
                          border: `1px solid ${v.color}50`,
                        }}
                      >
                        VLAN {v.id}
                      </span>
                      <span className="font-bold text-white text-xs">
                        {v.name}
                      </span>
                    </div>

                    {v.id !== 10 && v.id !== 99 && (
                      <button
                        onClick={() => onDeleteVlan(v.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Delete VLAN"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono text-slate-300">
                    <div>Subnet: <span className="text-cyan-400">{v.subnet}/{v.cidr}</span></div>
                    <div>Default GW: <span className="text-emerald-400">{v.gateway}</span></div>
                    <div>Mask: <span className="text-slate-400">{v.subnetMask}</span></div>
                    <div>Usable Hosts: <span className="text-white">{v.usableHosts}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                    <span>Department: {v.department}</span>
                    <span className="text-cyan-400 font-mono">
                      {assignedDevices.length} node{assignedDevices.length !== 1 ? 's' : ''} mapped
                    </span>
                  </div>
                </div>
              );
            })}
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
