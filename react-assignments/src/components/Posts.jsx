import { useFetch } from "../hooks/useFetch";

function Posts() {
  const apiUrl = "https://jsonplaceholder.typicode.com/posts";
  const { data, loading, error } = useFetch(apiUrl);
  return (
    <>
      <h3>Display posts here</h3>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && data && (
        <ul>
          {data.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default Posts;
