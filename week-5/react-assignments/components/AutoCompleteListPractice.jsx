import { useEffect, useRef, useState } from "react";
import { COUNTRIES } from "../src/constants";

const suggestionCache = new Map();

function AutoCompleteListPractice() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const trimmedQuery = search.trim().toLowerCase();
  useEffect(() => {
    if (suggestionCache.has(trimmedQuery)) {
      const cacheResults = suggestionCache.get(trimmedQuery);
      setSuggestions(cacheResults);
      setIsDropdownOpen(cacheResults.length > 0);
    }
    try {
      setLoading(true);
      const result = COUNTRIES.filter((country) =>
        country.toLowerCase().includes(trimmedQuery),
      );
      setSuggestions(result);
      suggestionCache.set(trimmedQuery, result);
      setActiveIndex(-1);
      setIsDropdownOpen(result.length > 0);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }, [trimmedQuery]);

  const handleChange = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((currentIndex) =>
        currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0,
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((currentIndex) =>
        currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1,
      );
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        const selectedValue = suggestions[activeIndex];
        setSearch(selectedValue);
        setSuggestions([]);
        setIsDropdownOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
      }
      setSearch(suggestions[activeIndex]);
    }
    console.log(e.key);
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setActiveIndex(-1);
    }
  };

  const canDisplayAutoComplete = suggestions?.length > 0 && isDropdownOpen;

  const closeDropdown = () => {
    setIsDropdownOpen(false);
    setActiveIndex(-1);
  };

  return (
    <>
      <div>Autocomplete list</div>
      <div>Start typing</div>
      {console.log(isDropdownOpen)}
      <input
        type="text"
        ref={inputRef}
        name="myCountry"
        id="countryList"
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleChange}
        value={search}
        onFocus={() => {
          if (search.trim()) {
            setIsDropdownOpen(true);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setIsDropdownOpen(false);
            setActiveIndex(-1);
          });
        }}
        autoComplete="off"
      />
      {isLoading && <div>Loading...</div>}
      {canDisplayAutoComplete && (
        <ul className="autocomplete-suggestion">
          {suggestions.map((item, index) => {
            return (
              <li key={`${item}-${index}`} role="listitem">
                <button
                  type="button"
                  className={`autocomplete-suggestion ${
                    index === activeIndex ? "active" : ""
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSearch(item);
                    setSuggestions([]);
                    closeDropdown();
                    inputRef.current?.blur();
                  }}
                >
                  {item}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default AutoCompleteListPractice;
