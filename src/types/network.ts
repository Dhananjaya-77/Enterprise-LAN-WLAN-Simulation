export type DeviceType = 
  | 'router'
  | 'firewall'
  | 'core_switch'
  | 'dist_switch'
  | 'access_switch'
  | 'wlc'
  | 'ap'
  | 'server'
  | 'workstation'
  | 'laptop'
  | 'smartphone'
  | 'ipphone'
  | 'iot_sensor';

export type TierType = 
  | 'perimeter'
  | 'datacenter'
  | 'core'
  | 'distribution'
  | 'access'
  | 'wlan'
  | 'endpoint';

export interface NetworkInterface {
  id: string;
  name: string; // e.g. "Gi0/1", "Fa0/24", "wlan0"
  type: 'copper' | 'fiber' | 'wireless';
  mac: string;
  ip?: string;
  subnetMask?: string;
  vlanId?: number; // Port VLAN (for access port)
  mode?: 'access' | 'trunk' | 'routed';
  allowedVlans?: number[]; // For trunk port
  nativeVlan?: number;
  status: 'up' | 'down';
  speedMbps: number; // e.g. 1000, 10000
  duplex: 'full' | 'half';
  connectedToLinkId?: string;
}

export interface RouteEntry {
  id: string;
  destination: string; // e.g. "10.100.20.0"
  netmask: string; // e.g. "255.255.255.0"
  nextHop: string; // e.g. "10.100.1.2" or "Directly Connected"
  interfaceName: string;
  protocol: 'C' | 'S' | 'O' | 'B'; // Connected, Static, OSPF, BGP
  metric: number;
}

export interface ArpEntry {
  ip: string;
  mac: string;
  interfaceName: string;
  type: 'dynamic' | 'static';
}

export interface DhcpPool {
  poolName: string;
  network: string;
  subnetMask: string;
  defaultRouter: string;
  dnsServer: string;
  leaseDays: number;
  excludedAddresses?: string[];
  vlanId: number;
}

export interface WirelessRadioConfig {
  band: '2.4GHz' | '5GHz' | '6GHz';
  channel: number; // e.g. 1, 6, 11 (for 2.4GHz) or 36, 40, 44, 48, 149 (for 5GHz)
  channelWidthMhz: 20 | 40 | 80 | 160;
  txPowerDbm: number; // e.g. 14 to 23 dBm
  ssid: string;
  bssid: string;
  security: 'WPA3-Enterprise' | 'WPA2/WPA3-Personal' | 'Open-CaptivePortal';
  vlanId: number;
  radiusMeters: number; // visual coverage radius
  connectedClientIds: string[];
}

export interface WlcConfig {
  wlcIp: string;
  managedApIds: string[];
  profiles: {
    ssid: string;
    vlanId: number;
    security: string;
    broadcast: boolean;
  }[];
}

export interface AclRule {
  id: string;
  sequence: number;
  action: 'permit' | 'deny';
  protocol: 'ip' | 'tcp' | 'udp' | 'icmp';
  sourceNetwork: string; // e.g. "10.100.40.0" or "any"
  sourceWildcard: string; // e.g. "0.0.1.255"
  destNetwork: string; // e.g. "10.100.99.0" or "any"
  destWildcard: string;
  destPort?: number | string; // e.g. 80, 443, "any"
  description?: string;
}

export interface Device {
  id: string;
  name: string;
  hostname: string;
  type: DeviceType;
  tier: TierType;
  x: number;
  y: number;
  interfaces: NetworkInterface[];
  defaultGateway?: string;
  dnsServer?: string;
  routes?: RouteEntry[];
  arpTable?: ArpEntry[];
  dhcpPools?: DhcpPool[];
  aclRules?: AclRule[];
  wirelessRadio?: WirelessRadioConfig; // For APs
  wlcConfig?: WlcConfig; // For WLC
  associatedApId?: string; // For wireless clients (laptops, phones)
  vlanId?: number; // Primary VLAN of device
  isOnline: boolean;
  model: string;
  roleDescription: string;
}

export interface Link {
  id: string;
  fromDeviceId: string;
  fromInterfaceId: string;
  toDeviceId: string;
  toInterfaceId: string;
  type: 'access' | 'trunk' | 'routed' | 'capwap' | 'etherchannel' | 'wireless_assoc';
  vlanId?: number;
  status: 'up' | 'down' | 'degraded';
  bandwidthGbps: number;
  packetCount: number;
}

export interface VLAN {
  id: number;
  name: string;
  color: string;
  subnet: string;
  cidr: number;
  subnetMask: string;
  gateway: string;
  broadcast: string;
  usableRange: string;
  totalHosts: number;
  usableHosts: number;
  description: string;
  department: string;
}

export interface SubnetRequirement {
  id: string;
  name: string;
  neededHosts: number;
  vlanId: number;
  color: string;
  description: string;
}

export interface SubnetAllocated extends SubnetRequirement {
  network: string;
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  firstUsable: string;
  lastUsable: string;
  broadcast: string;
  totalAddresses: number;
  usableAddresses: number;
  allocated: boolean;
}

export interface PacketHop {
  deviceId: string;
  deviceName: string;
  interfaceName: string;
  action: 'transmit' | 'receive' | 'route' | 'switch' | 'drop' | 'forward' | 'encapsulate' | 'filter_denied';
  detail: string;
  layer1: string;
  layer2: {
    srcMac: string;
    dstMac: string;
    vlanTag?: number;
    frameType: string;
  };
  layer3: {
    srcIp: string;
    dstIp: string;
    ttl: number;
    protocol: string;
  };
  layer4?: {
    type: string;
    code?: number;
    seq?: number;
  };
}

export interface SimulationResult {
  success: boolean;
  sourceDevice: Device;
  destDevice: Device;
  rttMs: number;
  hops: PacketHop[];
  logs: string[];
  failureReason?: string;
  arpResolved: boolean;
  routePath: string[];
}

export interface LabScenario {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'VLAN' | 'Subnetting' | 'WLAN' | 'Security ACL' | 'Routing';
  description: string;
  objective: string;
  hint: string;
  initialBrokenState: Partial<Device>[];
  validationCheck: (devices: Device[], links: Link[], vlans: VLAN[]) => { passed: boolean; message: string };
}
