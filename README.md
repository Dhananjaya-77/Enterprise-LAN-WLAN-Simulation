# Enterprise LAN / WLAN Design & Subnetting Simulator

An interactive, visual, enterprise-grade network simulation and subnetting suite. Designed for network engineers, systems architects, and CCNA / CCNP / CWNA students to model, subnet, configure, and troubleshoot modern enterprise campus architectures.

![Enterprise Studio](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Key Features

### 1. Interactive Multi-Tier Campus Topology Canvas
- **Full Tier Modeling**: Enterprise Perimeter NGFW, Redundant Multilayer Core Switches (40G LACP EtherChannel), Distribution Switches, Access PoE Switches, and Server Farm.
- **Drag-and-Drop Interactive Nodes**: Move devices freely, zoom in/out, pan, and inspect.
- **Dynamic Link Visualization**: 802.1Q trunk links, access ports, routed point-to-point links, and CAPWAP wireless tunnels.

### 2. Variable Length Subnet Masking (VLSM) Engine
- Hierarchical address allocation based on host requirements (descending order sort).
- Prevents address overlap and calculates first usable, last usable, broadcast, prefix, and wildcard masks.
- Visual memory allocation map showing address utilization percentage.
- **1-Click Apply to Topology**: Directly reprovisions IP addresses and gateways across the live simulated canvas!

### 3. Enterprise WLAN 802.11ax RF Heatmap & Roaming Studio
- Real-time RF signal propagation heatmap circles for **2.4 GHz**, **5 GHz**, and **6 GHz Wi-Fi 6E**.
- **Co-Channel Interference (CCI) Detection**: Warns if adjacent APs broadcast on overlapping channels.
- **Wi-Fi Client Roaming (802.11k/r/v)**: Scan visible APs, monitor RSSI (dBm), SNR, and data rates, and roam seamlessly between APs.

### 4. Step-by-Step Packet Tracer & Ping Simulator
- Interactive ICMP Echo Request / Reply simulation between any two endpoints.
- **Full OSI Model Inspector**:
  - Layer 1: Physical medium (Cat6 Copper, Fiber, 802.11ax RF)
  - Layer 2: Source/Destination MAC addresses & 802.1Q VLAN Tags
  - Layer 3: Source/Destination IP, TTL, and Inter-VLAN SVI routing
  - Layer 4: ICMP Type, Code, and Sequence
- Step Forward, Step Back, Play, Pause, and live diagnostic event log.

### 5. Automated Cisco IOS & ArubaOS-CX CLI Generator
- Generates production-ready configurations for switches, routers, and WLCs:
  - VLAN creation & SVIs
  - Trunking (`switchport mode trunk`, `allowed vlan`)
  - Inter-VLAN routing (`ip routing`)
  - DHCP Relay pools (`ip dhcp pool`, `ip helper-address`)
  - Cisco Catalyst 9800 WLC WLAN profiles
  - Security Access Control Lists (ACLs)

### 6. Interactive Lab Challenges & Troubleshooting Scenarios
- Hands-on scenarios (Security ACL isolation, Co-Channel Interference resolution, Default Gateway repair).
- Instant verification engine with confetti feedback upon successful diagnosis.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open browser at
# http://localhost:3000
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 📚 Technical Architecture Documentation
For the complete engineering blueprint, addressing plan, VLAN specifications, and security policies, see:
- [`ENTERPRISE_NETWORK_ARCHITECTURE.md`](./ENTERPRISE_NETWORK_ARCHITECTURE.md)
# Enterprise-LAN-WLAN-Simulation
