import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const STALE_TIME_MS = 30 * 1000;

// Created once, here. Default caching is set once, globally (see the query adapter guideline).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: STALE_TIME_MS, retry: 1 },
  },
});

export { QueryClientProvider };

/**
 * The backend always answers with { status, message, data, code, requestId }. Reads only need the
 * payload, so it is unwrapped once, here. `select` never runs on the error path: `error` stays the
 * full envelope.
 */
export const useFetch = (key, fn, options = {}) =>
  useQuery({
    queryKey: key,
    queryFn: fn,
    select: (response) => response.data,
    ...options,
  });

export const useSubmit = (fn, options) => useMutation({ mutationFn: fn, ...options });

export const useInvalidate = () => {
  const client = useQueryClient();
  return (key) => client.invalidateQueries({ queryKey: key });
};

/** Writes a cached response directly. `updater` receives the cached envelope (or undefined). */
export const useSetCache = () => {
  const client = useQueryClient();
  return (key, updater) => client.setQueryData(key, updater);
};

/** Wipes the whole cache. Used on logout so nothing from the previous session can flash on screen. */
export const useClearCache = () => {
  const client = useQueryClient();
  return () => client.clear();
};
