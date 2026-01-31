import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';
import { latLonToVector3, VIETNAM_COORDS } from '@/lib/globeUtils';
import { Globe } from './Globe';
import { VietnamMarker } from './VietnamMarker';
import { ConnectionLines } from './ConnectionLines';

function GlobeContent() {
  return (
    <group rotation={[0.2, -1.8, 0]}>
      <Globe />
      <ConnectionLines />
      <VietnamMarker />
    </group>
  );
}

interface GlobeSceneProps {
  className?: string;
}

export function GlobeScene({ className }: GlobeSceneProps) {
  const focusCoords = VIETNAM_COORDS;
  const cameraPosition = useMemo(() => {
    const baseRotation = new THREE.Euler(0.2, -1.8, 0, 'XYZ');
    const vnVector = latLonToVector3(focusCoords.lat, focusCoords.lon, 1)
      .normalize()
      .applyEuler(baseRotation);
    const distance = 5.8;
    return vnVector.multiplyScalar(-distance);
  }, []);

  return (
    <div className={cn('w-full h-full', className)}>
      <Canvas dpr={1} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]} fov={45} />
        <ambientLight intensity={0.5} />
        
        <Suspense fallback={null}>
          <GlobeContent />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          autoRotate={true}
          autoRotateSpeed={2.0}
          minDistance={4.2}
          maxDistance={9}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
