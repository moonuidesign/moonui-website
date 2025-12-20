// hooks/use-fingerprint.ts
'use client';

import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export function useFingerprint() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setFp = async () => {
      try {
        // Load agent FingerprintJS
        const fp = await FingerprintJS.load();

        // Dapatkan result (visitorId)
        const result = await fp.get();

        setVisitorId(result.visitorId);
      } catch (error) {
        console.error('Failed to get fingerprint:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setFp();
  }, []);

  return { visitorId, isLoading };
}
