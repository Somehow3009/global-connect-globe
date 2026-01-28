import { useMemo, useEffect, useState } from 'react';
import * as topojson from 'topojson-client';
import { GLOBE_CONFIG } from '@/lib/globeUtils';

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
        // Convert TopoJSON to GeoJSON
        const land = topojson.feature(data, data.objects.land) as any;
        
        const polygons: [number, number][][] = [];
        
        land.features.forEach(feature => {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates.forEach(ring => {
              polygons.push(ring as [number, number][]);
            });
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(polygon => {
              polygon.forEach(ring => {
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

  const positions = useMemo(() => {
    if (landPolygons.length === 0) {
      return new Float32Array(0);
    }

    const points: number[] = [];
    const radius = GLOBE_CONFIG.radius;
    
    // Generate points on a grid and check if they're on land
    const latStep = 0.7;
    const lonStep = 0.7;
    
    for (let lat = -90; lat <= 90; lat += latStep) {
      // Adjust longitude step based on latitude to maintain uniform density
      const adjustedLonStep = lonStep / Math.max(Math.cos(lat * Math.PI / 180), 0.1);
      
      for (let lon = -180; lon <= 180; lon += adjustedLonStep) {
        // Check if this point is inside any land polygon
        const isOnLand = landPolygons.some(polygon => 
          pointInPolygon([lon, lat], polygon)
        );
        
        if (isOnLand) {
          // Add some jitter for organic look
          const jitterLat = lat + (Math.random() - 0.5) * 0.8;
          const jitterLon = lon + (Math.random() - 0.5) * 0.8;
          
          // Convert to 3D position
          const phi = (90 - jitterLat) * (Math.PI / 180);
          const theta = (jitterLon + 180) * (Math.PI / 180);
          
          const px = -(radius * Math.sin(phi) * Math.cos(theta));
          const pz = radius * Math.sin(phi) * Math.sin(theta);
          const py = radius * Math.cos(phi);

          points.push(px, py, pz);
        }
      }
    }

    return new Float32Array(points);
  }, [landPolygons]);

  if (loading || positions.length === 0) {
    return (
      <mesh>
        <sphereGeometry args={[GLOBE_CONFIG.radius, 32, 32]} />
        <meshBasicMaterial color="#0a1428" transparent opacity={0.2} />
      </mesh>
    );
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={GLOBE_CONFIG.dotSize}
        color={GLOBE_CONFIG.dotColor}
        transparent
        opacity={0.95}
        sizeAttenuation
      />
    </points>
  );
}
