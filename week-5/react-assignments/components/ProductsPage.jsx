import { useRef, useCallback, useState } from "react";
import { useProductSearch } from "../hooks/useProductsPage";

export default function ProductResultsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const { products, loading, error, hasMore, setPage } = useProductSearch({
    query,
    category,
  });

  const observer = useRef();

  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, setPage],
  );

  return (
    <div>
      {/* Search + Filter */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
        </select>
      </div>

      {/* Error State */}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      {/* Empty State */}
      {!loading && products.length === 0 && !error && (
        <div>No products found.</div>
      )}

      {/* Product List */}
      <ul>
        {products.map((product, index) => {
          const isLast = index === products.length - 1;
          return (
            <li
              key={product.id}
              ref={isLast ? lastProductRef : null}
              style={{ marginBottom: "1rem" }}
            >
              <strong>{product.name}</strong> – {product.category}
            </li>
          );
        })}
      </ul>

      {/* Loading State */}
      {loading && <div>Loading more products...</div>}
    </div>
  );
}
