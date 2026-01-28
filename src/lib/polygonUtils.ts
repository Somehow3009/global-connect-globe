export type Ring = [number, number][];

export interface Bounds {
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
}

export function extractRingsFromFeature(feature: any): Ring[] {
  const rings: Ring[] = [];
  if (!feature?.geometry) return rings;

  if (feature.geometry.type === 'Polygon') {
    // coordinates: Ring[]
    feature.geometry.coordinates.forEach((ring: any) => {
      rings.push(ring as Ring);
    });
  }

  if (feature.geometry.type === 'MultiPolygon') {
    // coordinates: Ring[][]
    feature.geometry.coordinates.forEach((polygon: any) => {
      polygon.forEach((ring: any) => {
        rings.push(ring as Ring);
      });
    });
  }

  return rings;
}

// Convert a point inside polygon check
export function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
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

export function pointInAnyRing(point: [number, number], rings: Ring[]): boolean {
  return rings.some((ring) => pointInPolygon(point, ring));
}

export function jitterWithinRings(
  lat: number,
  lon: number,
  maxJitter: number,
  rings: Ring[],
  attempts: number = 6
): { lat: number; lon: number } {
  // Keep trying until the jittered point stays inside the polygon.
  for (let i = 0; i < attempts; i++) {
    const jLat = lat + (Math.random() - 0.5) * maxJitter;
    const jLon = lon + (Math.random() - 0.5) * maxJitter;
    if (pointInAnyRing([jLon, jLat], rings)) return { lat: jLat, lon: jLon };
  }
  // Fallback: no jitter
  return { lat, lon };
}

export function boundsFromRing(ring: Ring): Bounds {
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

export function boundsFromRings(rings: Ring[]): Bounds {
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
