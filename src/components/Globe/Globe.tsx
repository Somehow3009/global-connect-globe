import { useEffect, useState } from 'react';
import * as topojson from 'topojson-client';
import { GLOBE_CONFIG, VIETNAM_COORDS, VIETNAM_ISLANDS } from '@/lib/globeUtils';
import type { Ring } from '@/lib/polygonUtils';
import { extractRingsFromFeature, pointInAnyRing } from '@/lib/polygonUtils';
import { useGlobeWorker } from '@/hooks/useGlobeWorker';
import { usePrecomputedGlobePositions } from '@/hooks/usePrecomputedGlobePositions';

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
  const [loading, setLoading] = useState(false);
  const { positions: precomputedPositions, loading: precomputedLoading } = usePrecomputedGlobePositions();

  // Load land polygons + Vietnam country polygon (real border)
  useEffect(() => {
    let cancelled = false;

    if (precomputedLoading) return;
    if (precomputedPositions) {
      setLoading(false);
      return;
    }

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
        const land = topojson.feature(landData as any, (landData as any).objects.land) as any;
        const polygons: Ring[] = [];

        land.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates.forEach((ring: any) => {
              polygons.push(ring as Ring);
            });
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach((polygon: any) => {
              polygon.forEach((ring: any) => {
                polygons.push(ring as Ring);
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
  }, [precomputedLoading, precomputedPositions]);

  // Use Web Worker for heavy computation
  const { positions: workerPositions, computing } = useGlobeWorker(
    precomputedPositions ? [] : landPolygons,
    precomputedPositions ? [] : vietnamRings,
    GLOBE_CONFIG.radius,
    VIETNAM_COORDS,
    VIETNAM_ISLANDS
  );

  const positions = precomputedPositions ?? workerPositions;
  const isLoading = precomputedLoading || loading || computing || !positions;

  if (isLoading) {
    return (
      <mesh>
        <sphereGeometry args={[GLOBE_CONFIG.radius, 32, 32]} />
        <meshBasicMaterial color="#0a1428" transparent opacity={0.2} />
      </mesh>
    );
  }

  const { worldPositions, vietnamPositions } = positions;

  return (
    <group>
      {/* Depth mask to hide the far hemisphere */}
      <mesh renderOrder={-1}>
        <sphereGeometry args={[GLOBE_CONFIG.radius - 0.02, 32, 32]} />
        <meshBasicMaterial colorWrite={false} />
      </mesh>

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
