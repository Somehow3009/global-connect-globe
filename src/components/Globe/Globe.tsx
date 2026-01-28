import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLOBE_CONFIG } from '@/lib/globeUtils';

export function Globe() {
  const [imageData, setImageData] = useState<ImageData | null>(null);

  // Load the earth texture to sample for continent positions
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/earth-map.jpg';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height);
        setImageData(data);
      }
    };
  }, []);

  const positions = useMemo(() => {
    if (!imageData) {
      return new Float32Array(0);
    }

    const { width, height, data } = imageData;
    const points: number[] = [];
    const radius = GLOBE_CONFIG.radius;

    // Sample the texture to place dots on land only
    // Use smaller step for more accurate continent shape
    const targetPoints = GLOBE_CONFIG.dotCount;
    const step = Math.max(1, Math.floor(Math.sqrt((width * height) / (targetPoints * 3))));
    
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // Detect land vs water more accurately
        // Land is typically green/brown, water is blue
        // Check if it's NOT water (blue dominant)
        const isWater = b > 100 && b > r * 0.9 && b > g * 0.8;
        const isIce = r > 200 && g > 200 && b > 200; // White/ice areas
        const brightness = (r + g + b) / 3;
        
        // Include land (green/brown) and exclude deep water
        if ((!isWater && brightness > 20) || isIce) {
          // Convert image coordinates to lat/lon
          const lon = (x / width) * 360 - 180;
          const lat = 90 - (y / height) * 180;

          // Small random offset for organic look
          const jitterLat = lat + (Math.random() - 0.5) * 1.5;
          const jitterLon = lon + (Math.random() - 0.5) * 1.5;

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
  }, [imageData]);

  if (positions.length === 0) {
    // Show loading sphere while texture loads
    return (
      <mesh>
        <sphereGeometry args={[GLOBE_CONFIG.radius, 32, 32]} />
        <meshBasicMaterial color="#0a1020" transparent opacity={0.3} wireframe />
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
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}
