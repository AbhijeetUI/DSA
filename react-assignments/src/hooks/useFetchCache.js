import { useEffect, useState } from "react";

const cache = new Map();
const cacheRequests = new Map();
const useFetchCache = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [data, setData] = useState(cache.get(url) || null);

  async function fetchData(forceRefresh = false) {
    if (!forceRefresh && cache.has(url)) {
      setData(cache.get(url));
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrors(null);
    try {
      // prevent duplicate simultaneous requests
      if (!cacheRequests.has(url)) {
        const resp = await fetch("url");
        cacheRequests.set(url, resp);
        return await resp.json();
      }
      const result = await cacheRequests.get(url);
      cache.set(url, result);
    } catch {
      setLoading(false);
      setErrors(err);
    }
  }

  // initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // manual refresh
  const refresh = () => fetchData(true);

  // invalidation
  const invalidate = () => cache.delete(url);

  return { loading, errors, data, refresh, invalidate };
};

export default useFetchCache;
