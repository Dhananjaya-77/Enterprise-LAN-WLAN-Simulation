# Enterprise Campus LAN / WLAN Network Design & Subnetting Architecture Blueprint

## 1. Executive Summary & Architecture Overview
This blueprint specifies a resilient, high-availability Multi-Tier Campus Network architecture designed for enterprise scalability, strict zero-trust VLAN segmentation, and enterprise Wi-Fi 6 (802.11ax) mobility.

```
                           +---------------------------+
                           |  ISP Gateway / Internet   |
                           +-------------+-------------+
                                         |
                           +-------------+-------------+
                           |   NGFW Edge Firewall      |
                           |  (Cisco Firepower 2130)   |
                           +-------------+-------------+
                                         |
                 =================================================
                 |  Core Backbone Layer (Cisco Catalyst 9500)   |
                 |  SW-CORE-01 <---(40G LACP)---> SW-CORE-02     |
                 =================================================
                         /               |               \
                        /                |                \
       +---------------+   +-------------+-------------+   +---------------+
       | Data Center   |   | Distribution East Wing    |   | Dist West &   |
       | Server Farm   |   | (Cisco Catalyst 9300X)    |   | WLAN Feeder   |
       | (VLAN 99)     |   +-------------+-------------+   +-------+-------+
       +---------------+                 |                         |
                               +---------+---------+       +-------+-------+
                               | Acc-SW-Eng (VL20) |       | Catalyst 9800 |
                               | Acc-SW-Fac (VL60) |       | WLC & PoE SW  |
                               +-------------------+       +-------+-------+
                                                                   |
                                                      +------------+------------+
                                                      | Dual-Band Wi-Fi 6 APs   |
                                                      | (AP-Floor1, AP-Floor2)  |
                                                      +-------------------------+
```

---

## 2. Hierarchical Campus Network Layers

### 2.1 Core Layer (High-Speed Backbone)
- **Devices**: Redundant `SW-CORE-01` and `SW-CORE-02` (Cisco Catalyst 9500 48Y4C).
- **Interconnect**: 40Gbps / 100Gbps LACP EtherChannel (Port-Channel 1) running Cisco StackWise Virtual (SVL).
- **Role**: High-throughput packet forwarding, Zero-packet drops, OSPF routing between enterprise distribution blocks and Data Center.

### 2.2 Distribution Layer (Policy & Routing Boundary)
- **Devices**: `SW-DIST-E01` (East Wing) and `SW-DIST-W01` (West Wing).
- **Role**: 
  - Inter-VLAN Routing via Switched Virtual Interfaces (SVIs).
  - First-Hop Redundancy Protocol (HSRP / VRRP).
  - Centralized DHCP Relay (`ip helper-address 10.100.99.10`).
  - Security Access Control Lists (ACLs) to isolate guest traffic from internal assets.

### 2.3 Access Layer (Edge Switching & PoE)
- **Devices**:
  - `SW-ACC-ENG01` (Cisco Catalyst 9200 48P): Workstations and Lab Engineering.
  - `SW-ACC-FAC01` (Cisco Catalyst 9200L 24P): Building Automation & IoT.
  - `SW-ACC-POE01` (Cisco Catalyst 9300 48U mGig): 802.3bt Multi-Gigabit PoE++ powering Access Points.
- **Port Security**: Spanning Tree PortFast & BPDU Guard enabled on all access edge ports.

### 2.4 Data Center & Server Farm
- **Subnet**: VLAN 99 (`10.100.99.0/24`).
- **Core Enterprise Services**:
  - Active Directory / DNS / Centralized DHCP Server (`10.100.99.10`)
  - Corporate ERP / Web Portal (`10.100.99.20`)
  - Cisco ISE AAA / RADIUS 802.1X Server (`10.100.99.30`)

---

## 3. VLSM Subnetting & IP Addressing Scheme

Major Network Block: **`10.100.0.0/16`** (65,536 Total Addresses)

