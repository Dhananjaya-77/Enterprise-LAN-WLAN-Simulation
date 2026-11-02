import { Device, Link, VLAN, SubnetRequirement } from '../types/network';

export const INITIAL_VLANS: VLAN[] = [
  {
    id: 10,
    name: 'Management & Infra',
    color: '#3b82f6', // blue
    subnet: '10.100.10.0',
    cidr: 24,
    subnetMask: '255.255.255.0',
    gateway: '10.100.10.1',
    broadcast: '10.100.10.255',
    usableRange: '10.100.10.1 - 10.100.10.254',
    totalHosts: 256,
    usableHosts: 254,
    description: 'Network management, switch SVIs, WLC management, and PDU controllers',
    department: 'IT Infrastructure',
  },
  {
    id: 20,
    name: 'Engineering & R&D',
    color: '#8b5cf6', // purple
    subnet: '10.100.20.0',
    cidr: 24,
    subnetMask: '255.255.255.0',
    gateway: '10.100.20.1',
    broadcast: '10.100.20.255',
    usableRange: '10.100.20.1 - 10.100.20.254',
    totalHosts: 256,
    usableHosts: 254,
    description: 'Software development, lab benches, and engineering workstations',
    department: 'Engineering',
  },
  {
    id: 30,
    name: 'Corporate WLAN',
    color: '#06b6d4', // cyan
    subnet: '10.100.30.0',
    cidr: 23,
    subnetMask: '255.255.254.0',
    gateway: '10.100.30.1',
    broadcast: '10.100.31.255',
    usableRange: '10.100.30.1 - 10.100.31.254',
    totalHosts: 512,
    usableHosts: 510,
    description: '802.1X EAP-TLS authenticated corporate laptops, tablets, and smartphones',
    department: 'Enterprise Wireless',
  },
  {
    id: 40,
    name: 'Guest WLAN',
    color: '#f59e0b', // amber
    subnet: '10.100.40.0',
    cidr: 23,
    subnetMask: '255.255.254.0',
    gateway: '10.100.40.1',
    broadcast: '10.100.41.255',
    usableRange: '10.100.40.1 - 10.100.41.254',
    totalHosts: 512,
    usableHosts: 510,
    description: 'Isolated guest internet access with captive portal splash page',
    department: 'Visitors',
  },
  {
    id: 50,
    name: 'Voice over IP (VoIP)',
    color: '#10b981', // emerald
    subnet: '10.100.50.0',
    cidr: 24,
    subnetMask: '255.255.255.0',
    gateway: '10.100.50.1',
    broadcast: '10.100.50.255',
    usableRange: '10.100.50.1 - 10.100.50.254',
    totalHosts: 256,
    usableHosts: 254,
    description: 'High-priority voice traffic with DSCP EF (Expedited Forwarding) QoS',
    department: 'Telephony',
  },
  {
    id: 60,
    name: 'IoT & Facilities',
    color: '#ec4899', // pink
    subnet: '10.100.60.0',
    cidr: 24,
    subnetMask: '255.255.255.0',
    gateway: '10.100.60.1',
    broadcast: '10.100.60.255',
    usableRange: '10.100.60.1 - 10.100.60.254',
    totalHosts: 256,
    usableHosts: 254,
    description: 'HVAC sensors, smart lighting, badge readers, and environmental sensors',
    department: 'Facilities',
  },
  {
    id: 99,
    name: 'Server Farm & DC',
    color: '#6366f1', // indigo
    subnet: '10.100.99.0',
    cidr: 24,
    subnetMask: '255.255.255.0',
    gateway: '10.100.99.1',
    broadcast: '10.100.99.255',
    usableRange: '10.100.99.1 - 10.100.99.254',
    totalHosts: 256,
    usableHosts: 254,
    description: 'Internal enterprise servers (Active Directory, DNS, RADIUS, DB)',
    department: 'Data Center',
  },
];

