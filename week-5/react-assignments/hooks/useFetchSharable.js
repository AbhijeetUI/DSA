/* import { useState, useEffect, useCallback } from "react";

// Global cache shared across all components
const cache = new Map();
const inFlightRequests = new Map();

function useFetchSharable(url) {
  const [data, setData] = useState(() => cache.get(url)?.data ?? null);
  const [loading, setLoading] = useState(Boolean(url) && !cache.has(url));
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!url) {
        setData(null);
        setLoading(false);
        setError(null);
        return null;
      }

      const cached = cache.get(url);

      if (cached && !forceRefresh) {
        setData(cached.data);
        setLoading(false);
        return cached.data;
      }

      if (inFlightRequests.has(url)) {
        setLoading(true);
        try {
          const result = await inFlightRequests.get(url);
          setData(result);
          return result;
        } catch (err) {
          setError(err);
          throw err;
        } finally {
          setLoading(false);
        }
      }

      setLoading(true);
      setError(null);

      const request = fetch(url)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();
          cache.set(url, { data: result });
          return result;
        })
        .catch((err) => {
          setError(err);
          throw err;
        })
        .finally(() => {
          inFlightRequests.delete(url);
          setLoading(false);
        });

      inFlightRequests.set(url, request);

      try {
        const result = await request;
        setData(result);
        return result;
      } catch (err) {
        // Error is already stored in state above
        return null;
      }
    },
    [url],
  );

  useEffect(() => {
    if (!url) return;
    fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.delete(url);
    inFlightRequests.delete(url);
    return fetchData(true);
  }, [url, fetchData]);

  return {
    data,
    loading,
    error,
    refresh: () => fetchData(true),
    invalidate,
    invalidateCache: invalidate,
  };
}

export default useFetchSharable;
 */

import { useState, useEffect, useCallback } from "react";

const cache = new Map();
const inFlightRequests = new Map();

export default function useFetchSharable(url) {
  const [data, setData] = useState(() => cache.get(url) ?? null);
  const [loading, setLoading] = useState(Boolean(url) && !cache.has(url));
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!url) {
        setData(null);
        setLoading(false);
        setError(null);
        return null;
      }

      if (cache.has(url) && !forceRefresh) {
        setData(cache.get(url));
        setLoading(false);
        return cache.get(url);
      }

      if (inFlightRequests.has(url)) {
        setLoading(true);
        try {
          const result = await inFlightRequests.get(url);
          setData(result);
          return result;
        } catch (err) {
          setError(err);
          return null;
        } finally {
          setLoading(false);
        }
      }

      setLoading(true);
      setError(null);

      const request = fetch(url)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();
          cache.set(url, result);
          return result;
        })
        .catch((err) => {
          setError(err);
          throw err;
        })
        .finally(() => {
          inFlightRequests.delete(url);
          setLoading(false);
        });

      inFlightRequests.set(url, request);

      try {
        const result = await request;
        setData(result);
        return result;
      } catch (err) {
        return null;
      }
    },
    [url],
  );

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url, fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);
  const invalidate = useCallback(() => {
    cache.delete(url);
    inFlightRequests.delete(url);
    return fetchData(true);
  }, [url, fetchData]);

  return { data, loading, error, refresh, invalidate };
}
