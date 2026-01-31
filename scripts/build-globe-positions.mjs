import fs from 'node:fs/promises';
import path from 'node:path';
import * as topojson from 'topojson-client';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

const LAND_PATH = path.join(PUBLIC_DIR, 'land-50m.json');
const COUNTRIES_PATH = path.join(PUBLIC_DIR, 'countries-50m.json');

// Keep these values in sync with src/workers/globeWorker.ts
const VIETNAM_COORDS = { lat: 14.0583, lon: 108.2772 };
const VIETNAM_ISLANDS = [
  { lat: 16.8333, lon: 112.3333 },
  { lat: 16.6667, lon: 112.7333 },
  { lat: 15.7833, lon: 111.2 },
  { lat: 16.5, lon: 111.6 },
  { lat: 16.05, lon: 111.5 },
  { lat: 8.6433, lon: 111.9167 },
  { lat: 11.4333, lon: 114.3333 },
  { lat: 9.8833, lon: 114.3333 },
  { lat: 10.1833, lon: 114.3667 },
  { lat: 10.3833, lon: 114.4833 },
  { lat: 7.8833, lon: 112.9167 },
  { lat: 8.1, lon: 113.8167 },
  { lat: 8.95, lon: 113.6833 },
  { lat: 8.8167, lon: 113.9833 },
  { lat: 9.05, lon: 114.1333 },
];

function pointInPolygon(point, polygon) {
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

function pointInAnyRing(point, rings) {
  return rings.some((ring) => pointInPolygon(point, ring));
}

function extractRingsFromFeature(feature) {
  const rings = [];
  if (!feature?.geometry) return rings;

  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates.forEach((ring) => rings.push(ring));
  }
  if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => rings.push(ring));
    });
  }
  return rings;
}

function jitterWithinRings(lat, lon, maxJitter, rings, attempts = 6) {
  for (let i = 0; i < attempts; i++) {
    const jLat = lat + (Math.random() - 0.5) * maxJitter;
    const jLon = lon + (Math.random() - 0.5) * maxJitter;
    if (pointInAnyRing([jLon, jLat], rings)) return { lat: jLat, lon: jLon };
  }
  return { lat, lon };
}

function boundsFromRings(rings) {
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

function boundsFromRing(ring) {
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

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildSpatialIndex(rings, binSizeDeg = 10) {
  const lonBins = Math.ceil(360 / binSizeDeg);
  const latBins = Math.ceil(180 / binSizeDeg);
  const bins = new Map();
  const bounds = new Array(rings.length);

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

function querySpatialIndex(index, lon, lat) {
  const lonBin = clamp(Math.floor((lon + 180) / index.binSizeDeg), 0, index.lonBins - 1);
  const latBin = clamp(Math.floor((lat + 90) / index.binSizeDeg), 0, index.latBins - 1);
  const candidates = index.bins.get(`${latBin},${lonBin}`);
  if (!candidates || candidates.length === 0) return [];

  const out = [];
  for (const i of candidates) {
    const b = index.bounds[i];
    if (lon >= b.lonMin && lon <= b.lonMax && lat >= b.latMin && lat <= b.latMax) out.push(i);
  }
  return out;
}

function generatePositions(landPolygons, vietnamRings, radius, vietnamIslands) {
  const worldPoints = [];
  const vietnamPoints = [];

  const landIndex = buildSpatialIndex(landPolygons, 10);

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

        if (isVietnam) vietnamPoints.push(px, py, pz);
        else worldPoints.push(px, py, pz);
      }
    }
  }

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

  for (const island of vietnamIslands) {
    const dotCount = 8;
    const spread = 0.15;
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

async function main() {
  const [landRaw, countriesRaw] = await Promise.all([
    fs.readFile(LAND_PATH, 'utf8'),
    fs.readFile(COUNTRIES_PATH, 'utf8'),
  ]);

  const landData = JSON.parse(landRaw);
  const countriesData = JSON.parse(countriesRaw);

  const land = topojson.feature(landData, landData.objects.land);
  const landPolygons = [];
  land.features.forEach((feature) => {
    if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates.forEach((ring) => landPolygons.push(ring));
    } else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => landPolygons.push(ring));
      });
    }
  });

  const countries = topojson.feature(countriesData, countriesData.objects.countries);
  const vnPoint = [VIETNAM_COORDS.lon, VIETNAM_COORDS.lat];

  const vietnamFeature =
    countries.features.find((f) => String(f?.id) === '704') ||
    countries.features.find((f) => pointInAnyRing(vnPoint, extractRingsFromFeature(f))) ||
    countries.features.find((f) => f?.id == 704) ||
    null;

  const vietnamRings = vietnamFeature ? extractRingsFromFeature(vietnamFeature) : [];

  const { worldPositions, vietnamPositions } = generatePositions(
    landPolygons,
    vietnamRings,
    2,
    VIETNAM_ISLANDS
  );

  const worldArray = Float32Array.from(worldPositions);
  const vietnamArray = Float32Array.from(vietnamPositions);

  await fs.writeFile(
    path.join(PUBLIC_DIR, 'globe-positions-world.bin'),
    Buffer.from(worldArray.buffer)
  );
  await fs.writeFile(
    path.join(PUBLIC_DIR, 'globe-positions-vn.bin'),
    Buffer.from(vietnamArray.buffer)
  );

  const meta = {
    generatedAt: new Date().toISOString(),
    worldCount: worldArray.length / 3,
    vietnamCount: vietnamArray.length / 3,
  };
  await fs.writeFile(
    path.join(PUBLIC_DIR, 'globe-positions.meta.json'),
    JSON.stringify(meta, null, 2)
  );

  console.log('Globe positions generated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
