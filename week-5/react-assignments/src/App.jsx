import { useState, useEffect } from "react";
import "./App.css";
import { useFetch } from "./hooks/useFetch";
import { useIntersectionObserver } from "./hooks/useIntersectionObserver";

function App() {
  const { data, loading, error } = useFetch(
    "https://jsonplaceholder.typicode.com/posts",
  );

  const posts = Array.isArray(data) ? data : [];
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [data]);

  const loadMore = () => {
    if (visibleCount >= posts.length) return;
    setVisibleCount((prev) => Math.min(prev + 10, posts.length));
  };

  const sentinelRef = useIntersectionObserver(() => {
    if (!loading && visibleCount < posts.length) {
      loadMore();
    }
  });

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <main className="posts-page">
      <header className="posts-header">
        <p className="eyebrow">Interview UI</p>
        <h1>Posts</h1>
      </header>

      {loading && <div className="status">Loading posts...</div>}

      {error && (
        <div className="status error">
          Something went wrong while loading the posts.
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="posts-grid">
            {visiblePosts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-meta">
                  <span className="post-id">Post #{post.id}</span>
                  <span className="post-tag">Blog</span>
                </div>

                <h2 className="post-title">{post.title}</h2>
                <p className="post-body">{post.body}</p>
              </article>
            ))}
          </section>

          {visibleCount < posts.length && (
            <div
              ref={sentinelRef}
              style={{ height: "20px", marginTop: "20px" }}
            />
          )}
        </>
      )}
    </main>
  );
}

export default App;
