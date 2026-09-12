import { useState, useEffect } from "react";

// Global cache shared across all hook instances
const cache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes in milliseconds

export function useFetch(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    const cachedRecord = cache.get(url);
    const now = Date.now();

    // Return cached data if present and within the 2-minute window
    if (cachedRecord && now - cachedRecord.timestamp < CACHE_TTL) {
      setData(cachedRecord.data);
      setError(null);
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        // Update global cache entry
        cache.set(url, { data: result, timestamp: Date.now() });

        setData(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