export const INITIAL_SUBNET_REQUIREMENTS: SubnetRequirement[] = [
  { id: 'req-1', name: 'Corporate WLAN', neededHosts: 450, vlanId: 30, color: '#06b6d4', description: 'Employees Wi-Fi' },
  { id: 'req-2', name: 'Guest Wi-Fi', neededHosts: 300, vlanId: 40, color: '#f59e0b', description: 'Visitors / Events' },
  { id: 'req-3', name: 'Engineering & R&D', neededHosts: 120, vlanId: 20, color: '#8b5cf6', description: 'Developers & Lab' },
  { id: 'req-4', name: 'Voice over IP (VoIP)', neededHosts: 90, vlanId: 50, color: '#10b981', description: 'Desk Phones' },
  { id: 'req-5', name: 'IoT & Building Auto', neededHosts: 60, vlanId: 60, color: '#ec4899', description: 'Sensors & Security' },
  { id: 'req-6', name: 'Server Farm & DC', neededHosts: 45, vlanId: 99, color: '#6366f1', description: 'Core Application Servers' },
  { id: 'req-7', name: 'Network Management', neededHosts: 25, vlanId: 10, color: '#3b82f6', description: 'Switch & Router SVIs' },
  { id: 'req-8', name: 'Core Routed Interconnect', neededHosts: 2, vlanId: 101, color: '#94a3b8', description: 'Point-to-Point L3 Link' },
];

