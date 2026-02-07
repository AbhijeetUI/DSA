import { useEffect, useRef, useState } from "react";
import "../styles/AutoComplete.css";

const AutoComplete = () => {
  const ANIMALS = [
    "cat",
    "dog",
    "fish",
    "horse",
    "snake",
    "lizard",
    "tortoise",
    "turtle",
    "pig",
    "rat",
    "tiger",
    "lion",
    "leopard",
  ];
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([]);
      setSelectedIndex(-1);
    } else {
      setSuggestions(
        ANIMALS.filter((item) => item.startsWith(inputValue.toLowerCase())),
      );
      setSelectedIndex(-1);
    }
  }, [inputValue]);

  const handleChange = (e) => setInputValue(e.target.value);

  const handleKeydown = (e) => {
    const { key } = e;
    let newIndex = selectedIndex;
    if (key === "ArrowDown") {
      e.preventDefault();
      newIndex = selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : 0;
    } else if (key === "ArrowUp") {
      newIndex = selectedIndex > 0 ? selectedIndex - 1 : suggestions.length - 1;
    } else if (key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      setInputValue(suggestions[selectedIndex]);
      setSelectedIndex(-1);
    }
    setSelectedIndex(newIndex);
  };

  const suggestionsRef = useRef(null);

  return (
    <div className="auto-complete-wrapper">
      <label htmlFor="animals">Animal autocomplete list</label>
      <div className="suggestions-container">
        <div className="suggestion-help" role="status"></div>
        <input
          type="text"
          id="animal"
          autoComplete="off"
          onChange={handleChange}
          onKeyDown={handleKeydown}
          value={inputValue}
        />
        <ul
          ref={suggestionsRef}
          id="suggestions-list"
          className="suggestions"
          role="listbox"
          aria-label="Animals"
        >
          {suggestions.map((item, index) => (
            <li
              id={item}
              key={item}
              role="option"
              className={selectedIndex === index ? "selected" : ""}
              aria-selected={selectedIndex === index}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AutoComplete;
