import { useEffect, useRef, useState } from "react";

function getWindowSize() {
  return {
    width: window?.innerWidth || 0,
    height: window?.innerHeight || 0,
  };
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState(() => {
    /*  if (typeof window === "undefined") {
      return { width: 0, height: 0 };
    } */

    return getWindowSize();
  });

  const lastSizeRef = useRef(windowSize);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      const nextSize = getWindowSize();
      const previousSize = lastSizeRef.current ?? { width: 0, height: 0 };

      if (
        previousSize.width === nextSize.width &&
        previousSize.height === nextSize.height
      ) {
        return;
      }

      lastSizeRef.current = nextSize;
      setWindowSize(nextSize);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
}

export default useWindowSize;
