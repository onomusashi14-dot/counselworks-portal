/**
 * useApi — minimal data-fetching hook.
 *
 *   const { data, loading, error, refetch } = useApi(
 *     (signal) => getCases(signal),
 *     [], // deps
 *   );
 *
 * - Aborts the in-flight request when deps change or the component unmounts.
 * - Exposes refetch() so mutations can force a reload without waiting for a
 *   dep change.
 * - Deliberately tiny — no caching, no dedupe. If we outgrow it, swap to
 *   react-query in one place instead of leaking fetch patterns across pages.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/portalApi';

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Stash the latest fetcher so deps-only changes drive the effect.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled || controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Something went wrong loading this page.';
        setError(msg);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const refetch = useCallback(() => setTick((n) => n + 1), []);

  return { data, loading, error, refetch };
}
