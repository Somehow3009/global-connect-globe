import { forwardRef, useMemo, useRef } from 'react';
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

const AnimatedLine = forwardRef<any, AnimatedLineProps>(function AnimatedLine(
  { points, delay },
  forwardedRef
) {
  const lineRef = useRef<any>(null);

  const setLineRef = (node: any) => {
    lineRef.current = node;
    if (!forwardedRef) return;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else (forwardedRef as any).current = node;
  };
  
  const pointsArray = useMemo(() => {
    return points.map(p => [p.x, p.y, p.z] as [number, number, number]);
  }, [points]);

  // Subtle pulsing animation
  useFrame((state) => {
    if (lineRef.current) {
      const time = state.clock.elapsedTime + delay;
      const opacity = 0.25 + Math.sin(time * 1.2) * 0.15;
      lineRef.current.material.opacity = opacity;
    }
  });

  return (
    <Line
      ref={setLineRef}
      points={pointsArray}
      color="#8844ff"
      lineWidth={1.5}
      transparent
      opacity={0.35}
    />
  );
});
AnimatedLine.displayName = 'AnimatedLine';

// Small glowing endpoint for destination cities
const CityMarker = forwardRef<THREE.Group, { position: THREE.Vector3; delay: number }>(function CityMarker(
  { position, delay },
  forwardedRef
) {
  const markerRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime + delay;
    if (markerRef.current) {
      const scale = 0.9 + Math.sin(time * 2.5) * 0.15;
      markerRef.current.scale.setScalar(scale);
    }
    if (glowRef.current) {
      const opacity = 0.3 + Math.sin(time * 2) * 0.15;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <group ref={forwardedRef} position={position}>
      {/* Core point */}
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#aa66ff" />
      </mesh>
      {/* Subtle glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#8844ff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
});
CityMarker.displayName = 'CityMarker';

export const ConnectionLines = forwardRef<THREE.Group, Record<string, never>>(function ConnectionLines(
  _props,
  forwardedRef
) {
  const vietnamPos = latLonToVector3(
    VIETNAM_COORDS.lat,
    VIETNAM_COORDS.lon,
    GLOBE_CONFIG.radius
  );

  const linesData = useMemo(() => {
    return WORLD_CITIES.map((city, index) => {
      const cityPos = latLonToVector3(city.lat, city.lon, GLOBE_CONFIG.radius);
      // Lower curve height for more subtle appearance
      const points = createCurvedLine(vietnamPos, cityPos, GLOBE_CONFIG.radius, 1.25);
      return { points, cityPos, key: index, delay: index * 0.4 };
    });
  }, [vietnamPos]);

  return (
    <group ref={forwardedRef}>
      {/* Connection lines - subtle purple */}
      {linesData.map((line) => (
        <AnimatedLine key={line.key} points={line.points} delay={line.delay} />
      ))}
      
      {/* City endpoint markers */}
      {linesData.map((line) => (
        <CityMarker key={`marker-${line.key}`} position={line.cityPos} delay={line.delay} />
      ))}
    </group>
  );
});
ConnectionLines.displayName = 'ConnectionLines';
