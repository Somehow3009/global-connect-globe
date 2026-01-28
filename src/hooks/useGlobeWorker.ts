import { useEffect, useRef, useState } from 'react';
import type { Ring } from '@/lib/polygonUtils';

interface IslandCoord {
  name: string;
  lat: number;
  lon: number;
}

interface WorkerInput {
  landPolygons: Ring[];
  vietnamRings: Ring[];
  radius: number;
  vietnamCoords: { lat: number; lon: number };
  vietnamIslands: IslandCoord[];
}

interface WorkerOutput {
  worldPositions: number[];
  vietnamPositions: number[];
}

interface GlobePositions {
  worldPositions: Float32Array;
  vietnamPositions: Float32Array;
}

export function useGlobeWorker(
  landPolygons: Ring[],
  vietnamRings: Ring[],
  radius: number,
  vietnamCoords: { lat: number; lon: number },
  vietnamIslands: IslandCoord[]
): { positions: GlobePositions | null; computing: boolean } {
  const [positions, setPositions] = useState<GlobePositions | null>(null);
  const [computing, setComputing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (landPolygons.length === 0 || vietnamRings.length === 0) {
      return;
    }

    setComputing(true);

    // Create worker
    const worker = new Worker(
      new URL('../workers/globeWorker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerOutput>) => {
      const { worldPositions, vietnamPositions } = e.data;
      setPositions({
        worldPositions: new Float32Array(worldPositions),
        vietnamPositions: new Float32Array(vietnamPositions),
      });
      setComputing(false);
    };

    worker.onerror = (err) => {
      console.error('Globe worker error:', err);
      setComputing(false);
    };

    const input: WorkerInput = {
      landPolygons,
      vietnamRings,
      radius,
      vietnamCoords,
      vietnamIslands,
    };

    worker.postMessage(input);

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [landPolygons, vietnamRings, radius, vietnamCoords, vietnamIslands]);

  return { positions, computing };
}
