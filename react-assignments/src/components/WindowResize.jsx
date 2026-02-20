import useWindowResize from "../hooks/useWindowResize";

const WindowResize = () => {
  const { width, height } = useWindowResize() || {};
  console.log(width, height);
  return (
    <div>
      <h5>Window Size</h5>
      <p>Width: {width}</p>
      <p>Height: {height}</p>
    </div>
  );
};

export default WindowResize;
