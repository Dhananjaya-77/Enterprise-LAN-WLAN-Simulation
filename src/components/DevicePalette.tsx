import React from 'react';
import { Device, DeviceType, TierType } from '../types/network';
import { 
  X, 
  Layers, 
  Shield, 
  Router, 
  Server, 
  Radio, 
  Monitor, 
  Laptop, 
  Smartphone, 
  Phone, 
  Cpu, 
  Wifi, 
  Plus 
} from 'lucide-react';

interface DevicePaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDevice: (newDevice: Device) => void;
}

interface PaletteItem {
  type: DeviceType;
  tier: TierType;
  name: string;
  model: string;
  role: string;
  icon: React.ReactNode;
}

export const DevicePalette: React.FC<DevicePaletteProps> = ({
  isOpen,
  onClose,
  onAddDevice,
}) => {
  if (!isOpen) return null;

  const paletteItems: PaletteItem[] = [
    {
      type: 'firewall',
      tier: 'perimeter',
      name: 'NGFW-Firewall',
      model: 'Cisco Firepower 2130',
      role: 'Enterprise Perimeter Firewall & Threat Defense',
      icon: <Shield className="w-5 h-5 text-rose-400" />,
    },
    {
      type: 'core_switch',
      tier: 'core',
      name: 'Core-Switch',
      model: 'Cisco Catalyst 9500',
      role: 'Layer 3 Multilayer 40G Backbone Switch',
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
    },
    {
      type: 'dist_switch',
      tier: 'distribution',
      name: 'Dist-Switch',
      model: 'Cisco Catalyst 9300X',
      role: 'Inter-VLAN SVI Distribution Aggregator',
      icon: <Layers className="w-5 h-5 text-blue-400" />,
    },
    {
      type: 'access_switch',
      tier: 'access',
      name: 'Access-Switch',
      model: 'Cisco Catalyst 9200L',
      role: 'Layer 2 Enterprise Edge Access Switch',
      icon: <Layers className="w-5 h-5 text-indigo-300" />,
    },
    {
      type: 'wlc',
      tier: 'wlan',
      name: 'WLC-Controller',
      model: 'Cisco Catalyst 9800-L',
      role: 'Centralized Wireless Controller for APs',
      icon: <Wifi className="w-5 h-5 text-cyan-300" />,
    },
    {
      type: 'ap',
      tier: 'wlan',
      name: 'AP-Enterprise',
      model: 'Cisco Catalyst 9130AX',
      role: 'Dual-Band 802.11ax Wi-Fi 6 Access Point',
      icon: <Radio className="w-5 h-5 text-emerald-400" />,
    },
    {
      type: 'server',
      tier: 'datacenter',
      name: 'SRV-Application',
      model: 'Dell PowerEdge R750',
      role: 'Data Center Application / Database Server',
      icon: <Server className="w-5 h-5 text-purple-400" />,
    },
    {
      type: 'workstation',
      tier: 'endpoint',
      name: 'PC-Workstation',
      model: 'Dell Precision 3660',
      role: 'Gigabit Ethernet Desktop Workstation',
      icon: <Monitor className="w-5 h-5 text-slate-300" />,
    },
    {
      type: 'laptop',
      tier: 'endpoint',
      name: 'Laptop-User',
      model: 'Lenovo ThinkPad P14s',
      role: 'Wireless Roaming Client (802.11ax)',
      icon: <Laptop className="w-5 h-5 text-teal-300" />,
    },
    {
      type: 'smartphone',
      tier: 'endpoint',
      name: 'Phone-Mobile',
      model: 'Enterprise Smartphone',
      role: 'Mobile Wi-Fi Voice/Data Client',
      icon: <Smartphone className="w-5 h-5 text-sky-300" />,
    },
    {
      type: 'ipphone',
      tier: 'endpoint',
      name: 'VoIP-Phone',
      model: 'Cisco IP Phone 8861',
      role: 'QoS Voice over IP SIP Desk Phone',
      icon: <Phone className="w-5 h-5 text-emerald-300" />,
    },
    {
      type: 'iot_sensor',
      tier: 'endpoint',
      name: 'IoT-Controller',
      model: 'Smart Facility Gateway',
      role: 'BACnet / Modbus Smart Building Sensor',
      icon: <Cpu className="w-5 h-5 text-pink-400" />,
    },
  ];

  const handleSelect = (item: PaletteItem) => {
    const randomHex = Math.floor(Math.random() * 0xff).toString(16).padStart(2, '0');
    const randomId = `node-${Date.now().toString().slice(-4)}`;

    const newDevice: Device = {
      id: randomId,
      name: `${item.name}-${randomId.slice(-3)}`,
      hostname: `${item.name.toLowerCase()}-${randomId.slice(-3)}`,
      type: item.type,
      tier: item.tier,
      x: 600 + (Math.random() * 120 - 60),
      y: 400 + (Math.random() * 120 - 60),
      model: item.model,
      roleDescription: item.role,
      isOnline: true,
      vlanId: item.tier === 'datacenter' ? 99 : item.tier === 'wlan' ? 10 : 20,
      interfaces: [
        {
          id: `if-${randomId}-1`,
          name: item.type === 'laptop' || item.type === 'smartphone' ? 'wlan0' : 'Gi0/1',
          type: item.type === 'laptop' || item.type === 'smartphone' ? 'wireless' : 'copper',
          mac: `00:50:56:b2:${randomHex}:01`,
          ip: item.tier === 'datacenter' ? `10.100.99.${50 + Math.floor(Math.random() * 40)}` : `10.100.20.${100 + Math.floor(Math.random() * 80)}`,
          subnetMask: '255.255.255.0',
          mode: item.type.includes('switch') ? 'trunk' : 'access',
          status: 'up',
          speedMbps: 1000,
          duplex: 'full',
        },
      ],
      ...(item.type === 'ap' ? {
        wirelessRadio: {
          band: '5GHz',
          channel: 48,
          channelWidthMhz: 40,
          txPowerDbm: 18,
          ssid: 'Corp-Secure-WLAN',
          bssid: `70:69:79:d1:${randomHex}:01`,
          security: 'WPA3-Enterprise',
          vlanId: 30,
          radiusMeters: 170,
          connectedClientIds: [],
        }
      } : {}),
    };

    onAddDevice(newDevice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11192d]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Enterprise Hardware Node</h2>
              <p className="text-xs text-slate-400">Select network hardware to spawn into the live canvas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid of Devices */}
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[70vh]">
          {paletteItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(item)}
              className="bg-[#11192d] hover:bg-[#16223d] border border-slate-800 hover:border-cyan-500/50 p-3.5 rounded-xl text-left transition group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                  {item.icon}
                </div>
                <div className="font-bold text-white text-xs leading-snug">
                  {item.name}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                  {item.model}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                {item.role}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
