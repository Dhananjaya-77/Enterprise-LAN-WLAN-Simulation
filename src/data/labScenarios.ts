import { LabScenario } from '../types/network';

export const LAB_SCENARIOS: LabScenario[] = [
  {
    id: 'scen-acl',
    title: 'Lab 1: Guest Wi-Fi Zero-Trust Segmentation',
    category: 'Security ACL',
    difficulty: 'Intermediate',
    description: 'An audit discovered that visitors on Guest-WLAN (VLAN 40) can currently send traffic directly to confidential Data Center servers (VLAN 99). Enterprise security compliance requires strict isolation.',
    objective: 'Enforce an Access Control List (ACL) rule on FW-HQ-01 or SW-CORE-01 that denies traffic from the Guest subnet (10.100.40.0/23) to the Server Farm subnet (10.100.99.0/24).',
    hint: 'Open Edge-Firewall-01 or Core-Switch-01 in the Device Inspector, navigate to the "Security & ACL" tab, and add a rule: Action = Deny, Protocol = IP, Source = 10.100.40.0, Destination = 10.100.99.0.',
    initialBrokenState: [
      {
        id: 'fw-01',
        aclRules: [
          { id: 'acl-temp-allow', sequence: 5, action: 'permit', protocol: 'ip', sourceNetwork: 'any', sourceWildcard: 'any', destNetwork: 'any', destWildcard: 'any', description: 'Overly permissive rule' }
        ]
      }
    ],
    validationCheck: (devices) => {
      const fw = devices.find(d => d.id === 'fw-01');
      const core = devices.find(d => d.id === 'core-01');
      const rules = [...(fw?.aclRules || []), ...(core?.aclRules || [])];
      
      const hasDenyRule = rules.some(r => 
        r.action === 'deny' && 
        (r.sourceNetwork.startsWith('10.100.40') || r.sourceNetwork.startsWith('10.100.41')) &&
        r.destNetwork.startsWith('10.100.99')
      );

      if (hasDenyRule) {
        return { passed: true, message: 'Success! Guest Wi-Fi is strictly blocked from reaching the Data Center server farm.' };
      }
      return { passed: false, message: 'Incomplete: No active ACL rule denies traffic from 10.100.40.0/23 to 10.100.99.0/24.' };
    }
  },
  {
    id: 'scen-rf',
    title: 'Lab 2: Wi-Fi Co-Channel Contention & RF Optimization',
    category: 'WLAN',
    difficulty: 'Beginner',
    description: 'Users on the office floor complain about severe Wi-Fi stutter and slow VoIP calls. Spectrum analysis reveals two adjacent Access Points are broadcasting on the identical 2.4GHz channel.',
    objective: 'Eliminate Co-Channel Interference (CCI) between AP-East-Wing and AP-Exec-Boardroom by re-assigning non-overlapping channels (use channels 1, 6, or 11, or switch to 5GHz/6GHz).',
    hint: 'Click on AP-East-Wing or AP-Exec-Boardroom, switch to the "Wireless Radio" tab, and pick non-overlapping channels separated by at least 5 channels (e.g. Channel 1 and Channel 6).',
    initialBrokenState: [
      {
        id: 'ap-floor1',
        wirelessRadio: {
          band: '2.4GHz',
          channel: 1,
          channelWidthMhz: 20,
          txPowerDbm: 20,
          ssid: 'Corp-Secure-WLAN',
          bssid: '70:69:79:d1:01:02',
          security: 'WPA3-Enterprise',
          vlanId: 30,
          radiusMeters: 170,
          connectedClientIds: ['client-lap1']
        }
      },
      {
        id: 'ap-exec',
        wirelessRadio: {
          band: '2.4GHz',
          channel: 1,
          channelWidthMhz: 20,
          txPowerDbm: 20,
          ssid: 'Guest-WLAN',
          bssid: '70:69:79:d1:03:02',
          security: 'Open-CaptivePortal',
          vlanId: 40,
          radiusMeters: 160,
          connectedClientIds: ['client-guest1']
        }
      }
    ],
    validationCheck: (devices) => {
      const ap1 = devices.find(d => d.id === 'ap-floor1')?.wirelessRadio;
      const ap3 = devices.find(d => d.id === 'ap-exec')?.wirelessRadio;

      if (!ap1 || !ap3) return { passed: false, message: 'Missing AP configuration' };

      if (ap1.band === '2.4GHz' && ap3.band === '2.4GHz') {
        const diff = Math.abs(ap1.channel - ap3.channel);
        if (diff < 5) {
          return { passed: false, message: `Interference detected! Channels ${ap1.channel} and ${ap3.channel} overlap. Maintain at least 5 channels separation (e.g. 1 and 6 or 11).` };
        }
      }

      return { passed: true, message: 'RF Clean! Non-overlapping frequency channels assigned. Airtime utilization optimized.' };
    }
  },
  {
    id: 'scen-gw',
    title: 'Lab 3: Broken Default Gateway & Inter-VLAN Routing',
    category: 'Routing',
    difficulty: 'Beginner',
    description: 'PC-Eng-Station1 in the Engineering department (VLAN 20) is unable to ping the corporate ERP Web Server or access the internet. A junior technician modified the IP settings during maintenance.',
    objective: 'Diagnose PC-Eng-Station1 and correct its Default Gateway to the proper VLAN 20 SVI Gateway (10.100.20.1). Then verify ping connectivity to the ERP Server (10.100.99.20).',
    hint: 'Click on PC-Eng-Station1, check its Network Interface IP and Default Gateway. The gateway must match the VLAN 20 router interface (10.100.20.1), not VLAN 10 (10.100.10.1).',
    initialBrokenState: [
      {
        id: 'client-pc1',
        defaultGateway: '10.100.10.1' // Wrong subnet gateway!
      }
    ],
    validationCheck: (devices) => {
      const pc = devices.find(d => d.id === 'client-pc1');
      if (pc?.defaultGateway === '10.100.20.1') {
        return { passed: true, message: 'Great job! Default gateway set to 10.100.20.1. Inter-VLAN packets now reach the core routing engine!' };
      }
      return { passed: false, message: `PC-Eng-Station1 default gateway is currently "${pc?.defaultGateway || 'None'}". It should be 10.100.20.1.` };
    }
  }
];
