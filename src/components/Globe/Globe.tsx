import { useMemo, useEffect, useState } from 'react';
import * as topojson from 'topojson-client';
import { GLOBE_CONFIG, VIETNAM_COORDS } from '@/lib/globeUtils';
import type { Ring } from '@/lib/polygonUtils';
import {
  boundsFromRings,
  extractRingsFromFeature,
  jitterWithinRings,
  pointInAnyRing,
  pointInPolygon,
} from '@/lib/polygonUtils';
import { buildRingSpatialIndex, queryRingSpatialIndex } from '@/lib/ringSpatialIndex';

interface LandData {
  type: string;
  objects: {
    land: {
      type: string;
      geometries: Array<{
        type: string;
        arcs: number[][];
      }>;
    };
  };
  arcs: number[][][];
  transform?: {
    scale: [number, number];
    translate: [number, number];
  };
}

interface CountriesData {
  type: string;
  objects: {
    countries: {
      type: string;
      geometries: any[];
    };
  };
}


export function Globe() {
  const [landPolygons, setLandPolygons] = useState<Ring[]>([]);
  const [vietnamRings, setVietnamRings] = useState<Ring[]>([]);
  const [loading, setLoading] = useState(true);

  // Load land polygons + Vietnam country polygon (real border)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const [landRes, countriesRes] = await Promise.all([
          fetch('/land-50m.json'),
          fetch('/countries-50m.json'),
        ]);

        const [landData, countriesData] = (await Promise.all([
          landRes.json(),
          countriesRes.json(),
        ])) as [LandData, CountriesData];

        // Land polygons
        const land = topojson.feature(landData, landData.objects.land) as any;
        const polygons: Ring[] = [];

        land.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates.forEach((ring: any) => {
              polygons.push(ring as [number, number][]);
            });
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach((polygon: any) => {
              polygon.forEach((ring: any) => {
                polygons.push(ring as [number, number][]);
              });
            });
          }
        });

        // Vietnam rings from countries data
        const countries = topojson.feature(countriesData as any, (countriesData as any).objects.countries) as any;
        const vnPoint: [number, number] = [VIETNAM_COORDS.lon, VIETNAM_COORDS.lat];

        const vietnamFeature =
          // Prefer official numeric id for Vietnam (ISO_N3 = 704)
          countries.features.find((f: any) => String(f?.id) === '704') ||
          // Fallback: locate by point-in-polygon using VN centroid
          countries.features.find((f: any) => pointInAnyRing(vnPoint, extractRingsFromFeature(f))) ||
          // Another fallback (some datasets store id as number)
          countries.features.find((f: any) => f?.id == 704) ||
          null;

        const vnRings = vietnamFeature ? extractRingsFromFeature(vietnamFeature) : [];

        if (!cancelled) {
          setLandPolygons(polygons);
          setVietnamRings(vnRings);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load globe data:', err);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const landIndex = useMemo(() => {
    if (landPolygons.length === 0) return null;
    // Coarse bins are enough and much faster than checking every ring.
    return buildRingSpatialIndex(landPolygons, 10);
  }, [landPolygons]);

  const { worldPositions, vietnamPositions } = useMemo(() => {
    if (landPolygons.length === 0 || vietnamRings.length === 0 || !landIndex) {
      return { 
        worldPositions: new Float32Array(0), 
        vietnamPositions: new Float32Array(0) 
      };
    }

    const worldPoints: number[] = [];
    const vietnamPoints: number[] = [];
    const radius = GLOBE_CONFIG.radius;
    
    // Generate points for world map (exclude Vietnam using real polygon)
    const latStep = 0.6;
    const lonStep = 0.6;
    
    for (let lat = -90; lat <= 90; lat += latStep) {
      const adjustedLonStep = lonStep / Math.max(Math.cos(lat * Math.PI / 180), 0.1);
      
      for (let lon = -180; lon <= 180; lon += adjustedLonStep) {
         const candidates = queryRingSpatialIndex(landIndex, lon, lat);
         const isOnLand = candidates.length
           ? candidates.some((idx) => pointInPolygon([lon, lat], landPolygons[idx]))
           : false;
        
        if (isOnLand) {
          const isVietnam = pointInAnyRing([lon, lat], vietnamRings);

          // For Vietnam points, only jitter within the Vietnam polygon
          const jittered = isVietnam
            ? jitterWithinRings(lat, lon, 0.4, vietnamRings)
            : {
                lat: lat + (Math.random() - 0.5) * 0.5,
                lon: lon + (Math.random() - 0.5) * 0.5,
              };
          const jitterLat = jittered.lat;
          const jitterLon = jittered.lon;
          
          const phi = (90 - jitterLat) * (Math.PI / 180);
          const theta = (jitterLon + 180) * (Math.PI / 180);
          
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

    // Extra density in Vietnam bounding box (real border)
    const vnBounds = boundsFromRings(vietnamRings);
    const vnLatStep = 0.12;
    const vnLonStep = 0.12;

    for (let lat = vnBounds.latMin; lat <= vnBounds.latMax; lat += vnLatStep) {
      const adjustedLonStep = vnLonStep / Math.max(Math.cos(lat * Math.PI / 180), 0.2);
      for (let lon = vnBounds.lonMin; lon <= vnBounds.lonMax; lon += adjustedLonStep) {
        if (!pointInAnyRing([lon, lat], vietnamRings)) continue;

        const jittered = jitterWithinRings(lat, lon, 0.18, vietnamRings);
        const jitterLat = jittered.lat;
        const jitterLon = jittered.lon;

        const phi = (90 - jitterLat) * (Math.PI / 180);
        const theta = (jitterLon + 180) * (Math.PI / 180);

        const px = -(radius * Math.sin(phi) * Math.cos(theta));
        const pz = radius * Math.sin(phi) * Math.sin(theta);
        const py = radius * Math.cos(phi);

        vietnamPoints.push(px, py, pz);
      }
    }

    return { 
      worldPositions: new Float32Array(worldPoints), 
      vietnamPositions: new Float32Array(vietnamPoints) 
    };
   }, [landPolygons, vietnamRings, landIndex]);

  if (loading || worldPositions.length === 0) {
    return (
      <mesh>
        <sphereGeometry args={[GLOBE_CONFIG.radius, 32, 32]} />
        <meshBasicMaterial color="#0a1428" transparent opacity={0.2} />
      </mesh>
    );
  }

  return (
    <group>
      {/* World map dots - subtle cyan */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={worldPositions.length / 3}
            array={worldPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#00aaaa"
          transparent
          opacity={0.65}
          sizeAttenuation
        />
      </points>
      
      {/* Vietnam dots - brighter, denser, larger */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={vietnamPositions.length / 3}
            array={vietnamPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#00ffff"
          transparent
          opacity={1}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
