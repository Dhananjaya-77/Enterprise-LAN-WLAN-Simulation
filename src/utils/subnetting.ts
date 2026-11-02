import { SubnetRequirement, SubnetAllocated, VLAN } from '../types/network';

export function ipToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

export function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

export function cidrToSubnetMask(cidr: number): string {
  if (cidr === 0) return '0.0.0.0';
  const maskInt = ((0xffffffff << (32 - cidr)) >>> 0);
  return intToIp(maskInt);
}

export function subnetMaskToCidr(mask: string): number {
  const int = ipToInt(mask);
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if ((int & (1 << i)) !== 0) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

export function cidrToWildcardMask(cidr: number): string {
  const maskInt = ((0xffffffff << (32 - cidr)) >>> 0);
  const wildcardInt = (~maskInt) >>> 0;
  return intToIp(wildcardInt);
}

export function getPrefixForHosts(hosts: number): number {
  if (hosts <= 0) return 32;
  const totalNeeded = hosts + 2;
  const hostBits = Math.ceil(Math.log2(totalNeeded));
  const prefix = Math.max(0, Math.min(32, 32 - hostBits));
  return prefix;
}

export function isValidIpv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

export function isIpInSubnet(ip: string, network: string, cidr: number): boolean {
  if (!isValidIpv4(ip) || !isValidIpv4(network)) return false;
  const ipInt = ipToInt(ip);
  const netInt = ipToInt(network);
  const maskInt = ((0xffffffff << (32 - cidr)) >>> 0);
  return (ipInt & maskInt) === (netInt & maskInt);
}

export function calculateVLSM(
  baseNetwork: string,
  baseCidr: number,
  requirements: SubnetRequirement[]
): {
  allocatedSubnets: SubnetAllocated[];
  totalAvailableAddresses: number;
  totalAllocatedAddresses: number;
  totalUsableAllocatedHosts: number;
  utilizationPercentage: number;
  unallocatedBlocks: { network: string; cidr: number; totalIps: number }[];
  errors: string[];
} {
  const errors: string[] = [];
  if (!isValidIpv4(baseNetwork)) {
    return {
      allocatedSubnets: [],
      totalAvailableAddresses: 0,
      totalAllocatedAddresses: 0,
      totalUsableAllocatedHosts: 0,
      utilizationPercentage: 0,
      unallocatedBlocks: [],
      errors: ['Invalid base IPv4 address.'],
    };
  }

  const baseNetInt = ipToInt(baseNetwork);
  const baseMaskInt = ((0xffffffff << (32 - baseCidr)) >>> 0);
  const normalizedBaseNetInt = (baseNetInt & baseMaskInt) >>> 0;

  const totalAvailableAddresses = Math.pow(2, 32 - baseCidr);
  const sortedReqs = [...requirements].sort((a, b) => b.neededHosts - a.neededHosts);

  let currentIpInt = normalizedBaseNetInt;
  const endBaseIpInt = (normalizedBaseNetInt + totalAvailableAddresses) >>> 0;

  const allocatedSubnets: SubnetAllocated[] = [];

  for (const req of sortedReqs) {
    const prefix = getPrefixForHosts(req.neededHosts);
    const blockSize = Math.pow(2, 32 - prefix);

    const remainder = currentIpInt % blockSize;
    if (remainder !== 0) {
      currentIpInt = currentIpInt + (blockSize - remainder);
    }

    if (currentIpInt + blockSize > endBaseIpInt) {
      errors.push(`Subnet requirement "${req.name}" exceeds major network /${baseCidr}.`);
      continue;
    }

    const netIp = intToIp(currentIpInt);
    const subnetMask = cidrToSubnetMask(prefix);
    const wildcardMask = cidrToWildcardMask(prefix);
    const bcastIp = intToIp(currentIpInt + blockSize - 1);
    const firstUsable = intToIp(currentIpInt + 1);
    const lastUsable = intToIp(currentIpInt + blockSize - 2);
    const usableAddresses = Math.max(0, blockSize - 2);

    allocatedSubnets.push({
      ...req,
      network: netIp,
      cidr: prefix,
      subnetMask,
      wildcardMask,
      firstUsable,
      lastUsable,
      broadcast: bcastIp,
      totalAddresses: blockSize,
      usableAddresses,
      allocated: true,
    });

    currentIpInt = currentIpInt + blockSize;
  }

  const unallocatedBlocks: { network: string; cidr: number; totalIps: number }[] = [];
  let remainingIpInt = currentIpInt;
  
  while (remainingIpInt < endBaseIpInt) {
    const remainingIps = endBaseIpInt - remainingIpInt;
    let blockSize = 1;
    while (blockSize * 2 <= remainingIps && (remainingIpInt % (blockSize * 2) === 0)) {
      blockSize *= 2;
    }
    const prefix = 32 - Math.log2(blockSize);
    unallocatedBlocks.push({
      network: intToIp(remainingIpInt),
      cidr: prefix,
      totalIps: blockSize,
    });
    remainingIpInt += blockSize;
  }

  const totalAllocatedAddresses = allocatedSubnets.reduce((sum, s) => sum + s.totalAddresses, 0);
  const totalUsableAllocatedHosts = allocatedSubnets.reduce((sum, s) => sum + s.usableAddresses, 0);
  const utilizationPercentage = totalAvailableAddresses > 0
    ? Math.round((totalAllocatedAddresses / totalAvailableAddresses) * 1000) / 10
    : 0;

  return {
    allocatedSubnets,
    totalAvailableAddresses,
    totalAllocatedAddresses,
    totalUsableAllocatedHosts,
    utilizationPercentage,
    unallocatedBlocks,
    errors,
  };
}

export function subnetsToVlans(subnets: SubnetAllocated[]): VLAN[] {
  return subnets.map(s => ({
    id: s.vlanId,
    name: s.name,
    color: s.color,
    subnet: s.network,
    cidr: s.cidr,
    subnetMask: s.subnetMask,
    gateway: s.firstUsable,
    broadcast: s.broadcast,
    usableRange: `${s.firstUsable} - ${s.lastUsable}`,
    totalHosts: s.totalAddresses,
    usableHosts: s.usableAddresses,
    description: s.description,
    department: s.name,
  }));
}
