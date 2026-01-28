// Web Worker for computing globe dot positions off the main thread

import type { Ring } from '@/lib/polygonUtils';

interface IslandCoord {
  name: string;
  lat: number;
  lon: number;
}

interface WorkerInput {
  landPolygons: Ring[];
  vietnamRings: Ring[];
  radius: number;
  vietnamCoords: { lat: number; lon: number };
  vietnamIslands: IslandCoord[];
}

interface WorkerOutput {
  worldPositions: number[];
  vietnamPositions: number[];
}

// Inline the necessary functions to avoid import issues in worker
function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  let inside = false;
  const [x, y] = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInAnyRing(point: [number, number], rings: Ring[]): boolean {
  return rings.some((ring) => pointInPolygon(point, ring));
}

function jitterWithinRings(
  lat: number,
  lon: number,
  maxJitter: number,
  rings: Ring[],
  attempts: number = 6
): { lat: number; lon: number } {
  for (let i = 0; i < attempts; i++) {
    const jLat = lat + (Math.random() - 0.5) * maxJitter;
    const jLon = lon + (Math.random() - 0.5) * maxJitter;
    if (pointInAnyRing([jLon, jLat], rings)) return { lat: jLat, lon: jLon };
  }
  return { lat, lon };
}

function boundsFromRings(rings: Ring[]) {
  let lonMin = Infinity;
  let lonMax = -Infinity;
  let latMin = Infinity;
  let latMax = -Infinity;

  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      lonMin = Math.min(lonMin, lon);
      lonMax = Math.max(lonMax, lon);
      latMin = Math.min(latMin, lat);
      latMax = Math.max(latMax, lat);
    }
  }

  return { lonMin, lonMax, latMin, latMax };
}

// Spatial index for faster polygon lookups
interface BoundsTuple {
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
}

interface SpatialIndex {
  binSizeDeg: number;
  lonBins: number;
  latBins: number;
  bins: Map<string, number[]>;
  bounds: BoundsTuple[];
}

