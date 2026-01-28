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

// Vietnam S-shape regions - accurate borders avoiding Laos/Cambodia
const VIETNAM_REGIONS = [
  // Far North (Hà Giang, Cao Bằng, Lào Cai) - border with China
  { latMin: 22.0, latMax: 23.4, lonMin: 104.0, lonMax: 107.5 },
  // Northern highlands (Điện Biên, Sơn La, Yên Bái)
  { latMin: 21.0, latMax: 22.5, lonMin: 103.0, lonMax: 106.0 },
  // Red River Delta & Northeast (Hà Nội, Hải Phòng, Quảng Ninh)
  { latMin: 20.0, latMax: 22.0, lonMin: 105.0, lonMax: 108.0 },
  // North Central (Thanh Hóa, Nghệ An, Hà Tĩnh)
  { latMin: 18.0, latMax: 20.5, lonMin: 104.5, lonMax: 106.5 },
  // Central narrow (Quảng Bình, Quảng Trị, Huế) - narrowest part
  { latMin: 16.0, latMax: 18.5, lonMin: 106.0, lonMax: 108.5 },
  // South Central coast (Đà Nẵng, Quảng Nam, Quảng Ngãi)
  { latMin: 14.5, latMax: 16.5, lonMin: 107.5, lonMax: 109.3 },
  // Central Highlands edge & coast (Bình Định, Phú Yên, Khánh Hòa)
  { latMin: 12.0, latMax: 15.0, lonMin: 108.0, lonMax: 109.5 },
  // South (Ninh Thuận, Bình Thuận, Đồng Nai, Bà Rịa)
  { latMin: 10.5, latMax: 12.5, lonMin: 106.5, lonMax: 109.0 },
  // Mekong Delta (Hồ Chí Minh, Cần Thơ, Cà Mau)
  { latMin: 9.0, latMax: 11.0, lonMin: 105.0, lonMax: 107.0 },
  // Cà Mau peninsula (southernmost tip)
  { latMin: 8.5, latMax: 9.5, lonMin: 104.5, lonMax: 105.5 },
];

// Check if point is in Vietnam region (S-shape aware)
function isInVietnam(lat: number, lon: number): boolean {
  return VIETNAM_REGIONS.some(region => 
    lat >= region.latMin && 
    lat <= region.latMax && 
    lon >= region.lonMin && 
    lon <= region.lonMax
  );
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

          // Check if in Vietnam using S-shape regions
          if (isInVietnam(lat, lon)) {
            vietnamPoints.push(px, py, pz);
          } else {
            worldPoints.push(px, py, pz);
          }
        }
      }
    }
    
    // Add extra high-density points specifically for Vietnam
    // Following the S-shape with fine granularity
    VIETNAM_REGIONS.forEach(region => {
      const vnLatStep = 0.12;
      const vnLonStep = 0.12;
      
      for (let lat = region.latMin; lat <= region.latMax; lat += vnLatStep) {
        for (let lon = region.lonMin; lon <= region.lonMax; lon += vnLonStep) {
          const isOnLand = landPolygons.some(polygon => 
            pointInPolygon([lon, lat], polygon)
          );
          
          if (isOnLand) {
            const jitterLat = lat + (Math.random() - 0.5) * 0.08;
            const jitterLon = lon + (Math.random() - 0.5) * 0.08;
            
            const phi = (90 - jitterLat) * (Math.PI / 180);
            const theta = (jitterLon + 180) * (Math.PI / 180);
            
            const px = -(radius * Math.sin(phi) * Math.cos(theta));
            const pz = radius * Math.sin(phi) * Math.sin(theta);
            const py = radius * Math.cos(phi);

            vietnamPoints.push(px, py, pz);
          }
        }
      }
    });

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
