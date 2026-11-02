import React, { useState, useRef, useEffect } from 'react';
import { 
  Device, 
  Link, 
  VLAN, 
  SimulationResult, 
  PacketHop 
} from '../types/network';
import { 
  Router, 
  Shield, 
  Layers, 
  Server, 
  Monitor, 
  Laptop, 
  Smartphone, 
  Phone, 
  Radio, 
  Cpu, 
  Wifi, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { detectCoChannelInterference } from '../utils/wifiEngine';

interface TopologyCanvasProps {
  devices: Device[];
  links: Link[];
  vlans: VLAN[];
  selectedDeviceId: string | null;
  onSelectDevice: (device: Device | null) => void;
  onUpdateDevicePosition: (id: string, x: number, y: number) => void;
  showWlanCoverage: boolean;
  activeSimulation: SimulationResult | null;
  currentSimHopIndex: number;
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({
  devices,
  links,
  vlans,
  selectedDeviceId,
  onSelectDevice,
  onUpdateDevicePosition,
  showWlanCoverage,
  activeSimulation,
  currentSimHopIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const vlanMap = new Map<number, VLAN>(vlans.map(v => [v.id, v]));
  const deviceMap = new Map<string, Device>(devices.map(d => [d.id, d]));

  // Co-channel interference warnings
  const apDevices = devices.filter(d => d.type === 'ap');
  const cciIssues = detectCoChannelInterference(apDevices);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.device-node')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingDeviceId) {
      const newX = Math.round((e.clientX - pan.x - dragOffset.x) / zoom);
      const newY = Math.round((e.clientY - pan.y - dragOffset.y) / zoom);
      onUpdateDevicePosition(draggingDeviceId, Math.max(30, newX), Math.max(30, newY));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingDeviceId(null);
  };

  const handleDeviceMouseDown = (e: React.MouseEvent, device: Device) => {
    e.stopPropagation();
    onSelectDevice(device);
    setDraggingDeviceId(device.id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'router':
        return <Router className="w-5 h-5 text-amber-400" />;
      case 'firewall':
        return <Shield className="w-5 h-5 text-rose-400" />;
      case 'core_switch':
        return <Layers className="w-5 h-5 text-cyan-400" />;
      case 'dist_switch':
        return <Layers className="w-5 h-5 text-blue-400" />;
      case 'access_switch':
        return <Layers className="w-5 h-5 text-indigo-300" />;
      case 'wlc':
        return <Wifi className="w-5 h-5 text-cyan-300" />;
      case 'ap':
        return <Radio className="w-5 h-5 text-emerald-400" />;
      case 'server':
        return <Server className="w-5 h-5 text-purple-400" />;
      case 'workstation':
        return <Monitor className="w-5 h-5 text-slate-300" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-teal-300" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5 text-sky-300" />;
      case 'ipphone':
        return <Phone className="w-5 h-5 text-emerald-300" />;
      case 'iot_sensor':
        return <Cpu className="w-5 h-5 text-pink-400" />;
      default:
        return <Monitor className="w-5 h-5 text-slate-400" />;
    }
  };

  // Determine packet animation position
  let packetPosition: { x: number; y: number } | null = null;
  if (activeSimulation && activeSimulation.hops.length > 0 && currentSimHopIndex >= 0) {
    const hop = activeSimulation.hops[Math.min(currentSimHopIndex, activeSimulation.hops.length - 1)];
    const dev = deviceMap.get(hop.deviceId);
    if (dev) {
      packetPosition = { x: dev.x, y: dev.y };
    }
  }

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative flex-1 h-full w-full bg-[#080d1a] bg-grid-pattern overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* Topology Canvas Canvas Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-xl">
        <button
          onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Reset View 100%"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-slate-400 px-2 border-l border-slate-800">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Campus Layer Indicators */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-1 text-right pointer-events-none">
        <div className="px-2.5 py-1 bg-[#0f172a]/80 backdrop-blur-sm border border-slate-800 rounded-md text-[10px] text-slate-400 font-mono">
          <span className="text-cyan-400 font-semibold">Tier 1:</span> Enterprise Perimeter & Core
        </div>
        <div className="px-2.5 py-1 bg-[#0f172a]/80 backdrop-blur-sm border border-slate-800 rounded-md text-[10px] text-slate-400 font-mono">
          <span className="text-blue-400 font-semibold">Tier 2:</span> Campus Distribution & Data Center
        </div>
        <div className="px-2.5 py-1 bg-[#0f172a]/80 backdrop-blur-sm border border-slate-800 rounded-md text-[10px] text-slate-400 font-mono">
          <span className="text-indigo-400 font-semibold">Tier 3:</span> Access Edge, PoE & WLAN 802.11ax
        </div>
      </div>

      {/* Main Vector & SVG Transformation Container */}
      <div 
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <svg className="overflow-visible absolute top-0 left-0 pointer-events-none" style={{ width: 2400, height: 1800 }}>
          <defs>
            {/* 2.4 GHz Heatmap Gradient */}
            <radialGradient id="wifi-gradient-24" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.18" />
              <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </radialGradient>

            {/* 5 GHz Heatmap Gradient */}
            <radialGradient id="wifi-gradient-50" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#06b6d4" stopOpacity="0.18" />
              <stop offset="85%" stopColor="#06b6d4" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </radialGradient>

            {/* 6 GHz Heatmap Gradient */}
            <radialGradient id="wifi-gradient-60" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="85%" stopColor="#8b5cf6" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </radialGradient>

            {/* Glow filter for active ping packet */}
            <filter id="packet-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Wi-Fi Radio Coverage Heatmap Circles */}
          {showWlanCoverage && devices.filter(d => d.type === 'ap' && d.isOnline).map(ap => {
            const radio = ap.wirelessRadio;
            if (!radio) return null;
            const radius = radio.radiusMeters || 170;
            const gradId = radio.band === '2.4GHz' 
              ? 'url(#wifi-gradient-24)' 
              : radio.band === '6GHz' 
                ? 'url(#wifi-gradient-60)' 
                : 'url(#wifi-gradient-50)';

            const strokeColor = radio.band === '2.4GHz' 
              ? '#f59e0b' 
              : radio.band === '6GHz' 
                ? '#8b5cf6' 
                : '#06b6d4';

            return (
              <g key={`heatmap-${ap.id}`}>
                {/* Propagation circle */}
                <circle
                  cx={ap.x}
                  cy={ap.y}
                  r={radius}
                  fill={gradId}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  strokeOpacity="0.5"
                />

                {/* Animated inner wave */}
                <circle
                  cx={ap.x}
                  cy={ap.y}
                  r={radius * 0.45}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  className="animate-pulse"
                />

                {/* Radio tag badge */}
                <foreignObject x={ap.x - 70} y={ap.y - radius - 26} width="140" height="24">
                  <div className="bg-[#0f172a]/90 border border-slate-700/80 px-2 py-0.5 rounded-full text-[10px] font-mono text-center flex items-center justify-center space-x-1 shadow-md">
                    <Radio className="w-2.5 h-2.5 text-cyan-400" />
                    <span className="text-white font-semibold">{radio.band}</span>
                    <span className="text-slate-400">Ch.{radio.channel}</span>
                    <span className="text-emerald-400">{radio.txPowerDbm}dBm</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Physical & Logical Cable Links */}
          {links.map(link => {
            const devFrom = deviceMap.get(link.fromDeviceId);
            const devTo = deviceMap.get(link.toDeviceId);
            if (!devFrom || !devTo) return null;

            // Link styling depending on type
            let strokeColor = '#3b82f6'; // default blue
            let strokeWidth = 2;
            let strokeDasharray = 'none';

            if (link.type === 'etherchannel') {
              strokeColor = '#06b6d4'; // cyan thick for 40G/100G EtherChannel
              strokeWidth = 4;
            } else if (link.type === 'trunk') {
              strokeColor = '#6366f1'; // indigo
              strokeWidth = 2.5;
            } else if (link.type === 'routed') {
              strokeColor = '#f59e0b'; // amber
              strokeWidth = 2.5;
            } else if (link.type === 'capwap') {
              strokeColor = '#10b981'; // emerald dashed for CAPWAP tunnel
              strokeWidth = 2;
              strokeDasharray = '5 4';
            } else if (link.type === 'access' && link.vlanId) {
              const vlan = vlanMap.get(link.vlanId);
              strokeColor = vlan ? vlan.color : '#3b82f6';
              strokeWidth = 1.8;
            }

            const isLinkInSimPath = activeSimulation?.routePath &&
              activeSimulation.routePath.includes(link.fromDeviceId) &&
              activeSimulation.routePath.includes(link.toDeviceId);

            return (
              <g key={link.id}>
                {/* Active simulation glowing halo */}
                {isLinkInSimPath && (
                  <line
                    x1={devFrom.x}
                    y1={devFrom.y}
                    x2={devTo.x}
                    y2={devTo.y}
                    stroke="#38bdf8"
                    strokeWidth="6"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                )}
                {/* Main Link line */}
                <line
                  x1={devFrom.x}
                  y1={devFrom.y}
                  x2={devTo.x}
                  y2={devTo.y}
                  stroke={link.status === 'down' ? '#ef4444' : strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeOpacity={link.status === 'down' ? 0.4 : 0.85}
                  strokeLinecap="round"
                />

                {/* Link midpoint badge */}
                <circle
                  cx={(devFrom.x + devTo.x) / 2}
                  cy={(devFrom.y + devTo.y) / 2}
                  r="3.5"
                  fill={link.status === 'down' ? '#ef4444' : strokeColor}
                />
              </g>
            );
          })}

          {/* Wi-Fi Client Association Links */}
          {devices.filter(d => d.associatedApId).map(client => {
            const ap = deviceMap.get(client.associatedApId!);
            if (!ap) return null;
            return (
              <g key={`wifi-assoc-${client.id}`}>
                <line
                  x1={client.x}
                  y1={client.y}
                  x2={ap.x}
                  y2={ap.y}
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
              </g>
            );
          })}

          {/* Co-Channel Interference Warning Lines */}
          {showWlanCoverage && cciIssues.map(issue => {
            const ap1 = deviceMap.get(issue.apId1);
            const ap2 = deviceMap.get(issue.apId2);
            if (!ap1 || !ap2) return null;
            return (
              <g key={`cci-${issue.apId1}-${issue.apId2}`}>
                <line
                  x1={ap1.x}
                  y1={ap1.y}
                  x2={ap2.x}
                  y2={ap2.y}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  strokeOpacity="0.75"
                />
                <circle
                  cx={(ap1.x + ap2.x) / 2}
                  cy={(ap1.y + ap2.y) / 2}
                  r="10"
                  fill="#ef4444"
                  fillOpacity="0.2"
                  stroke="#ef4444"
                />
              </g>
            );
          })}

          {/* Active Ping In-Flight Glowing Packet */}
          {packetPosition && (
            <g transform={`translate(${packetPosition.x}, ${packetPosition.y})`} filter="url(#packet-glow)">
              <circle r="14" fill="#38bdf8" fillOpacity="0.3" className="animate-ping" />
              <circle r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Interactive Device Nodes (HTML/DOM for crisp typography & accessible events) */}
        {devices.map(device => {
          const isSelected = selectedDeviceId === device.id;
          const primaryIf = device.interfaces[0];
          const primaryIp = primaryIf?.ip;
          const vlan = device.vlanId ? vlanMap.get(device.vlanId) : undefined;

          return (
            <div
              key={device.id}
              onMouseDown={e => handleDeviceMouseDown(e, device)}
              style={{
                position: 'absolute',
                left: `${device.x}px`,
                top: `${device.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`device-node group cursor-pointer transition-transform duration-75 select-none ${
                isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'
              }`}
            >
              {/* Outer Card */}
              <div 
                className={`relative flex flex-col items-center p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
                  isSelected 
                    ? 'bg-[#15203b] border-cyan-400 ring-2 ring-cyan-400/40 shadow-cyan-500/30'
                    : 'bg-[#0f172a]/95 border-slate-700/80 hover:border-slate-500'
                }`}
                style={{ width: '130px' }}
              >
                {/* Status Dot & VLAN pill */}
                <div className="w-full flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1">
                    <span 
                      className={`w-2 h-2 rounded-full ${
                        device.isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-[9px] uppercase font-mono tracking-tighter text-slate-400">
                      {device.tier}
                    </span>
                  </div>

                  {vlan && (
                    <span 
                      className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold"
                      style={{ 
                        backgroundColor: `${vlan.color}25`, 
                        color: vlan.color,
                        border: `1px solid ${vlan.color}50`
                      }}
                    >
                      VLAN {vlan.id}
                    </span>
                  )}
                </div>

                {/* Device Icon Avatar */}
                <div className="w-10 h-10 rounded-lg bg-slate-800/90 border border-slate-700/60 flex items-center justify-center mb-1.5 shadow-inner">
                  {getDeviceIcon(device.type)}
                </div>

                {/* Device Names */}
                <div className="w-full text-center">
                  <div className="text-[11px] font-bold text-white truncate" title={device.name}>
                    {device.name}
                  </div>
                  <div className="text-[9.5px] font-mono text-cyan-400 truncate">
                    {primaryIp || device.hostname}
                  </div>
                </div>

                {/* Wi-Fi Associated Badge */}
                {device.associatedApId && (
                  <div className="mt-1 flex items-center space-x-1 text-[9px] text-teal-400 font-mono">
                    <Wifi className="w-2.5 h-2.5" />
                    <span>Associated</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
