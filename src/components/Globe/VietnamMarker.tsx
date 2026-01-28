import { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLonToVector3, GLOBE_CONFIG, VIETNAM_COORDS } from '@/lib/globeUtils';

export const VietnamMarker = forwardRef<THREE.Group, Record<string, never>>(function VietnamMarker(
  _props,
  forwardedRef
) {
  const pulse1Ref = useRef<THREE.Mesh>(null);
  const pulse2Ref = useRef<THREE.Mesh>(null);
  
  const position = latLonToVector3(
    VIETNAM_COORDS.lat,
    VIETNAM_COORDS.lon,
    GLOBE_CONFIG.radius
  );

  // Smooth pulsing animation
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (pulse1Ref.current) {
      const scale1 = 1 + Math.sin(time * 2.5) * 0.3;
      pulse1Ref.current.scale.setScalar(scale1);
      (pulse1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.6 - Math.sin(time * 2.5) * 0.2;
    }
    
    if (pulse2Ref.current) {
      const scale2 = 1 + Math.sin(time * 1.8 + 1) * 0.4;
      pulse2Ref.current.scale.setScalar(scale2);
      (pulse2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.35 - Math.sin(time * 1.8 + 1) * 0.15;
    }
  });

  return (
    <group ref={forwardedRef} position={position}>
      {/* Core bright point */}
      <mesh>
        <sphereGeometry args={[0.06, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Inner cyan glow */}
      <mesh ref={pulse1Ref}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Outer soft glow */}
      <mesh ref={pulse2Ref}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.35}
        />
      </mesh>
      
      {/* Ambient halo */}
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial
          color="#00aaaa"
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
});
VietnamMarker.displayName = 'VietnamMarker';