export const INITIAL_DEVICES: Device[] = [
  // --- Perimeter Tier ---
  {
    id: 'fw-01',
    name: 'Edge-Firewall-01',
    hostname: 'FW-HQ-01',
    type: 'firewall',
    tier: 'perimeter',
    x: 620,
    y: 60,
    model: 'Cisco Firepower 2130 NGFW',
    roleDescription: 'Enterprise Edge Perimeter Firewall & NAT Gateway',
    isOnline: true,
    vlanId: 10,
    interfaces: [
      { id: 'fw-eth1', name: 'Gi1/1', type: 'fiber', mac: '00:1a:2b:3c:4d:01', ip: '203.0.113.2', subnetMask: '255.255.255.252', mode: 'routed', status: 'up', speedMbps: 10000, duplex: 'full' },
      { id: 'fw-eth2', name: 'Gi1/2', type: 'fiber', mac: '00:1a:2b:3c:4d:02', ip: '10.100.1.1', subnetMask: '255.255.255.252', mode: 'routed', status: 'up', speedMbps: 10000, duplex: 'full' }
    ],
    aclRules: [
      { id: 'acl-1', sequence: 10, action: 'permit', protocol: 'icmp', sourceNetwork: '10.100.0.0', sourceWildcard: '0.0.255.255', destNetwork: 'any', destWildcard: 'any', description: 'Allow ICMP Echo across Campus' },
      { id: 'acl-2', sequence: 20, action: 'deny', protocol: 'ip', sourceNetwork: '10.100.40.0', sourceWildcard: '0.0.1.255', destNetwork: '10.100.99.0', destWildcard: '0.0.0.255', description: 'Block Guest WLAN access to Server Farm' }
    ]
  },

  // --- Core Tier ---
  {
    id: 'core-01',
    name: 'Core-Switch-01',
    hostname: 'SW-CORE-01',
    type: 'core_switch',
    tier: 'core',
    x: 500,
    y: 180,
    model: 'Cisco Catalyst 9500 48Y4C',
    roleDescription: 'Primary Campus Backbone Multilayer Core Switch',
    isOnline: true,
    vlanId: 10,
    defaultGateway: '10.100.1.1',
    interfaces: [
      { id: 'core1-gi1', name: 'FortyGigE1/1/1', type: 'fiber', mac: '00:0c:29:aa:01:01', ip: '10.100.1.2', subnetMask: '255.255.255.252', mode: 'routed', status: 'up', speedMbps: 40000, duplex: 'full' },
      { id: 'core1-gi2', name: 'TwentyFiveGigE1/0/1', type: 'fiber', mac: '00:0c:29:aa:01:02', mode: 'trunk', status: 'up', speedMbps: 25000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 20, 30, 40, 50, 60, 99] },
      { id: 'core1-gi3', name: 'TwentyFiveGigE1/0/2', type: 'fiber', mac: '00:0c:29:aa:01:03', mode: 'trunk', status: 'up', speedMbps: 25000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 20, 30, 40, 50, 60, 99] },
      { id: 'core1-gi4', name: 'TenGigE1/0/3', type: 'fiber', mac: '00:0c:29:aa:01:04', mode: 'trunk', status: 'up', speedMbps: 10000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 99] }
    ]
  },
  {
    id: 'core-02',
    name: 'Core-Switch-02',
    hostname: 'SW-CORE-02',
    type: 'core_switch',
    tier: 'core',
    x: 740,
    y: 180,
    model: 'Cisco Catalyst 9500 48Y4C',
    roleDescription: 'Secondary Redundant Backbone Core Switch (StackWise/VSS)',
    isOnline: true,
    vlanId: 10,
    interfaces: [
      { id: 'core2-gi1', name: 'FortyGigE1/1/1', type: 'fiber', mac: '00:0c:29:aa:02:01', mode: 'trunk', status: 'up', speedMbps: 40000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 20, 30, 40, 50, 60, 99] },
      { id: 'core2-gi2', name: 'TwentyFiveGigE1/0/1', type: 'fiber', mac: '00:0c:29:aa:02:02', mode: 'trunk', status: 'up', speedMbps: 25000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 20, 30, 40, 50, 60, 99] }
    ]
  },

  // --- Data Center / Server Farm Tier ---
  {
    id: 'srv-dc',
    name: 'SRV-DC-DHCP-DNS',
    hostname: 'srv-dc01.corp',
    type: 'server',
    tier: 'datacenter',
    x: 230,
    y: 140,
    model: 'Dell PowerEdge R750',
    roleDescription: 'Active Directory Domain Controller, Centralized DHCP Relay & DNS',
    isOnline: true,
    vlanId: 99,
    defaultGateway: '10.100.99.1',
    interfaces: [
      { id: 'srv1-eth0', name: 'eth0', type: 'copper', mac: '00:50:56:a1:01:10', ip: '10.100.99.10', subnetMask: '255.255.255.0', vlanId: 99, mode: 'access', status: 'up', speedMbps: 10000, duplex: 'full' }
    ]
  },
  {
    id: 'srv-web',
    name: 'SRV-ERP-WEB',
    hostname: 'srv-erp.corp',
    type: 'server',
    tier: 'datacenter',
    x: 230,
    y: 240,
    model: 'Dell PowerEdge R650',
    roleDescription: 'Corporate Enterprise Resource Planning & Internal Web Portal',
    isOnline: true,
    vlanId: 99,
    defaultGateway: '10.100.99.1',
    interfaces: [
      { id: 'srv2-eth0', name: 'eth0', type: 'copper', mac: '00:50:56:a1:01:20', ip: '10.100.99.20', subnetMask: '255.255.255.0', vlanId: 99, mode: 'access', status: 'up', speedMbps: 10000, duplex: 'full' }
    ]
  },
  {
    id: 'srv-radius',
    name: 'SRV-AAA-RADIUS',
    hostname: 'srv-radius.corp',
    type: 'server',
    tier: 'datacenter',
    x: 230,
    y: 340,
    model: 'Cisco ISE 3315 Appliance',
    roleDescription: '802.1X Wireless & Wired Network Access Control / AAA Authentication',
    isOnline: true,
    vlanId: 99,
    defaultGateway: '10.100.99.1',
    interfaces: [
      { id: 'srv3-eth0', name: 'eth0', type: 'copper', mac: '00:50:56:a1:01:30', ip: '10.100.99.30', subnetMask: '255.255.255.0', vlanId: 99, mode: 'access', status: 'up', speedMbps: 1000, duplex: 'full' }
    ]
  },

  // --- Distribution Tier ---
  {
    id: 'dist-east',
    name: 'Dist-SW-East',
    hostname: 'SW-DIST-E01',
    type: 'dist_switch',
    tier: 'distribution',
    x: 430,
    y: 320,
    model: 'Cisco Catalyst 9300X 24Y',
    roleDescription: 'Distribution Layer Switch - East Wing & Engineering Building',
    isOnline: true,
    vlanId: 10,
    defaultGateway: '10.100.10.1',
    interfaces: [
      { id: 'de-gi1', name: 'TenGigE1/1/1', type: 'fiber', mac: '00:1c:58:b2:01:01', mode: 'trunk', status: 'up', speedMbps: 10000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 20, 50, 99] },
      { id: 'de-gi2', name: 'Gi1/0/1', type: 'copper', mac: '00:1c:58:b2:01:02', mode: 'trunk', status: 'up', speedMbps: 1000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 20, 50] },
      { id: 'de-gi3', name: 'Gi1/0/2', type: 'copper', mac: '00:1c:58:b2:01:03', mode: 'trunk', status: 'up', speedMbps: 1000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 50, 60] }
    ]
  },
  {
    id: 'dist-west',
    name: 'Dist-SW-West',
    hostname: 'SW-DIST-W01',
    type: 'dist_switch',
    tier: 'distribution',
    x: 820,
    y: 320,
    model: 'Cisco Catalyst 9300X 24Y',
    roleDescription: 'Distribution Layer Switch - West Wing & Corporate WLAN Feeder',
    isOnline: true,
    vlanId: 10,
    defaultGateway: '10.100.10.1',
    interfaces: [
      { id: 'dw-gi1', name: 'TenGigE1/1/1', type: 'fiber', mac: '00:1c:58:b2:02:01', mode: 'trunk', status: 'up', speedMbps: 10000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 30, 40, 99] },
      { id: 'dw-gi2', name: 'Gi1/0/1', type: 'copper', mac: '00:1c:58:b2:02:02', mode: 'trunk', status: 'up', speedMbps: 1000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 30, 40] }
    ]
  },

  // --- Access Tier (Wired Switches) ---
  {
    id: 'acc-eng',
    name: 'Acc-SW-Engineering',
    hostname: 'SW-ACC-ENG01',
    type: 'access_switch',
    tier: 'access',
    x: 360,
    y: 470,
    model: 'Cisco Catalyst 9200 48P PoE+',
    roleDescription: 'Layer 2 Access Switch for Engineering Labs & Workstations',
    isOnline: true,
    vlanId: 20,
    interfaces: [
      { id: 'ae-up1', name: 'Gi1/0/49', type: 'copper', mac: '00:23:04:c3:01:49', mode: 'trunk', status: 'up', speedMbps: 1000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 20, 50] },
      { id: 'ae-fa1', name: 'Fa0/1', type: 'copper', mac: '00:23:04:c3:01:01', ip: '10.100.20.15', subnetMask: '255.255.255.0', vlanId: 20, mode: 'access', status: 'up', speedMbps: 1000, duplex: 'full' },
      { id: 'ae-fa2', name: 'Fa0/2', type: 'copper', mac: '00:23:04:c3:01:02', ip: '10.100.50.15', subnetMask: '255.255.255.0', vlanId: 50, mode: 'access', status: 'up', speedMbps: 1000, duplex: 'full' }
    ]
  },
  {
    id: 'acc-fac',
    name: 'Acc-SW-Facilities',
    hostname: 'SW-ACC-FAC01',
    type: 'access_switch',
    tier: 'access',
    x: 520,
    y: 470,
    model: 'Cisco Catalyst 9200L 24P',
    roleDescription: 'Access Switch for IoT, HVAC and Building Security Controllers',
    isOnline: true,
    vlanId: 60,
    interfaces: [
      { id: 'af-up1', name: 'Gi1/0/24', type: 'copper', mac: '00:23:04:c3:02:24', mode: 'trunk', status: 'up', speedMbps: 1000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 60] },
      { id: 'af-fa1', name: 'Fa0/1', type: 'copper', mac: '00:23:04:c3:02:01', ip: '10.100.60.20', subnetMask: '255.255.255.0', vlanId: 60, mode: 'access', status: 'up', speedMbps: 100, duplex: 'full' }
    ]
  },
  {
    id: 'acc-poe-wlan',
    name: 'Acc-SW-PoE-WLAN',
    hostname: 'SW-ACC-POE01',
    type: 'access_switch',
    tier: 'access',
    x: 820,
    y: 470,
    model: 'Cisco Catalyst 9300 48U mGig PoE++',
    roleDescription: 'High-Density 802.3bt Multi-Gigabit PoE Switch powering Access Points',
    isOnline: true,
    vlanId: 10,
    interfaces: [
      { id: 'apoe-up1', name: 'Gi1/0/49', type: 'fiber', mac: '00:23:04:c3:03:49', mode: 'trunk', status: 'up', speedMbps: 10000, duplex: 'full', nativeVlan: 99, allowedVlans: [10, 30, 40] },
      { id: 'apoe-p1', name: 'mGi1/0/1', type: 'copper', mac: '00:23:04:c3:03:01', mode: 'trunk', status: 'up', speedMbps: 5000, duplex: 'full', nativeVlan: 10, allowedVlans: [10, 30, 40] },
      { id: 'apoe-p2', name: 'mGi1/0/2', type: 'copper', mac: '00:23:04:c3:03:02', mode: 'trunk', status: 'up', speedMbps: 5000, duplex: 'full', nativeVlan: 10, allowedVlans: [10, 30, 40] },
      { id: 'apoe-p3', name: 'mGi1/0/3', type: 'copper', mac: '00:23:04:c3:03:03', mode: 'trunk', status: 'up', speedMbps: 5000, duplex: 'full', nativeVlan: 10, allowedVlans: [10, 30, 40] }
    ]
  },

  // --- WLAN Architecture (WLC & APs) ---
  {
    id: 'wlc-01',
    name: 'WLC-Catalyst-9800',
    hostname: 'WLC-HQ-01',
    type: 'wlc',
    tier: 'wlan',
    x: 1000,
    y: 320,
    model: 'Cisco Catalyst 9800-L Wireless Controller',
    roleDescription: 'Centralized Campus WLAN Controller managing Lightweight APs & RF Profiles',
    isOnline: true,
    vlanId: 10,
    defaultGateway: '10.100.10.1',
    interfaces: [
      { id: 'wlc-gi1', name: 'Gi0/1', type: 'fiber', mac: '00:27:0d:51:01:01', ip: '10.100.10.15', subnetMask: '255.255.255.0', mode: 'trunk', status: 'up', speedMbps: 10000, duplex: 'full', nativeVlan: 10, allowedVlans: [10, 30, 40] }
    ],
    wlcConfig: {
      wlcIp: '10.100.10.15',
      managedApIds: ['ap-floor1', 'ap-floor2', 'ap-exec'],
      profiles: [
        { ssid: 'Corp-Secure-WLAN', vlanId: 30, security: 'WPA3-Enterprise', broadcast: true },
        { ssid: 'Guest-WLAN', vlanId: 40, security: 'Open-CaptivePortal', broadcast: true }
      ]
    }
  },
  {
    id: 'ap-floor1',
    name: 'AP-East-Wing',
    hostname: 'AP-01-EAST',
    type: 'ap',
    tier: 'wlan',
    x: 710,
    y: 600,
    model: 'Cisco Catalyst 9130AX Series Wi-Fi 6',
    roleDescription: 'Enterprise 8x8 Dual-Band AP covering East Offices & Open Space',
    isOnline: true,
    vlanId: 10,
    defaultGateway: '10.100.10.1',
    interfaces: [
      { id: 'ap1-eth', name: 'mGig0', type: 'copper', mac: '70:69:79:d1:01:01', ip: '10.100.10.101', subnetMask: '255.255.255.0', mode: 'trunk', status: 'up', speedMbps: 5000, duplex: 'full' }
    ],
    wirelessRadio: {
      band: '5GHz',
      channel: 36,
      channelWidthMhz: 40,
      txPowerDbm: 18,
      ssid: 'Corp-Secure-WLAN',
      bssid: '70:69:79:d1:01:02',
      security: 'WPA3-Enterprise',
      vlanId: 30,
      radiusMeters: 170,
      connectedClientIds: ['client-lap1']
    }
  },
  {
    id: 'ap-floor2',
    name: 'AP-West-Wing',
    hostname: 'AP-02-WEST',
    type: 'ap',
    tier: 'wlan',
    x: 930,
    y: 600,
    model: 'Cisco Catalyst 9130AX Series Wi-Fi 6',
    roleDescription: 'Enterprise 8x8 Dual-Band AP covering West Offices & Cafeteria',
    isOnline: true,
    vlanId: 10,
    defaultGateway: '10.100.10.1',
    interfaces: [
      { id: 'ap2-eth', name: 'mGig0', type: 'copper', mac: '70:69:79:d1:02:01', ip: '10.100.10.102', subnetMask: '255.255.255.0', mode: 'trunk', status: 'up', speedMbps: 5000, duplex: 'full' }
    ],
    wirelessRadio: {
      band: '5GHz',
      channel: 44,
      channelWidthMhz: 40,
      txPowerDbm: 18,
      ssid: 'Corp-Secure-WLAN',
      bssid: '70:69:79:d1:02:02',
      security: 'WPA3-Enterprise',
      vlanId: 30,
      radiusMeters: 170,
      connectedClientIds: ['client-phone1']
    }
  },
  {
    id: 'ap-exec',
    name: 'AP-Exec-Boardroom',
    hostname: 'AP-03-EXEC',
    type: 'ap',
    tier: 'wlan',
    x: 1140,
    y: 600,
    model: 'Cisco Catalyst 9136 Wi-Fi 6E (6GHz)',
    roleDescription: 'Tri-band Wi-Fi 6E AP serving Executive Suites & Boardroom',
    isOnline: true,
    vlanId: 10,
    defaultGateway: '10.100.10.1',
    interfaces: [
      { id: 'ap3-eth', name: 'mGig0', type: 'copper', mac: '70:69:79:d1:03:01', ip: '10.100.10.103', subnetMask: '255.255.255.0', mode: 'trunk', status: 'up', speedMbps: 5000, duplex: 'full' }
    ],
    wirelessRadio: {
      band: '2.4GHz',
      channel: 1,
      channelWidthMhz: 20,
      txPowerDbm: 17,
      ssid: 'Guest-WLAN',
      bssid: '70:69:79:d1:03:02',
      security: 'Open-CaptivePortal',
      vlanId: 40,
      radiusMeters: 160,
      connectedClientIds: ['client-guest1']
    }
  },

  // --- Endpoints & Clients ---
  {
    id: 'client-pc1',
    name: 'PC-Eng-Station1',
    hostname: 'eng-ws-01.corp',
    type: 'workstation',
    tier: 'endpoint',
    x: 290,
    y: 600,
    model: 'HP Z4 Workstation',
    roleDescription: 'Engineering CAD & Firmware Simulation Workstation (Wired)',
    isOnline: true,
    vlanId: 20,
    defaultGateway: '10.100.20.1',
    dnsServer: '10.100.99.10',
    interfaces: [
      { id: 'cpc1-eth', name: 'eth0', type: 'copper', mac: 'd8:5e:d3:01:11:01', ip: '10.100.20.50', subnetMask: '255.255.255.0', vlanId: 20, mode: 'access', status: 'up', speedMbps: 1000, duplex: 'full' }
    ]
  },
  {
    id: 'client-phone1',
    name: 'VoIP-Phone-8865',
    hostname: 'voip-desk-01.corp',
    type: 'ipphone',
    tier: 'endpoint',
    x: 420,
    y: 600,
    model: 'Cisco IP Phone 8865 Video Phone',
    roleDescription: 'Executive Desk Phone on Voice VLAN 50 with QoS prioritization',
    isOnline: true,
    vlanId: 50,
    defaultGateway: '10.100.50.1',
    interfaces: [
      { id: 'cph1-eth', name: 'sw-port', type: 'copper', mac: '00:6b:f1:02:22:01', ip: '10.100.50.55', subnetMask: '255.255.255.0', vlanId: 50, mode: 'access', status: 'up', speedMbps: 1000, duplex: 'full' }
    ]
  },
  {
    id: 'client-iot1',
    name: 'HVAC-BACnet-Node',
    hostname: 'hvac-ctrl-01.facility',
    type: 'iot_sensor',
    tier: 'endpoint',
    x: 540,
    y: 600,
    model: 'Johnson Controls Metasys Controller',
    roleDescription: 'Facility HVAC and Environmental Air Monitoring Controller',
    isOnline: true,
    vlanId: 60,
    defaultGateway: '10.100.60.1',
    interfaces: [
      { id: 'ciot1-eth', name: 'eth0', type: 'copper', mac: '00:80:41:03:33:01', ip: '10.100.60.80', subnetMask: '255.255.255.0', vlanId: 60, mode: 'access', status: 'up', speedMbps: 100, duplex: 'full' }
    ]
  },
  {
    id: 'client-lap1',
    name: 'Laptop-Dev-MacBook',
    hostname: 'mbp-dev-alice.corp',
    type: 'laptop',
    tier: 'endpoint',
    x: 690,
    y: 720,
    model: 'Apple MacBook Pro M3',
    roleDescription: 'Lead Developer Laptop roaming on Corporate Wi-Fi 6',
    isOnline: true,
    vlanId: 30,
    associatedApId: 'ap-floor1',
    defaultGateway: '10.100.30.1',
    dnsServer: '10.100.99.10',
    interfaces: [
      { id: 'clap1-wlan', name: 'en0', type: 'wireless', mac: 'f4:d4:88:04:44:01', ip: '10.100.30.120', subnetMask: '255.255.254.0', vlanId: 30, mode: 'access', status: 'up', speedMbps: 866, duplex: 'full' }
    ]
  },
  {
    id: 'client-phone2',
    name: 'Phone-Corp-Pixel',
    hostname: 'pixel8-corp.corp',
    type: 'smartphone',
    tier: 'endpoint',
    x: 950,
    y: 720,
    model: 'Google Pixel 8 Pro',
    roleDescription: 'Employee Corporate Smartphone connected to 5GHz AP-02',
    isOnline: true,
    vlanId: 30,
    associatedApId: 'ap-floor2',
    defaultGateway: '10.100.30.1',
    interfaces: [
      { id: 'cpho2-wlan', name: 'wlan0', type: 'wireless', mac: '94:e6:f7:05:55:01', ip: '10.100.30.145', subnetMask: '255.255.254.0', vlanId: 30, mode: 'access', status: 'up', speedMbps: 580, duplex: 'full' }
    ]
  },
  {
    id: 'client-guest1',
    name: 'Laptop-Guest-ThinkPad',
    hostname: 'guest-tp-contractor',
    type: 'laptop',
    tier: 'endpoint',
    x: 1150,
    y: 720,
    model: 'Lenovo ThinkPad X1 Carbon',
    roleDescription: 'Visiting Consultant Laptop on Guest Wi-Fi (Captive Portal)',
    isOnline: true,
    vlanId: 40,
    associatedApId: 'ap-exec',
    defaultGateway: '10.100.40.1',
    interfaces: [
      { id: 'cguest-wlan', name: 'wlan0', type: 'wireless', mac: 'ac:bc:32:06:66:01', ip: '10.100.40.95', subnetMask: '255.255.254.0', vlanId: 40, mode: 'access', status: 'up', speedMbps: 144, duplex: 'full' }
    ]
  }
];

