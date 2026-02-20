import { useState } from "react";
import "../styles/LikeButton.css";
import { FaHeart } from "react-icons/fa";

const LikeButton = () => {
  const [btnText, setBtnText] = useState("Like");
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setBtnText((prev) => (prev === "Like" ? "Liked" : "Like"));
      setLoading(false);
    }, 1000);
  };

  return (
    <button className="likeButton" onClick={handleClick}>
      {loading ? (
        <>
          <span className="loader red"></span> <span>{btnText}</span>
        </>
      ) : (
        <div className="iconTextWrapper">
          <FaHeart className={btnText === "Liked" ? "icon liked" : "icon"} />
          {btnText}
        </div>
      )}
    </button>
  );
};

export default LikeButton;
