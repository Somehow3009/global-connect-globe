import { useEffect, useState } from 'react';
import type { GlobePositions } from './useGlobeWorker';

const PRECOMPUTED_WORLD_URL = '/globe-positions-world.bin';
const PRECOMPUTED_VIETNAM_URL = '/globe-positions-vn.bin';

export function usePrecomputedGlobePositions(): {
  positions: GlobePositions | null;
  loading: boolean;
} {
  const [positions, setPositions] = useState<GlobePositions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [worldRes, vietnamRes] = await Promise.all([
          fetch(PRECOMPUTED_WORLD_URL),
          fetch(PRECOMPUTED_VIETNAM_URL),
        ]);

        if (!worldRes.ok || !vietnamRes.ok) {
          if (!cancelled) setLoading(false);
          return;
        }

        const [worldBuffer, vietnamBuffer] = await Promise.all([
          worldRes.arrayBuffer(),
          vietnamRes.arrayBuffer(),
        ]);

        if (cancelled) return;

        setPositions({
          worldPositions: new Float32Array(worldBuffer),
          vietnamPositions: new Float32Array(vietnamBuffer),
        });
      } catch (err) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { positions, loading };
}