| VLAN ID | Subnet Name | Host Requirement | Allocated CIDR | Subnet Mask | Usable Host Range | Broadcast Address | Gateway (SVI) |
|---|---|---|---|---|---|---|---|
| **VLAN 30** | Corporate WLAN | 450 hosts | **/23** | 255.255.254.0 | 10.100.30.1 - 10.100.31.254 | 10.100.31.255 | 10.100.30.1 |
| **VLAN 40** | Guest WLAN | 300 hosts | **/23** | 255.255.254.0 | 10.100.40.1 - 10.100.41.254 | 10.100.41.255 | 10.100.40.1 |
| **VLAN 20** | Engineering & R&D | 120 hosts | **/24** | 255.255.255.0 | 10.100.20.1 - 10.100.20.254 | 10.100.20.255 | 10.100.20.1 |
| **VLAN 50** | Voice over IP (VoIP) | 90 hosts | **/24** | 255.255.255.0 | 10.100.50.1 - 10.100.50.254 | 10.100.50.255 | 10.100.50.1 |
| **VLAN 60** | IoT & Facilities | 60 hosts | **/24** | 255.255.255.0 | 10.100.60.1 - 10.100.60.254 | 10.100.60.255 | 10.100.60.1 |
| **VLAN 99** | Server Farm & DC | 45 hosts | **/24** | 255.255.255.0 | 10.100.99.1 - 10.100.99.254 | 10.100.99.255 | 10.100.99.1 |
| **VLAN 10** | Management & Infra | 25 hosts | **/24** | 255.255.255.0 | 10.100.10.1 - 10.100.10.254 | 10.100.10.255 | 10.100.10.1 |
| **VLAN 101** | Core Routed P2P | 2 hosts | **/30** | 255.255.255.252 | 10.100.1.1 - 10.100.1.2 | 10.100.1.3 | N/A |

---

## 4. Wireless LAN (WLAN) Architecture & RF Design

### 4.1 Centralized Wireless LAN Controller (WLC)
- **Controller**: Cisco Catalyst 9800-L Wireless Controller (`10.100.10.15`).
- **Tunnels**: CAPWAP (Control and Provisioning of Wireless Access Points) tunnels encapsulated in UDP 5246/5247 over PoE access switches.

### 4.2 SSIDs & Security Profiles
1. **`Corp-Secure-WLAN` (VLAN 30)**:
   - Security: WPA3-Enterprise / 802.1X with EAP-TLS.
   - Authentication: RADIUS Cisco ISE (`10.100.99.30`).
   - Fast Roaming: 802.11r (Fast BSS Transition) + 802.11k/v Assisted Roaming.
2. **`Guest-WLAN` (VLAN 40)**:
   - Security: Open with Captive Portal Web-Auth.
   - Isolation: Client-to-client isolation (Private VLAN), internet access only.

### 4.3 Radio Frequency (RF) Channel & Power Planning
- **2.4 GHz Band**: Strictly non-overlapping channels **1, 6, 11** (20 MHz channel width).
- **5 GHz Band**: Channels **36, 40, 44, 48 (UNII-1)** and **149 (UNII-3)** (40 MHz channel width for optimal density vs throughput).
- **Transmit Power (Tx Power)**: Set to **17-18 dBm** to match client return path (eliminating "sticky client" problems).

---

## 5. Security & Access Control Policy (Zero-Trust)
1. **Rule 10 (Guest Isolation)**:
   ```cisco
   ip access-list extended GUEST-SECURITY-POLICY
    deny ip 10.100.40.0 0.0.1.255 10.100.99.0 0.0.0.255
    deny ip 10.100.40.0 0.0.1.255 10.100.20.0 0.0.0.255
    permit ip 10.100.40.0 0.0.1.255 any
   ```
2. **Rule 20 (IoT Quarantine)**:
   ```cisco
   ip access-list extended IOT-FACILITIES-POLICY
    permit tcp 10.100.60.0 0.0.0.255 host 10.100.99.20 eq 443
    deny ip 10.100.60.0 0.0.0.255 10.100.0.0 0.0.255.255
    deny ip any any
   ```
