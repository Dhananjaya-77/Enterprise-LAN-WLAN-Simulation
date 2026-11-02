import { Device, Link, VLAN, PacketHop, SimulationResult } from '../types/network';
import { isIpInSubnet } from './subnetting';

export function simulatePing(
  sourceDevice: Device,
  destDevice: Device,
  devices: Device[],
  links: Link[],
  vlans: VLAN[]
): SimulationResult {
  const hops: PacketHop[] = [];
  const logs: string[] = [];
  const routePath: string[] = [];

  const deviceMap = new Map<string, Device>(devices.map(d => [d.id, d]));

  logs.push(`[INIT] Ping initiation from ${sourceDevice.name} (${sourceDevice.interfaces[0]?.ip || 'No IP'}) to ${destDevice.name} (${destDevice.interfaces[0]?.ip || 'No IP'}).`);

  if (!sourceDevice.isOnline) {
    return {
      success: false,
      sourceDevice,
      destDevice,
      rttMs: 0,
      hops,
      logs: [...logs, `[ERROR] Source device ${sourceDevice.name} is powered OFF.`],
      failureReason: `Source device ${sourceDevice.name} is powered OFF.`,
      arpResolved: false,
      routePath: [],
    };
  }

  if (!destDevice.isOnline) {
    return {
      success: false,
      sourceDevice,
      destDevice,
      rttMs: 0,
      hops,
      logs: [...logs, `[ERROR] Destination device ${destDevice.name} is powered OFF.`],
      failureReason: `Destination host unreachable: ${destDevice.name} is offline.`,
      arpResolved: false,
      routePath: [sourceDevice.id],
    };
  }

  const srcIf = sourceDevice.interfaces[0];
  const dstIf = destDevice.interfaces[0];

  if (!srcIf?.ip || !dstIf?.ip) {
    return {
      success: false,
      sourceDevice,
      destDevice,
      rttMs: 0,
      hops,
      logs: [...logs, `[ERROR] Missing IP configuration on interfaces.`],
      failureReason: 'One or both devices have unconfigured IP addresses.',
      arpResolved: false,
      routePath: [sourceDevice.id],
    };
  }

  const srcIp = srcIf.ip;
  const dstIp = dstIf.ip;
  const srcMac = srcIf.mac;
  const dstMac = dstIf.mac;

  const srcVlanId = sourceDevice.vlanId || srcIf.vlanId || 1;
  const dstVlanId = destDevice.vlanId || dstIf.vlanId || 1;
  const isSameVlan = srcVlanId === dstVlanId;

  if (sourceDevice.type === 'laptop' || sourceDevice.type === 'smartphone') {
    if (!sourceDevice.associatedApId) {
      logs.push(`[ERROR] ${sourceDevice.name} is not connected to any Wireless Access Point!`);
      return {
        success: false,
        sourceDevice,
        destDevice,
        rttMs: 0,
        hops,
        logs,
        failureReason: `${sourceDevice.name} has no Wi-Fi association.`,
        arpResolved: false,
        routePath: [sourceDevice.id],
      };
    }
  }

  const adjacency = new Map<string, { neighborId: string; link: Link }[]>();
  for (const d of devices) {
    adjacency.set(d.id, []);
  }

  for (const link of links) {
    if (link.status === 'down') continue;
    adjacency.get(link.fromDeviceId)?.push({ neighborId: link.toDeviceId, link });
    adjacency.get(link.toDeviceId)?.push({ neighborId: link.fromDeviceId, link });
  }

  for (const d of devices) {
    if (d.associatedApId && adjacency.has(d.associatedApId)) {
      const ap = deviceMap.get(d.associatedApId);
      if (ap && ap.isOnline) {
        const dummyLink: Link = {
          id: `wifi-link-${d.id}`,
          fromDeviceId: d.id,
          fromInterfaceId: 'wlan0',
          toDeviceId: ap.id,
          toInterfaceId: 'wlan0',
          type: 'wireless_assoc',
          vlanId: d.vlanId,
          status: 'up',
          bandwidthGbps: 0.866,
          packetCount: 1,
        };
        adjacency.get(d.id)?.push({ neighborId: ap.id, link: dummyLink });
        adjacency.get(ap.id)?.push({ neighborId: d.id, link: dummyLink });
      }
    }
  }

  const queue: { deviceId: string; path: string[]; linkPath: Link[] }[] = [
    { deviceId: sourceDevice.id, path: [sourceDevice.id], linkPath: [] },
  ];
  const visited = new Set<string>([sourceDevice.id]);
  let foundPath: { path: string[]; linkPath: Link[] } | null = null;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.deviceId === destDevice.id) {
      foundPath = current;
      break;
    }

    const neighbors = adjacency.get(current.deviceId) || [];
    for (const { neighborId, link } of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({
          deviceId: neighborId,
          path: [...current.path, neighborId],
          linkPath: [...current.linkPath, link],
        });
      }
    }
  }

  if (!foundPath) {
    logs.push(`[ERROR] No physical or logical link path between ${sourceDevice.name} and ${destDevice.name}.`);
    return {
      success: false,
      sourceDevice,
      destDevice,
      rttMs: 0,
      hops,
      logs,
      failureReason: 'Network unreachable: No connected link path found.',
      arpResolved: false,
      routePath: [sourceDevice.id],
    };
  }

  let aclBlocked = false;
  let aclBlockedHop: PacketHop | null = null;

  for (let i = 0; i < foundPath.path.length; i++) {
    const currId = foundPath.path[i];
    const dev = deviceMap.get(currId)!;
    routePath.push(currId);

    if (i === 0) {
      hops.push({
        deviceId: dev.id,
        deviceName: dev.name,
        interfaceName: srcIf.name,
        action: 'transmit',
        detail: `Echo Request created (ICMP type 8, seq 1). ARP cache checked.`,
        layer1: `Ethernet 1000Base-T (Port ${srcIf.name})`,
        layer2: {
          srcMac,
          dstMac: isSameVlan ? dstMac : '00:00:0c:07:ac:01 (Default GW MAC)',
          vlanTag: srcVlanId,
          frameType: '0x0800 (IPv4)',
        },
        layer3: {
          srcIp,
          dstIp,
          ttl: 128,
          protocol: 'ICMP (1)',
        },
        layer4: {
          type: 'Echo Request',
          code: 0,
          seq: 1,
        },
      });
      logs.push(`[HOP 1] ${dev.name}: ICMP Echo Request originated -> dst ${dstIp}`);
      continue;
    }

    if (dev.aclRules && dev.aclRules.length > 0) {
      for (const rule of dev.aclRules) {
        const matchesProtocol = rule.protocol === 'ip' || rule.protocol === 'icmp';
        const matchesSrc = rule.sourceNetwork === 'any' || isIpInSubnet(srcIp, rule.sourceNetwork, 24);
        const matchesDst = rule.destNetwork === 'any' || isIpInSubnet(dstIp, rule.destNetwork, 24);

        if (matchesProtocol && matchesSrc && matchesDst) {
          if (rule.action === 'deny') {
            aclBlocked = true;
            aclBlockedHop = {
              deviceId: dev.id,
              deviceName: dev.name,
              interfaceName: 'ACL-Filter',
              action: 'filter_denied',
              detail: `Traffic Denied by Access-List #${rule.sequence}: deny ${rule.protocol} ${rule.sourceNetwork} -> ${rule.destNetwork}`,
              layer1: 'Hardware TCAM Lookup',
              layer2: {
                srcMac,
                dstMac,
                vlanTag: srcVlanId,
                frameType: '0x0800',
              },
              layer3: {
                srcIp,
                dstIp,
                ttl: 64,
                protocol: 'ICMP (1)',
              },
            };
            logs.push(`[ACL BLOCK] ${dev.name} denied packet via rule #${rule.sequence}.`);
            break;
          }
        }
      }
    }

    if (aclBlocked) {
      if (aclBlockedHop) hops.push(aclBlockedHop);
      break;
    }

    if (dev.type === 'access_switch' || dev.type === 'dist_switch' || dev.type === 'core_switch') {
      const isRouting = dev.tier === 'core' || dev.tier === 'distribution';
      const actionType = (!isSameVlan && isRouting) ? 'route' : 'switch';
      hops.push({
        deviceId: dev.id,
        deviceName: dev.name,
        interfaceName: `Gi0/${i}`,
        action: actionType,
        detail: actionType === 'route' 
          ? `L3 Multilayer SVI Routing: VLAN ${srcVlanId} -> VLAN ${dstVlanId}. Decremented TTL.`
          : `L2 Switching: MAC table lookup for ${isSameVlan ? dstMac : 'Gateway MAC'}. 802.1Q tagged.`,
        layer1: `Fiber / Copper Gigabit Link`,
        layer2: {
          srcMac,
          dstMac,
          vlanTag: (!isSameVlan && isRouting) ? dstVlanId : srcVlanId,
          frameType: '0x0800',
        },
        layer3: {
          srcIp,
          dstIp,
          ttl: actionType === 'route' ? 127 : 128,
          protocol: 'ICMP',
        },
      });
      logs.push(`[HOP ${i + 1}] ${dev.name}: ${actionType === 'route' ? 'Inter-VLAN Routed' : 'L2 Switched'}`);
    } else if (dev.type === 'ap') {
      hops.push({
        deviceId: dev.id,
        deviceName: dev.name,
        interfaceName: 'wlan0/eth0',
        action: 'encapsulate',
        detail: `CAPWAP Tunnel Processing: 802.11 Wi-Fi frame converted to 802.3 Ethernet.`,
        layer1: `802.11ax RF 5GHz <-> 1000Base-T PoE`,
        layer2: {
          srcMac,
          dstMac,
          vlanTag: srcVlanId,
          frameType: '0x0800',
        },
        layer3: {
          srcIp,
          dstIp,
          ttl: 128,
          protocol: 'ICMP',
        },
      });
      logs.push(`[HOP ${i + 1}] ${dev.name}: Wi-Fi CAPWAP bridging`);
    } else if (dev.id === destDevice.id) {
      hops.push({
        deviceId: dev.id,
        deviceName: dev.name,
        interfaceName: dstIf.name,
        action: 'receive',
        detail: `ICMP Echo Request received. Generating ICMP Echo Reply (Type 0).`,
        layer1: `Port ${dstIf.name}`,
        layer2: {
          srcMac,
          dstMac,
          vlanTag: dstVlanId,
          frameType: '0x0800',
        },
        layer3: {
          srcIp,
          dstIp,
          ttl: 126,
          protocol: 'ICMP',
        },
        layer4: {
          type: 'Echo Reply',
          code: 0,
          seq: 1,
        },
      });
      logs.push(`[HOP ${i + 1}] ${dev.name}: Echo Request accepted! Reply sent.`);
    }
  }

  if (aclBlocked) {
    return {
      success: false,
      sourceDevice,
      destDevice,
      rttMs: 0,
      hops,
      logs,
      failureReason: 'Packet filtered: Dropped by Enterprise Firewall / Switch ACL rule.',
      arpResolved: true,
      routePath,
    };
  }

  if (!isSameVlan) {
    const hasRouter = foundPath.path.some(id => {
      const d = deviceMap.get(id);
      return d && (d.type === 'router' || d.type === 'core_switch' || d.type === 'dist_switch');
    });

    if (!hasRouter) {
      logs.push(`[ERROR] VLAN ${srcVlanId} and VLAN ${dstVlanId} cannot communicate without Layer 3 routing enabled.`);
      return {
        success: false,
        sourceDevice,
        destDevice,
        rttMs: 0,
        hops,
        logs,
        failureReason: `Inter-VLAN Routing Failure: No Layer 3 Core Switch or Router found.`,
        arpResolved: false,
        routePath,
      };
    }
  }

  const hopCount = foundPath.path.length;
  const isWireless = sourceDevice.type === 'laptop' || sourceDevice.type === 'smartphone' || destDevice.type === 'laptop' || destDevice.type === 'smartphone';
  const baseRtt = isWireless ? 4.5 : 0.8;
  const rttMs = Math.round((baseRtt + hopCount * 0.45 + (Math.random() * 0.4)) * 10) / 10;

  logs.push(`[SUCCESS] 4 packets transmitted, 4 received, 0% packet loss, RTT = ${rttMs} ms.`);

  return {
    success: true,
    sourceDevice,
    destDevice,
    rttMs,
    hops,
    logs,
    arpResolved: true,
    routePath,
  };
}
