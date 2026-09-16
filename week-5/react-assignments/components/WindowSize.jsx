import useWindowSize from "../src/hooks/useWindowSize";

function WindowSize() {
  const { width, height } = useWindowSize() || {};
  return (
    <>
      <div>
        <p>width: {width}</p>
        <p>height: {height}</p>
      </div>
    </>
  );
}

export default WindowSize;
