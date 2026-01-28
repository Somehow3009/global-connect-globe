import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
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

export function GlobeScene() {
  return (
    <div className="w-full h-screen" style={{ background: '#050510' }}>
      <Canvas dpr={1} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <ambientLight intensity={0.5} />
        
        <Suspense fallback={null}>
          <GlobeContent />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          minDistance={3}
          maxDistance={10}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
