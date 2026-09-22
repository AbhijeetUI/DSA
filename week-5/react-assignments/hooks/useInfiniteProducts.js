import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 10;
const API_URL = "https://mockserver.in/fake-api/v1/products";

export function useInfiniteProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [productStatus, setProductStatus] = useState({
    isLoading: false,
    isError: false,
  });

  const sentinelRef = useRef(null); // Keeps the bottom sentinel element reference without re-rendering on every scroll event.
  const pageCache = useRef(new Map()); // Cached page data keyed by query + category + page to avoid duplicate fetches.
  const previousQueryKeyRef = useRef(""); // Tracks the last query key to detect when a new search/filter reset is needed.

  const normalizedSearch = search.trim().toLowerCase();
  const queryKey = `${normalizedSearch}|${category}`;

  const buildPageKey = (searchText, selectedCategory, currentPage) =>
    `${searchText}|${selectedCategory}|${currentPage}`;

  // Fetch all products once on mount and keep categories ready for the filter dropdown.
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setProductStatus((prev) => ({
          ...prev,
          isLoading: true,
          isError: false,
        }));

        const response = await fetch(API_URL, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const productList = Array.isArray(result)
          ? result
          : Array.isArray(result?.products)
            ? result.products
            : [];

        setProducts(productList);
        setCategories([
          ...new Set(
            productList.map((product) => product.category).filter(Boolean),
          ),
        ]);
      } catch (err) {
        if (err.name !== "AbortError") {
          setProductStatus((prev) => ({
            ...prev,
            isLoading: false,
            isError: true,
          }));
        }
      } finally {
        if (!controller.signal.aborted) {
          setProductStatus((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.title.toLowerCase().includes(normalizedSearch);
      const matchesCategory = !category || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [category, normalizedSearch, products]);

  // Reset pagination when the search or category changes, so page 1 always starts fresh for the new result set.
  useEffect(() => {
    if (previousQueryKeyRef.current !== queryKey) {
      previousQueryKeyRef.current = queryKey;
      setPage(1);
      setVisibleProducts([]);
      pageCache.current.clear();
    }
  }, [queryKey]);

  // For the current query/category/page, reuse cached page data if available; otherwise slice the filtered list into a 10-item chunk and cache it.
  // Dry run: search="Shoes", category="Men", page=2 -> cacheKey="shoes|men|2"; if cached, append that chunk to current visible list; else compute slice(10,20) and save it.
  useEffect(() => {
    if (!filteredProducts.length) {
      return;
    }

    const cacheKey = buildPageKey(normalizedSearch, category, page);
    const cachedPage = pageCache.current.get(cacheKey);

    if (cachedPage) {
      setVisibleProducts((prev) => {
        if (page === 1) {
          return cachedPage;
        }

        const existingIds = new Set(prev.map((product) => product.id));
        const newProducts = cachedPage.filter(
          (product) => !existingIds.has(product.id),
        );

        return [...prev, ...newProducts];
      });
      return;
    }

    const start = (page - 1) * PAGE_SIZE;
    const currentPageProducts = filteredProducts.slice(
      start,
      start + PAGE_SIZE,
    );

    pageCache.current.set(cacheKey, currentPageProducts);

    setVisibleProducts((prev) => {
      if (page === 1) {
        return currentPageProducts;
      }

      const existingIds = new Set(prev.map((product) => product.id));
      const newProducts = currentPageProducts.filter(
        (product) => !existingIds.has(product.id),
      );

      return [...prev, ...newProducts];
    });
  }, [category, filteredProducts, normalizedSearch, page]);

  const hasMore = visibleProducts.length < filteredProducts.length;

  // Watch the sentinel element and increase page number when it enters the viewport, which triggers the next batch of items.
  useEffect(() => {
    const target = sentinelRef.current;

    if (!target || !hasMore || productStatus.isLoading) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, productStatus.isLoading]);

  return {
    search,
    setSearch,
    category,
    setCategory,
    categories,
    visibleProducts,
    sentinelRef,
    productStatus,
    hasMore,
    filteredProducts,
  };
}
