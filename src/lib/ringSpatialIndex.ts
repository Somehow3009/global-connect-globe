import type { Ring } from '@/lib/polygonUtils';
import { boundsFromRing } from '@/lib/polygonUtils';

type BoundsTuple = [lonMin: number, lonMax: number, latMin: number, latMax: number];

export interface RingSpatialIndex {
  binSizeDeg: number;
  lonBins: number;
  latBins: number;
  bins: Map<string, number[]>;
  bounds: BoundsTuple[];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function key(latBin: number, lonBin: number) {
  return `${latBin},${lonBin}`;
}

/**
 * Very simple lat/lon binning index for many rings.
 * Goal: avoid checking *all* polygons for every sample point.
 */
export function buildRingSpatialIndex(rings: Ring[], binSizeDeg: number = 10): RingSpatialIndex {
  const lonBins = Math.ceil(360 / binSizeDeg);
  const latBins = Math.ceil(180 / binSizeDeg);

  const bins = new Map<string, number[]>();
  const bounds: BoundsTuple[] = new Array(rings.length);

  for (let i = 0; i < rings.length; i++) {
    const b = boundsFromRing(rings[i]);
    bounds[i] = [b.lonMin, b.lonMax, b.latMin, b.latMax];

    const lonStart = clamp(Math.floor((b.lonMin + 180) / binSizeDeg), 0, lonBins - 1);
    const lonEnd = clamp(Math.floor((b.lonMax + 180) / binSizeDeg), 0, lonBins - 1);
    const latStart = clamp(Math.floor((b.latMin + 90) / binSizeDeg), 0, latBins - 1);
    const latEnd = clamp(Math.floor((b.latMax + 90) / binSizeDeg), 0, latBins - 1);

    for (let latBin = latStart; latBin <= latEnd; latBin++) {
      for (let lonBin = lonStart; lonBin <= lonEnd; lonBin++) {
        const k = key(latBin, lonBin);
        const arr = bins.get(k);
        if (arr) arr.push(i);
        else bins.set(k, [i]);
      }
    }
  }

  return { binSizeDeg, lonBins, latBins, bins, bounds };
}

export function queryRingSpatialIndex(index: RingSpatialIndex, lon: number, lat: number): number[] {
  const lonBin = clamp(Math.floor((lon + 180) / index.binSizeDeg), 0, index.lonBins - 1);
  const latBin = clamp(Math.floor((lat + 90) / index.binSizeDeg), 0, index.latBins - 1);
  const candidates = index.bins.get(key(latBin, lonBin));
  if (!candidates || candidates.length === 0) return [];

  // Extra cheap bounds filter (still much cheaper than point-in-polygon).
  const out: number[] = [];
  for (const i of candidates) {
    const [lonMin, lonMax, latMin, latMax] = index.bounds[i];
    if (lon >= lonMin && lon <= lonMax && lat >= latMin && lat <= latMax) out.push(i);
  }
  return out;
}