export const INITIAL_LINKS: Link[] = [
  // Firewall to Core
  { id: 'link-fw-core1', fromDeviceId: 'fw-01', fromInterfaceId: 'fw-eth2', toDeviceId: 'core-01', toInterfaceId: 'core1-gi1', type: 'routed', status: 'up', bandwidthGbps: 40, packetCount: 1420 },

  // Core Interconnect (LACP Port-Channel Trunk)
  { id: 'link-core-core', fromDeviceId: 'core-01', fromInterfaceId: 'core1-gi2', toDeviceId: 'core-02', toInterfaceId: 'core2-gi1', type: 'etherchannel', status: 'up', bandwidthGbps: 50, packetCount: 8940 },

  // Core to Data Center Servers
  { id: 'link-core-srv1', fromDeviceId: 'core-01', fromInterfaceId: 'core1-gi4', toDeviceId: 'srv-dc', toInterfaceId: 'srv1-eth0', type: 'trunk', vlanId: 99, status: 'up', bandwidthGbps: 10, packetCount: 6500 },
  { id: 'link-core-srv2', fromDeviceId: 'core-01', fromInterfaceId: 'core1-gi4', toDeviceId: 'srv-web', toInterfaceId: 'srv2-eth0', type: 'trunk', vlanId: 99, status: 'up', bandwidthGbps: 10, packetCount: 4200 },
  { id: 'link-core-srv3', fromDeviceId: 'core-01', fromInterfaceId: 'core1-gi4', toDeviceId: 'srv-radius', toInterfaceId: 'srv3-eth0', type: 'trunk', vlanId: 99, status: 'up', bandwidthGbps: 1, packetCount: 1800 },

  // Core to Distribution Switches
  { id: 'link-core1-distE', fromDeviceId: 'core-01', fromInterfaceId: 'core1-gi3', toDeviceId: 'dist-east', toInterfaceId: 'de-gi1', type: 'trunk', status: 'up', bandwidthGbps: 25, packetCount: 5410 },
  { id: 'link-core1-distW', fromDeviceId: 'core-01', fromInterfaceId: 'core1-gi3', toDeviceId: 'dist-west', toInterfaceId: 'dw-gi1', type: 'trunk', status: 'up', bandwidthGbps: 25, packetCount: 7120 },
  { id: 'link-core2-distW', fromDeviceId: 'core-02', fromInterfaceId: 'core2-gi2', toDeviceId: 'dist-west', toInterfaceId: 'dw-gi1', type: 'trunk', status: 'up', bandwidthGbps: 25, packetCount: 3100 },

  // Dist-East to Access Switches
  { id: 'link-distE-accEng', fromDeviceId: 'dist-east', fromInterfaceId: 'de-gi2', toDeviceId: 'acc-eng', toInterfaceId: 'ae-up1', type: 'trunk', status: 'up', bandwidthGbps: 1, packetCount: 2900 },
  { id: 'link-distE-accFac', fromDeviceId: 'dist-east', fromInterfaceId: 'de-gi3', toDeviceId: 'acc-fac', toInterfaceId: 'af-up1', type: 'trunk', status: 'up', bandwidthGbps: 1, packetCount: 880 },

  // Dist-West to WLC & PoE Switch
  { id: 'link-distW-wlc', fromDeviceId: 'dist-west', fromInterfaceId: 'dw-gi1', toDeviceId: 'wlc-01', toInterfaceId: 'wlc-gi1', type: 'trunk', status: 'up', bandwidthGbps: 10, packetCount: 4100 },
  { id: 'link-distW-poe', fromDeviceId: 'dist-west', fromInterfaceId: 'dw-gi2', toDeviceId: 'acc-poe-wlan', toInterfaceId: 'apoe-up1', type: 'trunk', status: 'up', bandwidthGbps: 10, packetCount: 6800 },

  // PoE Access Switch to APs (CAPWAP Tunnels over PoE mGig)
  { id: 'link-poe-ap1', fromDeviceId: 'acc-poe-wlan', fromInterfaceId: 'apoe-p1', toDeviceId: 'ap-floor1', toInterfaceId: 'ap1-eth', type: 'capwap', status: 'up', bandwidthGbps: 5, packetCount: 3400 },
  { id: 'link-poe-ap2', fromDeviceId: 'acc-poe-wlan', fromInterfaceId: 'apoe-p2', toDeviceId: 'ap-floor2', toInterfaceId: 'ap2-eth', type: 'capwap', status: 'up', bandwidthGbps: 5, packetCount: 2200 },
  { id: 'link-poe-ap3', fromDeviceId: 'acc-poe-wlan', fromInterfaceId: 'apoe-p3', toDeviceId: 'ap-exec', toInterfaceId: 'ap3-eth', type: 'capwap', status: 'up', bandwidthGbps: 5, packetCount: 1500 },

  // Access switches to wired endpoints
  { id: 'link-accEng-pc1', fromDeviceId: 'acc-eng', fromInterfaceId: 'ae-fa1', toDeviceId: 'client-pc1', toInterfaceId: 'cpc1-eth', type: 'access', vlanId: 20, status: 'up', bandwidthGbps: 1, packetCount: 950 },
  { id: 'link-accEng-phone1', fromDeviceId: 'acc-eng', fromInterfaceId: 'ae-fa2', toDeviceId: 'client-phone1', toInterfaceId: 'cph1-eth', type: 'access', vlanId: 50, status: 'up', bandwidthGbps: 1, packetCount: 610 },
  { id: 'link-accFac-iot1', fromDeviceId: 'acc-fac', fromInterfaceId: 'af-fa1', toDeviceId: 'client-iot1', toInterfaceId: 'ciot1-eth', type: 'access', vlanId: 60, status: 'up', bandwidthGbps: 0.1, packetCount: 410 },
];
