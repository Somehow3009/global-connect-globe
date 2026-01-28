import { useMemo } from 'react';
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
}

function AnimatedLine({ points }: AnimatedLineProps) {
  const pointsArray = useMemo(() => {
    return points.map(p => [p.x, p.y, p.z] as [number, number, number]);
  }, [points]);

  return (
    <Line
      points={pointsArray}
      color={GLOBE_CONFIG.lineColor}
      lineWidth={1}
      transparent
      opacity={0.5}
    />
  );
}

export function ConnectionLines() {
  const vietnamPos = latLonToVector3(
    VIETNAM_COORDS.lat,
    VIETNAM_COORDS.lon,
    GLOBE_CONFIG.radius
  );

  const lines = useMemo(() => {
    return WORLD_CITIES.map((city, index) => {
      const cityPos = latLonToVector3(city.lat, city.lon, GLOBE_CONFIG.radius);
      const points = createCurvedLine(vietnamPos, cityPos, GLOBE_CONFIG.radius, 1.4);
      return { points, key: index };
    });
  }, [vietnamPos]);

  return (
    <group>
      {lines.map((line) => (
        <AnimatedLine key={line.key} points={line.points} />
      ))}
    </group>
  );
}
