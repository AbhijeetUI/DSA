import "../src/App.css";
import { useInfiniteProducts } from "../hooks/useInfiniteProducts";

function InfiniteScrollRefactored() {
  const {
    search,
    setSearch,
    category,
    setCategory,
    categories,
    visibleProducts,
    sentinelRef,
    productStatus,
    hasMore,
  } = useInfiniteProducts();

  return (
    <div className="posts-page">
      <header className="posts-header">
        <p className="eyebrow">Catalog</p>
        <h1>Infinite product search</h1>
      </header>

      {productStatus.isLoading && (
        <div className="status">Products are loading...</div>
      )}

      {productStatus.isError && (
        <div className="status error" role="alert">
          Failed to load products.
        </div>
      )}

      <section className="product-toolbar">
        <label className="search-field">
          <span>Search products</span>
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className="category-field">
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
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
        {visibleProducts.length === 0 && !productStatus.isLoading ? (
          <div>No products found...</div>
        ) : (
          visibleProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <span className="product-title">{product.title}</span>
              <p className="product-description">{product.description}</p>
              <img
                src={product.images?.[0]}
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
            </article>
          ))
        )}
      </section>

      {hasMore && (
        <div ref={sentinelRef} aria-hidden="true" style={{ height: "1px" }} />
      )}

      {!hasMore && visibleProducts.length > 0 && (
        <div className="status">You have reached the end of the results.</div>
      )}
    </div>
  );
}

export default InfiniteScrollRefactored;
