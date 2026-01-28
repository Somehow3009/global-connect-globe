import { useMemo, useEffect, useState } from 'react';
import * as topojson from 'topojson-client';
import * as THREE from 'three';
import { GLOBE_CONFIG, VIETNAM_COORDS } from '@/lib/globeUtils';

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

// Vietnam bounding box (approximate)
const VIETNAM_BOUNDS = {
  latMin: 8.5,
  latMax: 23.5,
  lonMin: 102,
  lonMax: 110,
};

// Check if point is in Vietnam region
function isInVietnam(lat: number, lon: number): boolean {
  return lat >= VIETNAM_BOUNDS.latMin && 
         lat <= VIETNAM_BOUNDS.latMax && 
         lon >= VIETNAM_BOUNDS.lonMin && 
         lon <= VIETNAM_BOUNDS.lonMax;
}

// Convert a point inside polygon check
function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  let inside = false;
  const [x, y] = point;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

export function Globe() {
  const [landPolygons, setLandPolygons] = useState<[number, number][][]>([]);
  const [loading, setLoading] = useState(true);

  // Load the TopoJSON land data
  useEffect(() => {
    fetch('/land-110m.json')
      .then(res => res.json())
      .then((data: LandData) => {
        const land = topojson.feature(data, data.objects.land) as any;
        
        const polygons: [number, number][][] = [];
        
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
        
        setLandPolygons(polygons);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load land data:', err);
        setLoading(false);
      });
  }, []);

  const { worldPositions, vietnamPositions } = useMemo(() => {
    if (landPolygons.length === 0) {
      return { 
        worldPositions: new Float32Array(0), 
        vietnamPositions: new Float32Array(0) 
      };
    }

    const worldPoints: number[] = [];
    const vietnamPoints: number[] = [];
    const radius = GLOBE_CONFIG.radius;
    
    // Generate points for world map
    const latStep = 0.6;
    const lonStep = 0.6;
    
    for (let lat = -90; lat <= 90; lat += latStep) {
      const adjustedLonStep = lonStep / Math.max(Math.cos(lat * Math.PI / 180), 0.1);
      
      for (let lon = -180; lon <= 180; lon += adjustedLonStep) {
        const isOnLand = landPolygons.some(polygon => 
          pointInPolygon([lon, lat], polygon)
        );
        
        if (isOnLand) {
          const jitterLat = lat + (Math.random() - 0.5) * 0.5;
          const jitterLon = lon + (Math.random() - 0.5) * 0.5;
          
          const phi = (90 - jitterLat) * (Math.PI / 180);
          const theta = (jitterLon + 180) * (Math.PI / 180);
          
          const px = -(radius * Math.sin(phi) * Math.cos(theta));
          const pz = radius * Math.sin(phi) * Math.sin(theta);
          const py = radius * Math.cos(phi);

          // Separate Vietnam points
          if (isInVietnam(lat, lon)) {
            vietnamPoints.push(px, py, pz);
          } else {
            worldPoints.push(px, py, pz);
          }
        }
      }
    }
    
    // Add extra density for Vietnam
    const vnLatStep = 0.15;
    const vnLonStep = 0.15;
    for (let lat = VIETNAM_BOUNDS.latMin; lat <= VIETNAM_BOUNDS.latMax; lat += vnLatStep) {
      for (let lon = VIETNAM_BOUNDS.lonMin; lon <= VIETNAM_BOUNDS.lonMax; lon += vnLonStep) {
        const isOnLand = landPolygons.some(polygon => 
          pointInPolygon([lon, lat], polygon)
        );
        
        if (isOnLand) {
          const jitterLat = lat + (Math.random() - 0.5) * 0.1;
          const jitterLon = lon + (Math.random() - 0.5) * 0.1;
          
          const phi = (90 - jitterLat) * (Math.PI / 180);
          const theta = (jitterLon + 180) * (Math.PI / 180);
          
          const px = -(radius * Math.sin(phi) * Math.cos(theta));
          const pz = radius * Math.sin(phi) * Math.sin(theta);
          const py = radius * Math.cos(phi);

          vietnamPoints.push(px, py, pz);
        }
      }
    }

    return { 
      worldPositions: new Float32Array(worldPoints), 
      vietnamPositions: new Float32Array(vietnamPoints) 
    };
  }, [landPolygons]);

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
      {/* World map dots - cyan */}
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
          color="#00cccc"
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>
      
      {/* Vietnam dots - brighter, larger */}
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
          size={0.035}
          color="#00ffff"
          transparent
          opacity={1}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
