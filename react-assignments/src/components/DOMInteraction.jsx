import { useRef, useEffect } from "react";

function DOMInteraction() {
  const containerRef = useRef(null);
  const circleRef = useRef(null);
  const coordsRef = useRef({ x: 0, y: 0 });
  const isInsideRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      isInsideRef.current = true;
    };

    const handleMouseLeave = () => {
      isInsideRef.current = false;
    };

    const handleMouseMove = (e) => {
      if (!isInsideRef.current) return;

      const rect = container.getBoundingClientRect(); // Gets the container's position and size relative to the viewport
      //e.clicentX = mouse's X position from left edge of the browser window
      //react.left = container's left edge is positioned in the window
      //subtracting them gives the mouse's X position relative to the container
      coordsRef.current.x = e.clientX - rect.left;
      coordsRef.current.y = e.clientY - rect.top;
    };

    const updateCircle = () => {
      if (isInsideRef.current && circleRef.current) {
        const { x, y } = coordsRef.current;
        circleRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      // the circle shifts to the x,y postion and since its inside requestAnimationFrame it updates 60 times/sec
      // for smooth motion without triggering react re-renders
      requestAnimationFrame(updateCircle);
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mousemove", handleMouseMove);

    const animationId = requestAnimationFrame(updateCircle);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "500px",
        height: "500px",
        border: "2px solid #333",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
        cursor: "none",
      }}
    >
      <div
        ref={circleRef}
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#ff6b6b",
          position: "absolute",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        }}
      />
    </div>
  );
}

export default DOMInteraction;
