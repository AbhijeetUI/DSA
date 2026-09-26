import React, { useState, useEffect, useRef, useCallback } from "react";

// Mock API Call simulating paginated server responses
const fetchProductsApi = async ({ search, category, page, limit = 10 }) => {
  await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate network latency

  // Mock Error trigger for testing
  if (search.toLowerCase() === "error") {
    throw new Error("Failed to fetch products from server.");
  }

  // Mock Dataset
  const mockCategories = ["Electronics", "Men", "Women", "Home"];
  const allProducts = Array.from({ length: 45 }, (_, i) => {
    const cat = mockCategories[i % mockCategories.length];
    return {
      id: i + 1,
      name: `${cat} Product ${i + 1}`,
      category: cat,
      price: (Math.random() * 100 + 10).toFixed(2),
    };
  });

  // Filter products
  const filtered = allProducts.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === "All" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  // Paginate products
  const startIndex = (page - 1) * limit;
  const paginatedItems = filtered.slice(startIndex, startIndex + limit);
  const totalPages = Math.ceil(filtered.length / limit);

  return {
    items: paginatedItems,
    hasMore: page < totalPages,
    total: filtered.length,
  };
};

export default function ProductCatalog() {
  // Input / Filter state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Pagination & Fetch state
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Response Cache Map: Key format -> "searchTerm:category:page"
  const cacheRef = useRef(new Map());
  const observerRef = useRef(null);

  // 1. Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // 2. Core Fetch Logic (Handles Cache & Requests)
  const loadProducts = useCallback(async (searchQuery, cat, pageNum) => {
    const cacheKey = `${searchQuery.trim().toLowerCase()}:${cat}:${pageNum}`;

    // Check Cache First
    if (cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      setProducts((prev) =>
        pageNum === 1 ? cachedData.items : [...prev, ...cachedData.items],
      );
      setHasMore(cachedData.hasMore);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProductsApi({
        search: searchQuery,
        category: cat,
        page: pageNum,
      });

      // Write to Cache
      cacheRef.current.set(cacheKey, data);

      setProducts((prev) =>
        pageNum === 1 ? data.items : [...prev, ...data.items],
      );
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Reset state on Search or Category changes
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    loadProducts(debouncedSearch, category, 1);
  }, [debouncedSearch, category, loadProducts]);

  // 4. Fetch Next Page when Page counter increments
  useEffect(() => {
    if (page > 1) {
      loadProducts(debouncedSearch, category, page);
    }
  }, [page, debouncedSearch, category, loadProducts]);

  // 5. IntersectionObserver for Infinite Scroll Target
  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore],
  );

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Product Catalog</h1>

      {/* Filter Controls */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", fontSize: "16px" }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "8px 12px", fontSize: "16px" }}
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Home">Home</option>
        </select>
      </div>

      {/* Product List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {products.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#fff",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
              {item.name}
            </h3>
            <p style={{ margin: "0 0 4px 0", color: "#666" }}>
              Category: {item.category}
            </p>
            <p style={{ margin: 0, fontWeight: "bold" }}>${item.price}</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No products found. Try adjusting your search or filter.
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
          <p>{error}</p>
          <button onClick={() => loadProducts(debouncedSearch, category, page)}>
            Retry
          </button>
        </div>
      )}

      {/* Scroll Target & Loader */}
      <div
        ref={lastElementRef}
        style={{ height: "40px", marginTop: "20px", textAlign: "center" }}
      >
        {loading && <p>Loading more products...</p>}
        {!hasMore && products.length > 0 && (
          <p style={{ color: "#888" }}>You have reached the end of the list.</p>
        )}
      </div>
    </div>
  );
}
