import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import {
  latLonToVector3,
  createCurvedLine,
  GLOBE_CONFIG,
  VIETNAM_COORDS,
  WORLD_CITIES,
} from '@/lib/globeUtils';

interface AnimatedLineProps {
  points: THREE.Vector3[];
  delay: number;
}

function AnimatedLine({ points, delay }: AnimatedLineProps) {
  const lineRef = useRef<any>(null);
  
  const pointsArray = useMemo(() => {
    return points.map(p => [p.x, p.y, p.z] as [number, number, number]);
  }, [points]);

  // Animate opacity for pulsing effect
  useFrame((state) => {
    if (lineRef.current) {
      const time = state.clock.elapsedTime + delay;
      const opacity = 0.5 + Math.sin(time * 1.5) * 0.3;
      lineRef.current.material.opacity = opacity;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={pointsArray}
      color="#ff00ff"
      lineWidth={2}
      transparent
      opacity={0.7}
    />
  );
}

// Endpoint marker for destination cities
function CityMarker({ position }: { position: THREE.Vector3 }) {
  const markerRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (markerRef.current) {
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      markerRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={markerRef} position={position}>
      <sphereGeometry args={[0.04, 16, 16]} />
      <meshBasicMaterial color="#ff00ff" transparent opacity={0.8} />
    </mesh>
  );
}

export function ConnectionLines() {
  const vietnamPos = latLonToVector3(
    VIETNAM_COORDS.lat,
    VIETNAM_COORDS.lon,
    GLOBE_CONFIG.radius
  );

  const linesData = useMemo(() => {
    return WORLD_CITIES.map((city, index) => {
      const cityPos = latLonToVector3(city.lat, city.lon, GLOBE_CONFIG.radius);
      const points = createCurvedLine(vietnamPos, cityPos, GLOBE_CONFIG.radius, 1.3);
      return { points, cityPos, key: index, delay: index * 0.3 };
    });
  }, [vietnamPos]);

  return (
    <group>
      {/* Connection lines */}
      {linesData.map((line) => (
        <AnimatedLine key={line.key} points={line.points} delay={line.delay} />
      ))}
      
      {/* City endpoint markers */}
      {linesData.map((line) => (
        <CityMarker key={`marker-${line.key}`} position={line.cityPos} />
      ))}
    </group>
  );
}
