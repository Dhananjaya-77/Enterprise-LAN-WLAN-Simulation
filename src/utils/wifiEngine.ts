import { Device } from '../types/network';

export interface WifiSignalInfo {
  apId: string;
  apName: string;
  ssid: string;
  band: '2.4GHz' | '5GHz' | '6GHz';
  channel: number;
  rssiDbm: number;
  snrDb: number;
  signalQualityPercent: number;
  dataRateMbps: number;
  distancePx: number;
}

export interface CoChannelInterference {
  apId1: string;
  apName1: string;
  apId2: string;
  apName2: string;
  channel1: number;
  channel2: number;
  band: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

const PIXELS_PER_METER = 2.5;

export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function calculateRssi(
  distancePx: number,
  txPowerDbm: number,
  band: '2.4GHz' | '5GHz' | '6GHz'
): number {
  const distanceMeters = Math.max(1, distancePx / PIXELS_PER_METER);
  const n = 3.2;
  const refLoss = band === '2.4GHz' ? 40 : band === '5GHz' ? 46 : 48;
  const pathLoss = refLoss + 10 * n * Math.log10(distanceMeters);
  const rssi = Math.round(txPowerDbm - pathLoss);
  return Math.max(-95, Math.min(-30, rssi));
}

export function rssiToSignalQuality(rssiDbm: number): number {
  if (rssiDbm >= -50) return 100;
  if (rssiDbm <= -90) return 0;
  return Math.round(((rssiDbm - (-90)) / (-50 - (-90))) * 100);
}

export function rssiToDataRate(rssiDbm: number, band: string): number {
  if (rssiDbm > -55) return band === '6GHz' ? 1200 : band === '5GHz' ? 866 : 300;
  if (rssiDbm > -65) return band === '6GHz' ? 866 : band === '5GHz' ? 580 : 144;
  if (rssiDbm > -72) return band === '6GHz' ? 433 : band === '5GHz' ? 288 : 72;
  if (rssiDbm > -80) return band === '6GHz' ? 150 : band === '5GHz' ? 86 : 24;
  return 6;
}

export function scanApsForClient(client: Device, apDevices: Device[]): WifiSignalInfo[] {
  const results: WifiSignalInfo[] = [];

  for (const ap of apDevices) {
    if (!ap.isOnline || !ap.wirelessRadio) continue;
    const radio = ap.wirelessRadio;
    const distPx = calculateDistance(client.x, client.y, ap.x, ap.y);
    const rssi = calculateRssi(distPx, radio.txPowerDbm, radio.band);

    if (rssi >= -86) {
      const snr = Math.max(0, rssi - (-95));
      results.push({
        apId: ap.id,
        apName: ap.name,
        ssid: radio.ssid,
        band: radio.band,
        channel: radio.channel,
        rssiDbm: rssi,
        snrDb: snr,
        signalQualityPercent: rssiToSignalQuality(rssi),
        dataRateMbps: rssiToDataRate(rssi, radio.band),
        distancePx: Math.round(distPx),
      });
    }
  }

  return results.sort((a, b) => b.rssiDbm - a.rssiDbm);
}

export function detectCoChannelInterference(apDevices: Device[]): CoChannelInterference[] {
  const issues: CoChannelInterference[] = [];

  for (let i = 0; i < apDevices.length; i++) {
    for (let j = i + 1; j < apDevices.length; j++) {
      const ap1 = apDevices[i];
      const ap2 = apDevices[j];
      if (!ap1.wirelessRadio || !ap2.wirelessRadio || !ap1.isOnline || !ap2.isOnline) continue;

      const r1 = ap1.wirelessRadio;
      const r2 = ap2.wirelessRadio;

      if (r1.band !== r2.band) continue;

      const dist = calculateDistance(ap1.x, ap1.y, ap2.x, ap2.y);
      const interferenceRadius = 450;

      if (dist < interferenceRadius) {
        if (r1.band === '2.4GHz') {
          const channelDiff = Math.abs(r1.channel - r2.channel);
          if (channelDiff < 5) {
            issues.push({
              apId1: ap1.id,
              apName1: ap1.name,
              apId2: ap2.id,
              apName2: ap2.name,
              channel1: r1.channel,
              channel2: r2.channel,
              band: r1.band,
              severity: channelDiff === 0 ? 'high' : 'medium',
              message: channelDiff === 0
                ? `Co-Channel Interference (CCI): Both APs share Channel ${r1.channel}. Airtime congestion occurs.`
                : `Adjacent Channel Interference (ACI): Channels ${r1.channel} & ${r2.channel} overlap spectral masks (< 5 channels apart).`,
            });
          }
        } else if (r1.band === '5GHz' || r1.band === '6GHz') {
          if (r1.channel === r2.channel) {
            issues.push({
              apId1: ap1.id,
              apName1: ap1.name,
              apId2: ap2.id,
              apName2: ap2.name,
              channel1: r1.channel,
              channel2: r2.channel,
              band: r1.band,
              severity: 'high',
              message: `5GHz/6GHz Co-Channel Contention: Both APs share UNII Channel ${r1.channel}.`,
            });
          }
        }
      }
    }
  }

  return issues;
}
