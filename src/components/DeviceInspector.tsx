import React, { useState } from 'react';
import { 
  Device, 
  VLAN, 
  Link, 
  NetworkInterface, 
  AclRule, 
  RouteEntry 
} from '../types/network';
import { 
  X, 
  Power, 
  Sliders, 
  Layers, 
  Radio, 
  Shield, 
  Route, 
  Terminal, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Wifi, 
  Signal, 
  Network 
} from 'lucide-react';
import { scanApsForClient } from '../utils/wifiEngine';
import { generateCiscoIosConfig } from '../utils/configGenerator';

interface DeviceInspectorProps {
  device: Device;
  allDevices: Device[];
  vlans: VLAN[];
  links: Link[];
  onClose: () => void;
  onUpdateDevice: (updated: Device) => void;
  onDeleteDevice: (id: string) => void;
}

export const DeviceInspector: React.FC<DeviceInspectorProps> = ({
  device,
  allDevices,
  vlans,
  links,
  onClose,
  onUpdateDevice,
  onDeleteDevice,
}) => {
  const [activeTab, setActiveTab] = useState<'interfaces' | 'wireless' | 'routing' | 'security' | 'cli'>('interfaces');
  const [copiedCli, setCopiedCli] = useState(false);

  const isAp = device.type === 'ap';
  const isWirelessClient = device.type === 'laptop' || device.type === 'smartphone';
  const isRouterOrSwitch = device.type === 'router' || device.type === 'core_switch' || device.type === 'dist_switch';
  const apDevices = allDevices.filter(d => d.type === 'ap');

  // Wi-Fi scan results if client
  const scanResults = isWirelessClient ? scanApsForClient(device, apDevices) : [];

  const handleTogglePower = () => {
    onUpdateDevice({ ...device, isOnline: !device.isOnline });
  };

  const handleInterfaceChange = (index: number, updates: Partial<NetworkInterface>) => {
    const newInterfaces = [...device.interfaces];
    newInterfaces[index] = { ...newInterfaces[index], ...updates };
    onUpdateDevice({ ...device, interfaces: newInterfaces });
  };

  const handleUpdateWirelessRadio = (updates: Partial<NonNullable<Device['wirelessRadio']>>) => {
    if (!device.wirelessRadio) return;
    onUpdateDevice({
      ...device,
      wirelessRadio: { ...device.wirelessRadio, ...updates },
    });
  };

  const handleAssociateWithAp = (apId: string) => {
    const targetAp = allDevices.find(d => d.id === apId);
    if (!targetAp || !targetAp.wirelessRadio) return;

    onUpdateDevice({
      ...device,
      associatedApId: apId,
      vlanId: targetAp.wirelessRadio.vlanId,
    });
  };

  const handleAddAclRule = () => {
    const newRule: AclRule = {
      id: `acl-${Date.now()}`,
      sequence: ((device.aclRules?.length || 0) + 1) * 10,
      action: 'deny',
      protocol: 'ip',
      sourceNetwork: '10.100.40.0',
      sourceWildcard: '0.0.1.255',
      destNetwork: '10.100.99.0',
      destWildcard: '0.0.0.255',
      description: 'Block Guest WLAN to Server Farm',
    };

    onUpdateDevice({
      ...device,
      aclRules: [...(device.aclRules || []), newRule],
    });
  };

  const handleDeleteAclRule = (ruleId: string) => {
    onUpdateDevice({
      ...device,
      aclRules: (device.aclRules || []).filter(r => r.id !== ruleId),
    });
  };

  const cliOutput = generateCiscoIosConfig(device, vlans, links);

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliOutput);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="w-96 bg-[#0d1424] border-l border-slate-800 flex flex-col h-full shadow-2xl z-30 shrink-0">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11192d]">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleTogglePower}
            className={`p-1.5 rounded-lg border transition ${
              device.isOnline
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
            }`}
            title={device.isOnline ? 'Power Off Device' : 'Power On Device'}
          >
            <Power className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>{device.name}</span>
            </h2>
            <div className="text-[11px] font-mono text-slate-400">
              {device.model}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-[#0a0f1c] text-xs">
        <button
          onClick={() => setActiveTab('interfaces')}
          className={`flex-1 py-2.5 px-2 text-center font-medium border-b-2 transition flex items-center justify-center space-x-1 ${
            activeTab === 'interfaces'
              ? 'text-cyan-400 border-cyan-400 bg-cyan-950/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Config</span>
        </button>

        {(isAp || isWirelessClient) && (
          <button
            onClick={() => setActiveTab('wireless')}
            className={`flex-1 py-2.5 px-2 text-center font-medium border-b-2 transition flex items-center justify-center space-x-1 ${
              activeTab === 'wireless'
                ? 'text-cyan-400 border-cyan-400 bg-cyan-950/20'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Wi-Fi RF</span>
          </button>
        )}

        {isRouterOrSwitch && (
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2.5 px-2 text-center font-medium border-b-2 transition flex items-center justify-center space-x-1 ${
              activeTab === 'security'
                ? 'text-cyan-400 border-cyan-400 bg-cyan-950/20'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>ACL / Sec</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('cli')}
          className={`flex-1 py-2.5 px-2 text-center font-medium border-b-2 transition flex items-center justify-center space-x-1 ${
            activeTab === 'cli'
              ? 'text-cyan-400 border-cyan-400 bg-cyan-950/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>CLI</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {activeTab === 'interfaces' && (
          <div className="space-y-4">
            {/* General Properties */}
            <div className="bg-[#11192d] p-3 rounded-xl border border-slate-800 space-y-2.5">
              <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                System Attributes
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Hostname</label>
                  <input
                    type="text"
                    value={device.hostname}
                    onChange={e => onUpdateDevice({ ...device, hostname: e.target.value })}
                    className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Device Tier</label>
                  <select
                    value={device.tier}
                    onChange={e => onUpdateDevice({ ...device, tier: e.target.value as any })}
                    className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:border-cyan-500 outline-none"
                  >
                    <option value="perimeter">Perimeter</option>
                    <option value="core">Core Backbone</option>
                    <option value="distribution">Distribution</option>
                    <option value="datacenter">Data Center</option>
                    <option value="access">Access Edge</option>
                    <option value="wlan">WLAN Architecture</option>
                    <option value="endpoint">Endpoint / Client</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Primary VLAN Assignment</label>
                <select
                  value={device.vlanId || 1}
                  onChange={e => onUpdateDevice({ ...device, vlanId: parseInt(e.target.value, 10) })}
                  className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:border-cyan-500 outline-none font-mono"
                >
                  {vlans.map(v => (
                    <option key={v.id} value={v.id}>
                      VLAN {v.id}: {v.name} ({v.subnet}/{v.cidr})
                    </option>
                  ))}
                </select>
              </div>

              {device.tier === 'endpoint' && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                  <div>
                    <label className="text-[10px] text-slate-400">Default Gateway</label>
                    <input
                      type="text"
                      value={device.defaultGateway || ''}
                      placeholder="e.g. 10.100.20.1"
                      onChange={e => onUpdateDevice({ ...device, defaultGateway: e.target.value })}
                      className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">DNS Server</label>
                    <input
                      type="text"
                      value={device.dnsServer || ''}
                      placeholder="e.g. 10.100.99.10"
                      onChange={e => onUpdateDevice({ ...device, dnsServer: e.target.value })}
                      className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Network Interfaces List */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Interfaces ({device.interfaces.length})</span>
              </h3>

              {device.interfaces.map((iface, idx) => (
                <div key={iface.id} className="bg-[#11192d] p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400 text-xs">
                      {iface.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {iface.mac}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9.5px] text-slate-400">IPv4 Address</label>
                      <input
                        type="text"
                        value={iface.ip || ''}
                        placeholder="10.100.x.x"
                        onChange={e => handleInterfaceChange(idx, { ip: e.target.value })}
                        className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] text-slate-400">Subnet Mask</label>
                      <input
                        type="text"
                        value={iface.subnetMask || ''}
                        placeholder="255.255.255.0"
                        onChange={e => handleInterfaceChange(idx, { subnetMask: e.target.value })}
                        className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Mode: <span className="text-white font-mono">{iface.mode || 'access'}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {iface.speedMbps} Mbps {iface.duplex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wireless Tab */}
        {activeTab === 'wireless' && (
          <div className="space-y-4">
            {isAp && device.wirelessRadio && (
              <div className="bg-[#11192d] p-3 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Access Point RF Transmitter</span>
                </h3>

                <div>
                  <label className="text-[10px] text-slate-400">Radio Frequency Band</label>
                  <select
                    value={device.wirelessRadio.band}
                    onChange={e => handleUpdateWirelessRadio({ band: e.target.value as any })}
                    className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                  >
                    <option value="2.4GHz">2.4 GHz (Long Range, 1/6/11)</option>
                    <option value="5GHz">5 GHz (High Capacity Wi-Fi 6)</option>
                    <option value="6GHz">6 GHz (Ultra-Wide Wi-Fi 6E)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Channel</label>
                    {device.wirelessRadio.band === '2.4GHz' ? (
                      <select
                        value={device.wirelessRadio.channel}
                        onChange={e => handleUpdateWirelessRadio({ channel: parseInt(e.target.value, 10) })}
                        className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                      >
                        <option value={1}>Ch 1 (2412 MHz)</option>
                        <option value={6}>Ch 6 (2437 MHz)</option>
                        <option value={11}>Ch 11 (2462 MHz)</option>
                      </select>
                    ) : (
                      <select
                        value={device.wirelessRadio.channel}
                        onChange={e => handleUpdateWirelessRadio({ channel: parseInt(e.target.value, 10) })}
                        className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                      >
                        <option value={36}>Ch 36 (UNII-1)</option>
                        <option value={40}>Ch 40 (UNII-1)</option>
                        <option value={44}>Ch 44 (UNII-1)</option>
                        <option value={48}>Ch 48 (UNII-1)</option>
                        <option value={149}>Ch 149 (UNII-3)</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Tx Power (dBm)</label>
                    <input
                      type="number"
                      min={10}
                      max={25}
                      value={device.wirelessRadio.txPowerDbm}
                      onChange={e => handleUpdateWirelessRadio({ txPowerDbm: parseInt(e.target.value, 10) || 18 })}
                      className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Broadcast SSID</label>
                  <input
                    type="text"
                    value={device.wirelessRadio.ssid}
                    onChange={e => handleUpdateWirelessRadio({ ssid: e.target.value })}
                    className="w-full bg-[#0a0f1c] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Security Standard</label>
                  <div className="text-xs font-mono text-emerald-400 bg-[#0a0f1c] px-2 py-1 rounded border border-slate-800">
                    {device.wirelessRadio.security}
                  </div>
                </div>
              </div>
            )}

            {isWirelessClient && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white flex items-center space-x-1.5">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Wi-Fi Site Survey & Roaming</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {scanResults.length} APs in range
                  </span>
                </div>

                {scanResults.length === 0 ? (
                  <div className="bg-[#11192d] p-4 rounded-xl border border-slate-800 text-center text-slate-400">
                    Out of range! Move closer to an Access Point on the canvas.
                  </div>
                ) : (
                  scanResults.map(scan => {
                    const isConnected = device.associatedApId === scan.apId;
                    return (
                      <div
                        key={scan.apId}
                        className={`p-3 rounded-xl border transition ${
                          isConnected
                            ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md'
                            : 'bg-[#11192d] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-xs">
                            {scan.apName}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400">
                            {scan.ssid}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-300 mb-2">
                          <div>RSSI: <span className={scan.rssiDbm > -65 ? 'text-emerald-400' : 'text-amber-400'}>{scan.rssiDbm} dBm</span></div>
                          <div>Rate: <span className="text-white">{scan.dataRateMbps}M</span></div>
                          <div>Band: <span className="text-indigo-300">{scan.band}</span></div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-cyan-400 h-full rounded-full transition-all"
                              style={{ width: `${scan.signalQualityPercent}%` }}
                            />
                          </div>

                          {isConnected ? (
                            <span className="text-[10px] font-bold text-cyan-400 flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>Associated</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAssociateWithAp(scan.apId)}
                              className="px-2 py-0.5 text-[10px] font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition"
                            >
                              Roam Here
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* Security & ACLs Tab */}
        {activeTab === 'security' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Security Access Control List</span>
              </h3>
              <button
                onClick={handleAddAclRule}
                className="flex items-center space-x-1 px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>Add Rule</span>
              </button>
            </div>

            {(!device.aclRules || device.aclRules.length === 0) ? (
              <div className="bg-[#11192d] p-4 rounded-xl border border-slate-800 text-center text-slate-400">
                No active ACL rules configured. Traffic is permitted by default.
              </div>
            ) : (
              device.aclRules.map(rule => (
                <div key={rule.id} className="bg-[#11192d] p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">
                      Seq #{rule.sequence}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                      rule.action === 'permit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {rule.action}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-200">
                    {rule.protocol.toUpperCase()} {rule.sourceNetwork} -&gt; {rule.destNetwork}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-[9.5px] text-slate-400 truncate max-w-[200px]">
                      {rule.description || 'Enterprise Traffic Filter'}
                    </span>
                    <button
                      onClick={() => handleDeleteAclRule(rule.id)}
                      className="text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Cisco CLI Tab */}
        {activeTab === 'cli' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                Cisco IOS v15.2 Configuration
              </span>
              <button
                onClick={handleCopyCli}
                className="flex items-center space-x-1 px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              >
                {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCli ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="bg-[#070b14] p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-400/90 overflow-x-auto whitespace-pre leading-relaxed max-h-[480px]">
              {cliOutput}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800 bg-[#0a0f1c] flex items-center justify-between">
        <button
          onClick={() => onDeleteDevice(device.id)}
          className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Node</span>
        </button>

        <button
          onClick={onClose}
          className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
