import React, { useState } from 'react';
import { 
  Device, 
  Link, 
  VLAN, 
  SubnetRequirement, 
  SubnetAllocated, 
  SimulationResult, 
  LabScenario 
} from './types/network';
import { 
  INITIAL_DEVICES, 
  INITIAL_LINKS, 
  INITIAL_VLANS, 
  INITIAL_SUBNET_REQUIREMENTS 
} from './data/defaultTopology';
import { Header } from './components/Header';
import { TopologyCanvas } from './components/TopologyCanvas';
import { DeviceInspector } from './components/DeviceInspector';
import { VLSMCalculatorModal } from './components/VLSMCalculatorModal';
import { PingSimulationModal } from './components/PingSimulationModal';
import { ConfigGeneratorModal } from './components/ConfigGeneratorModal';
import { LabScenariosModal } from './components/LabScenariosModal';
import { VlanManagerModal } from './components/VlanManagerModal';
import { DevicePalette } from './components/DevicePalette';
import { ExportImportModal } from './components/ExportImportModal';
import { detectCoChannelInterference } from './utils/wifiEngine';
import { subnetsToVlans } from './utils/subnetting';

export function App() {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [links, setLinks] = useState<Link[]>(INITIAL_LINKS);
  const [vlans, setVlans] = useState<VLAN[]>(INITIAL_VLANS);
  const [subnetRequirements, setSubnetRequirements] = useState<SubnetRequirement[]>(INITIAL_SUBNET_REQUIREMENTS);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showWlanCoverage, setShowWlanCoverage] = useState<boolean>(true);

  // Active packet simulation
  const [activeSimulation, setActiveSimulation] = useState<SimulationResult | null>(null);
  const [currentSimHopIndex, setCurrentSimHopIndex] = useState<number>(-1);

  // Modal open states
  const [isSubnetCalcOpen, setIsSubnetCalcOpen] = useState(false);
  const [isPingSimOpen, setIsPingSimOpen] = useState(false);
  const [isVlanManagerOpen, setIsVlanManagerOpen] = useState(false);
  const [isConfigGenOpen, setIsConfigGenOpen] = useState(false);
  const [isLabScenariosOpen, setIsLabScenariosOpen] = useState(false);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // Selected device
  const selectedDevice = devices.find(d => d.id === selectedDeviceId) || null;

  // Wi-Fi RF analysis
  const apDevices = devices.filter(d => d.type === 'ap');
  const cciIssues = detectCoChannelInterference(apDevices);

  // Position updates when user drags a node on the canvas
  const handleUpdateDevicePosition = (id: string, x: number, y: number) => {
    setDevices(prev => prev.map(d => (d.id === id ? { ...d, x, y } : d)));
  };

  // Update device properties from DeviceInspector
  const handleUpdateDevice = (updated: Device) => {
    setDevices(prev => prev.map(d => (d.id === updated.id ? updated : d)));
  };

  // Delete device and its connected links
  const handleDeleteDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    setLinks(prev => prev.filter(l => l.fromDeviceId !== id && l.toDeviceId !== id));
    if (selectedDeviceId === id) {
      setSelectedDeviceId(null);
    }
  };

  // Add new device from palette
  const handleAddDevice = (newDevice: Device) => {
    setDevices(prev => [...prev, newDevice]);
    setSelectedDeviceId(newDevice.id);
  };

  // Apply VLSM allocation across the entire topology
  const handleApplySubnetsToTopology = (allocatedSubnets: SubnetAllocated[]) => {
    const newVlans = subnetsToVlans(allocatedSubnets);
    setVlans(newVlans);

    const vlanLookup = new Map<number, VLAN>(newVlans.map(v => [v.id, v]));

    // Update IP addresses and gateways on devices matching the VLAN
    setDevices(prev =>
      prev.map(dev => {
        if (!dev.vlanId) return dev;
        const vlan = vlanLookup.get(dev.vlanId);
        if (!vlan) return dev;

        const updatedInterfaces = dev.interfaces.map((iface, idx) => {
          if (idx === 0 && iface.ip) {
            const lastOctet = iface.ip.split('.').pop() || '10';
            const subnetPrefix = vlan.subnet.split('.').slice(0, 3).join('.');
            return {
              ...iface,
              ip: `${subnetPrefix}.${lastOctet}`,
              subnetMask: vlan.subnetMask,
            };
          }
          return iface;
        });

        return {
          ...dev,
          defaultGateway: vlan.gateway,
          interfaces: updatedInterfaces,
        };
      })
    );
  };

  // Load broken lab scenario state
  const handleLoadScenario = (scenario: LabScenario) => {
    setDevices(prev =>
      prev.map(d => {
        const broken = scenario.initialBrokenState.find(b => b.id === d.id);
        if (broken) {
          return { ...d, ...broken };
        }
        return d;
      })
    );
  };

  // Reset topology to factory enterprise campus default
  const handleResetTopology = () => {
    if (confirm('Reset canvas to default enterprise multi-tier campus network?')) {
      setDevices(INITIAL_DEVICES);
      setLinks(INITIAL_LINKS);
      setVlans(INITIAL_VLANS);
      setSubnetRequirements(INITIAL_SUBNET_REQUIREMENTS);
      setSelectedDeviceId(null);
      setActiveSimulation(null);
      setCurrentSimHopIndex(-1);
    }
  };

  // Import custom network state
  const handleImportState = (imported: {
    devices: Device[];
    links: Link[];
    vlans: VLAN[];
    subnetRequirements?: SubnetRequirement[];
  }) => {
    setDevices(imported.devices);
    setLinks(imported.links);
    setVlans(imported.vlans);
    if (imported.subnetRequirements) {
      setSubnetRequirements(imported.subnetRequirements);
    }
    setSelectedDeviceId(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080d1a] overflow-hidden">
      {/* Top Navigation & Status Bar */}
      <Header
        onOpenSubnetCalc={() => setIsSubnetCalcOpen(true)}
        onOpenPingSim={() => setIsPingSimOpen(true)}
        onOpenVlanManager={() => setIsVlanManagerOpen(true)}
        onToggleWlanCoverage={() => setShowWlanCoverage(!showWlanCoverage)}
        showWlanCoverage={showWlanCoverage}
        onOpenConfigGen={() => setIsConfigGenOpen(true)}
        onOpenLabScenarios={() => setIsLabScenariosOpen(true)}
        onOpenAddDevice={() => setIsAddDeviceOpen(true)}
        onResetTopology={handleResetTopology}
        onExportImport={() => setIsExportImportOpen(true)}
        deviceCount={devices.length}
        vlanCount={vlans.length}
        wifiIssuesCount={cciIssues.length}
      />

      {/* Main Workspace Area: Canvas + Drawer */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Interactive Topology Canvas */}
        <TopologyCanvas
          devices={devices}
          links={links}
          vlans={vlans}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={dev => setSelectedDeviceId(dev ? dev.id : null)}
          onUpdateDevicePosition={handleUpdateDevicePosition}
          showWlanCoverage={showWlanCoverage}
          activeSimulation={activeSimulation}
          currentSimHopIndex={currentSimHopIndex}
        />

        {/* Selected Device Inspector Panel */}
        {selectedDevice && (
          <DeviceInspector
            device={selectedDevice}
            allDevices={devices}
            vlans={vlans}
            links={links}
            onClose={() => setSelectedDeviceId(null)}
            onUpdateDevice={handleUpdateDevice}
            onDeleteDevice={handleDeleteDevice}
          />
        )}
      </div>

      {/* Interactive Modals */}
      <VLSMCalculatorModal
        isOpen={isSubnetCalcOpen}
        onClose={() => setIsSubnetCalcOpen(false)}
        requirements={subnetRequirements}
        onUpdateRequirements={setSubnetRequirements}
        onApplyToTopology={handleApplySubnetsToTopology}
        currentVlans={vlans}
      />

      <PingSimulationModal
        isOpen={isPingSimOpen}
        onClose={() => setIsPingSimOpen(false)}
        devices={devices}
        links={links}
        vlans={vlans}
        onSimulationStateChange={(sim, hopIdx) => {
          setActiveSimulation(sim);
          setCurrentSimHopIndex(hopIdx);
        }}
      />

      <ConfigGeneratorModal
        isOpen={isConfigGenOpen}
        onClose={() => setIsConfigGenOpen(false)}
        devices={devices}
        vlans={vlans}
        links={links}
      />

      <LabScenariosModal
        isOpen={isLabScenariosOpen}
        onClose={() => setIsLabScenariosOpen(false)}
        devices={devices}
        links={links}
        vlans={vlans}
        onLoadScenario={handleLoadScenario}
      />

      <VlanManagerModal
        isOpen={isVlanManagerOpen}
        onClose={() => setIsVlanManagerOpen(false)}
        vlans={vlans}
        devices={devices}
        onAddVlan={newV => setVlans(prev => [...prev, newV])}
        onDeleteVlan={id => setVlans(prev => prev.filter(v => v.id !== id))}
      />

      <DevicePalette
        isOpen={isAddDeviceOpen}
        onClose={() => setIsAddDeviceOpen(false)}
        onAddDevice={handleAddDevice}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        devices={devices}
        links={links}
        vlans={vlans}
        subnetRequirements={subnetRequirements}
        onImportState={handleImportState}
      />
    </div>
  );
}

export default App;
