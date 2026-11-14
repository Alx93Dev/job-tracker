'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

const QUERY_STALE_TIME_MS = 30_000;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: QUERY_STALE_TIME_MS } } }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
