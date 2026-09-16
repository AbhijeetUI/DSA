import { useEffect, useState } from "react";
import "../src/App.css";

/*
Build an infinite-scrolling product results page where products load as the user scrolls. 
The page must support search by product name and category-based filtering. 
When search text or filters change, results should reset correctly. 
Avoid duplicate API calls for the same query and page by caching responses. 
Handle loading, empty, and error states gracefully while ensuring smooth scrolling without UI jank. 
Example: Searching “Shoes” with category “Men” should load page 1, then page 2 on scroll, and reuse cached results 
if the same query is repeated.
 */

function InfiniteScroll() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productStatus, setProductStatus] = useState({
    isLoading: false,
    isError: false,
  });
  useEffect(() => {
    const controller = new AbortController();
    /*
    AbortController is used to :
     - prevents state updates on unmounted components - if user navigates away from page before API request finishes
       the useEffect cleanup runs and aborts the request prevents the app from trying to call setter functions
     - prevents race conditions: if a dependency changes and triggers fast seqence of fetches,
       multiple requests will be in-fligh at once, so aborting previous requests ensures
    */
    async function loadProducts() {
      try {
        setProductStatus((prev) => ({
          ...prev,
          isLoading: true,
          isError: false,
        }));

        const response = await fetch(
          "https://mockserver.in/fake-api/v1/products",
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        setProducts(result);
        setFilteredProducts(result);
        setProductStatus((prev) => ({
          ...prev,
          isLoading: false,
        }));
        const uniqueCategories = [
          ...new Set(result.map((product) => product.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        if (err.name !== "AbortError") {
          setProductStatus((prev) => ({
            ...prev,
            isLoading: false,
            isError: true,
          }));
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const results = products.filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesCategory = !category || product.category === category;

      return matchesSearch && matchesCategory;
    });

    setFilteredProducts(results);
  }, [products, search, category]);
  return (
    <>
      <h1>hello</h1>
      {console.log(categories)}
      {productStatus.isLoading && products.length === 0 && (
        <div>Products are loading...</div>
      )}

      {productStatus.isError && (
        <div role="alert">Failed to load products.</div>
      )}
      <section className="product-toolbar">
        <label className="search-field">
          <span>Search products</span>
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="category-field">
          <span>Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section className="product-card-wrapper">
        {filteredProducts.length > 0 &&
          filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <span className="product-title">{product.title}</span>
              <p className="product-description">{product.description}</p>
              <img
                src={product.images[0]}
                width={250}
                height={250}
                alt={product.title}
              />
              <div className="product-footer">
                <span className="product-category">
                  <strong>Category: </strong>
                  {product.category}
                </span>
                <span className="product-price">
                  <strong>Price: </strong>
                  {product.price}
                </span>
              </div>
            </div>
          ))}
      </section>
    </>
  );
}

export default InfiniteScroll;