function boundsFromRing(ring: Ring): BoundsTuple {
  let lonMin = Infinity;
  let lonMax = -Infinity;
  let latMin = Infinity;
  let latMax = -Infinity;

  for (const [lon, lat] of ring) {
    lonMin = Math.min(lonMin, lon);
    lonMax = Math.max(lonMax, lon);
    latMin = Math.min(latMin, lat);
    latMax = Math.max(latMax, lat);
  }

  return { lonMin, lonMax, latMin, latMax };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function buildSpatialIndex(rings: Ring[], binSizeDeg: number = 10): SpatialIndex {
  const lonBins = Math.ceil(360 / binSizeDeg);
  const latBins = Math.ceil(180 / binSizeDeg);

  const bins = new Map<string, number[]>();
  const bounds: BoundsTuple[] = new Array(rings.length);

  for (let i = 0; i < rings.length; i++) {
    const b = boundsFromRing(rings[i]);
    bounds[i] = b;

    const lonStart = clamp(Math.floor((b.lonMin + 180) / binSizeDeg), 0, lonBins - 1);
    const lonEnd = clamp(Math.floor((b.lonMax + 180) / binSizeDeg), 0, lonBins - 1);
    const latStart = clamp(Math.floor((b.latMin + 90) / binSizeDeg), 0, latBins - 1);
    const latEnd = clamp(Math.floor((b.latMax + 90) / binSizeDeg), 0, latBins - 1);

    for (let latBin = latStart; latBin <= latEnd; latBin++) {
      for (let lonBin = lonStart; lonBin <= lonEnd; lonBin++) {
        const k = `${latBin},${lonBin}`;
        const arr = bins.get(k);
        if (arr) arr.push(i);
        else bins.set(k, [i]);
      }
    }
  }

  return { binSizeDeg, lonBins, latBins, bins, bounds };
}

function querySpatialIndex(index: SpatialIndex, lon: number, lat: number): number[] {
  const lonBin = clamp(Math.floor((lon + 180) / index.binSizeDeg), 0, index.lonBins - 1);
  const latBin = clamp(Math.floor((lat + 90) / index.binSizeDeg), 0, index.latBins - 1);
  const candidates = index.bins.get(`${latBin},${lonBin}`);
  if (!candidates || candidates.length === 0) return [];

  const out: number[] = [];
  for (const i of candidates) {
    const b = index.bounds[i];
    if (lon >= b.lonMin && lon <= b.lonMax && lat >= b.latMin && lat <= b.latMax) out.push(i);
  }
  return out;
}

function generatePositions(input: WorkerInput): WorkerOutput {
  const { landPolygons, vietnamRings, radius, vietnamIslands } = input;

  const worldPoints: number[] = [];
  const vietnamPoints: number[] = [];

  // Build spatial index for fast lookups
  const landIndex = buildSpatialIndex(landPolygons, 10);

  // Generate points for world map
  const latStep = 0.6;
  const lonStep = 0.6;

  for (let lat = -90; lat <= 90; lat += latStep) {
    const adjustedLonStep = lonStep / Math.max(Math.cos((lat * Math.PI) / 180), 0.1);

    for (let lon = -180; lon <= 180; lon += adjustedLonStep) {
      const candidates = querySpatialIndex(landIndex, lon, lat);
      const isOnLand = candidates.length
        ? candidates.some((idx) => pointInPolygon([lon, lat], landPolygons[idx]))
        : false;

      if (isOnLand) {
        const isVietnam = pointInAnyRing([lon, lat], vietnamRings);

        const jittered = isVietnam
          ? jitterWithinRings(lat, lon, 0.4, vietnamRings)
          : {
              lat: lat + (Math.random() - 0.5) * 0.5,
              lon: lon + (Math.random() - 0.5) * 0.5,
            };

        const phi = (90 - jittered.lat) * (Math.PI / 180);
        const theta = (jittered.lon + 180) * (Math.PI / 180);

        const px = -(radius * Math.sin(phi) * Math.cos(theta));
        const pz = radius * Math.sin(phi) * Math.sin(theta);
        const py = radius * Math.cos(phi);

        if (isVietnam) {
          vietnamPoints.push(px, py, pz);
        } else {
          worldPoints.push(px, py, pz);
        }
      }
    }
  }

  // Extra density in Vietnam bounding box
  const vnBounds = boundsFromRings(vietnamRings);
  const vnLatStep = 0.12;
  const vnLonStep = 0.12;

  for (let lat = vnBounds.latMin; lat <= vnBounds.latMax; lat += vnLatStep) {
    const adjustedLonStep = vnLonStep / Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
    for (let lon = vnBounds.lonMin; lon <= vnBounds.lonMax; lon += adjustedLonStep) {
      if (!pointInAnyRing([lon, lat], vietnamRings)) continue;

      const jittered = jitterWithinRings(lat, lon, 0.18, vietnamRings);

      const phi = (90 - jittered.lat) * (Math.PI / 180);
      const theta = (jittered.lon + 180) * (Math.PI / 180);

      const px = -(radius * Math.sin(phi) * Math.cos(theta));
      const pz = radius * Math.sin(phi) * Math.sin(theta);
      const py = radius * Math.cos(phi);

      vietnamPoints.push(px, py, pz);
    }
  }

  // Add Vietnam's islands (Hoàng Sa & Trường Sa)
  for (const island of vietnamIslands) {
    // Generate cluster of dots around each island
    const dotCount = 8; // dots per island
    const spread = 0.15; // degree spread
    
    for (let i = 0; i < dotCount; i++) {
      const lat = island.lat + (Math.random() - 0.5) * spread;
      const lon = island.lon + (Math.random() - 0.5) * spread;
      
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      
      const px = -(radius * Math.sin(phi) * Math.cos(theta));
      const pz = radius * Math.sin(phi) * Math.sin(theta);
      const py = radius * Math.cos(phi);
      
      vietnamPoints.push(px, py, pz);
    }
  }

  return { worldPositions: worldPoints, vietnamPositions: vietnamPoints };
}

// Worker message handler
self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const result = generatePositions(e.data);
  self.postMessage(result);
};

export type { WorkerInput, WorkerOutput };
