// Main exports for Globe component package
export { GlobeScene } from './GlobeScene';
export { Globe } from './Globe';
export { ConnectionLines } from './ConnectionLines';
export { VietnamMarker } from './VietnamMarker';

// Re-export utilities
export { 
  GLOBE_CONFIG, 
  VIETNAM_COORDS, 
  VIETNAM_ISLANDS,
  WORLD_CITIES,
  latLonToVector3,
  createCurvedLine 
} from '@/lib/globeUtils';

// Re-export types
export type { Ring, Bounds } from '@/lib/polygonUtils';
