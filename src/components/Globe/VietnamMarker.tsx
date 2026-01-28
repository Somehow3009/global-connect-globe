import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLonToVector3, GLOBE_CONFIG, VIETNAM_COORDS } from '@/lib/globeUtils';

export function VietnamMarker() {
  const pulseRef = useRef<THREE.Mesh>(null);
  const pulse2Ref = useRef<THREE.Mesh>(null);
  const pulse3Ref = useRef<THREE.Mesh>(null);
  
  const position = latLonToVector3(
    VIETNAM_COORDS.lat,
    VIETNAM_COORDS.lon,
    GLOBE_CONFIG.radius
  );

  // Animate multiple pulsing rings
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (pulseRef.current) {
      const scale1 = 1 + Math.sin(time * 3) * 0.4;
      pulseRef.current.scale.setScalar(scale1);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.8 - Math.sin(time * 3) * 0.3;
    }
    
    if (pulse2Ref.current) {
      const scale2 = 1 + Math.sin(time * 2 + 1) * 0.5;
      pulse2Ref.current.scale.setScalar(scale2);
      (pulse2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.5 - Math.sin(time * 2 + 1) * 0.2;
    }
    
    if (pulse3Ref.current) {
      const scale3 = 1 + Math.sin(time * 1.5 + 2) * 0.6;
      pulse3Ref.current.scale.setScalar(scale3);
      (pulse3Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.3 - Math.sin(time * 1.5 + 2) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Core bright point - White */}
      <mesh>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Inner glow - Cyan */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Middle pulse ring */}
      <mesh ref={pulse2Ref}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {/* Outer ambient glow */}
      <mesh ref={pulse3Ref}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Largest glow halo */}
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}
