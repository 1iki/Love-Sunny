'use client';

import { useEffect, useState } from 'react';

export default function HydrationGuard({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null; // Or a loading spinner matching the app design
  }

  return <>{children}</>;
}
