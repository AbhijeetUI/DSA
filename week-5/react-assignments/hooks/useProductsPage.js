const fetchProducts = useCallback(async () => {
  if (!hasMore || loading) return;

  if (cache.has(queryKey)) {
    const cachedItems = cache.get(queryKey);
    setProducts((prev) => {
      // ✅ If page === 1 (fresh search), replace instead of append
      return page === 1 ? cachedItems : [...prev, ...cachedItems];
    });
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const data = await mockFetchProducts({ query, category, page });

    cache.set(queryKey, data.items);

    setProducts((prev) => {
      return page === 1 ? data.items : [...prev, ...data.items];
    });

    setHasMore(data.items.length > 0);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [queryKey, query, category, page, hasMore, loading]);
