import React, { useState, useEffect, useRef } from "react";
import "../styles/ProductsPage.css";

const ProductsPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const perPage = 10;
  const timerRef = useRef(null);
  const observerTarget = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSearchParam(value);
      setPage(1);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    setDisplayedProducts(products.slice(0, endIndex));
  }, [page, products]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          displayedProducts.length < products.length
        ) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [displayedProducts.length, products.length]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await fetch("https://dummyjson.com/products");
        const response = await data.json();
        setAllProducts(response.products);
        setProducts(response.products);
        setCategories([
          "All",
          ...new Set(response.products.map((p) => p.category)),
        ]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = allProducts;
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchParam) {
      const q = searchParam.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(q));
    }
    setProducts(filtered);
    setPage(1);
  }, [allProducts, selectedCategory, searchParam]);

  const handleCategory = (currentCategory) => {
    setSelectedCategory(currentCategory);
  };

  return (
    <>
      Products list goes here
      <div>
        <label htmlFor="searchProduct">Search product here</label>
        <input type="text" value={inputValue} onChange={handleChange} />
      </div>
      <div>
        <h4>Categories</h4>
        <div className="category-filters">
          {categories.map((category) => (
            <div className="filter-label" key={category}>
              <div className="category-buttons">
                <div
                  className="category-btn"
                  onClick={() => handleCategory(category)}
                >
                  {category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      )}
      {error && <div className="error">Something went wrong!</div>}
      <div className="products-list">
        {displayedProducts.length > 0 &&
          displayedProducts.map((currentProduct) => (
            <div className="product-card" key={currentProduct.id}>
              <div className="product-content">
                <h3>{currentProduct.title}</h3>
                <img
                  className="product-image"
                  src={currentProduct.images[0]}
                  alt="product image"
                />
                <div className="product-price-rating">
                  <div className="product-price">
                    Price : ${currentProduct.price}
                  </div>
                  <div className="product-price">
                    Rating : {currentProduct.rating}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div ref={observerTarget} className="observer-trigger">
        {displayedProducts.length < products.length && (
          <p>Loading more products...</p>
        )}
      </div>
    </>
  );
};

export default ProductsPage;
