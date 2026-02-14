import { useEffect, useRef, useState } from "react";

function BoxColoringGame() {
  const [clickedOrder, setClickedOrder] = useState([]);
  const boxRef = useRef(null);
  const handleClick = (index) => {
    if (!clickedOrder.includes(index)) {
      setClickedOrder([...clickedOrder, index]);
    }
  };

  const positions = [
    {
      top: 0,
      left: 0,
    },
    { top: 0, left: 50 },
    { top: 0, left: 100 },
    { top: 50, left: 0 },
    { top: 100, left: 0 },
    { top: 100, left: 50 },
    { top: 100, left: 100 },
  ];

  useEffect(() => {
    if (clickedOrder.length === positions.length) {
      const reverseOrder = [...clickedOrder].reverse();
      reverseOrder.forEach((index, i) => {
        setTimeout(
          () => {
            setClickedOrder((prev) =>
              prev.filter((_, idx) => idx !== prev.length - 1),
            );
          },
          (i + 1) * 500,
        );
      });
    }
  }, [clickedOrder.length]);

  return (
    <>
      <div
        style={{
          position: "relative",
          width: 200,
          height: 200,
        }}
      >
        {positions.map((pos, index) => (
          <div
            key={index}
            onClick={() => handleClick(index)}
            ref={boxRef}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: 50,
              height: 50,
              backgroundColor: clickedOrder.includes(index) ? "green" : "white",
              border: "1px solid black",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </>
  );
}

export default BoxColoringGame;
