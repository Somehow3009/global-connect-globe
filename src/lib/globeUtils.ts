import * as THREE from 'three';

/**
 * Convert latitude/longitude to 3D vector position on sphere
 */
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * Create a curved line between two points on a sphere
 */
export function createCurvedLine(
  start: THREE.Vector3,
  end: THREE.Vector3,
  sphereRadius: number,
  curveHeight: number = 1.5
): THREE.Vector3[] {
  const midPoint = start
    .clone()
    .add(end)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(sphereRadius * curveHeight);
  
  const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
  return curve.getPoints(50);
}

/**
 * Globe configuration
 */
export const GLOBE_CONFIG = {
  radius: 2,
  dotColor: '#00ffff',
  lineColor: '#a020f0',
  highlightColor: '#ffffff',
  backgroundColor: '#050510',
  dotSize: 0.025,
  dotCount: 20000,
};

/**
 * Vietnam coordinates
 */
export const VIETNAM_COORDS = {
  lat: 14.0583,
  lon: 108.2772,
};

/**
 * Vietnam's islands in South China Sea
 * Paracel Islands (Hoàng Sa) and Spratly Islands (Trường Sa)
 */
export const VIETNAM_ISLANDS = [
  // Hoàng Sa (Paracel Islands) - main islands
  { name: 'Hoàng Sa - Phú Lâm', lat: 16.8333, lon: 112.3333 },
  { name: 'Hoàng Sa - Linh Côn', lat: 16.6667, lon: 112.7333 },
  { name: 'Hoàng Sa - Tri Tôn', lat: 15.7833, lon: 111.2000 },
  { name: 'Hoàng Sa - Hoàng Sa', lat: 16.5000, lon: 111.6000 },
  { name: 'Hoàng Sa - Quang Ảnh', lat: 16.0500, lon: 111.5000 },
  
  // Trường Sa (Spratly Islands) - main islands  
  { name: 'Trường Sa - Trường Sa Lớn', lat: 8.6433, lon: 111.9167 },
  { name: 'Trường Sa - Song Tử Tây', lat: 11.4333, lon: 114.3333 },
  { name: 'Trường Sa - Sinh Tồn', lat: 9.8833, lon: 114.3333 },
  { name: 'Trường Sa - Nam Yết', lat: 10.1833, lon: 114.3667 },
  { name: 'Trường Sa - Sơn Ca', lat: 10.3833, lon: 114.4833 },
  { name: 'Trường Sa - An Bang', lat: 7.8833, lon: 112.9167 },
  { name: 'Trường Sa - Thuyền Chài', lat: 8.1000, lon: 113.8167 },
  { name: 'Trường Sa - Phan Vinh', lat: 8.9500, lon: 113.6833 },
  { name: 'Trường Sa - Tốc Tan', lat: 8.8167, lon: 113.9833 },
  { name: 'Trường Sa - Núi Le', lat: 9.0500, lon: 114.1333 },
];

/**
 * Major world cities to connect to Vietnam
 */
export const WORLD_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Seoul', lat: 37.5665, lon: 126.978 },
  { name: 'Berlin', lat: 52.52, lon: 13.405 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832 },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
];
