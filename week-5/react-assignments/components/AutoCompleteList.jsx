import { useCallback, useEffect, useRef, useState } from "react";
import "../src/App.css";
import { COUNTRIES } from "../src/constants";

const suggestionCache = new Map();

function AutoCompleteList() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const fetchSuggestions = useCallback(async (term) => {
    const trimmedQuery = term.trim();

    if (!trimmedQuery) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const cacheKey = trimmedQuery.toLowerCase();

    if (suggestionCache.has(cacheKey)) {
      const cachedResults = suggestionCache.get(cacheKey);
      setSuggestions(cachedResults);
      setIsDropdownOpen(cachedResults.length > 0);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(trimmedQuery)}?fields=name`,
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      const results = Array.isArray(data)
        ? data
            .map((item) => item?.name?.common ?? item?.name)
            .filter(Boolean)
            .slice(0, 8)
        : [];

      const finalResults = results.length
        ? results
        : COUNTRIES.filter((country) =>
            country.toLowerCase().includes(trimmedQuery.toLowerCase()),
          ).slice(0, 8);

      suggestionCache.set(cacheKey, finalResults);
      setSuggestions(finalResults);
      setIsDropdownOpen(finalResults.length > 0);
      setActiveIndex(-1);
    } catch (error) {
      const fallbackResults = COUNTRIES.filter((country) =>
        country.toLowerCase().includes(trimmedQuery.toLowerCase()),
      ).slice(0, 8);

      suggestionCache.set(cacheKey, fallbackResults);
      setSuggestions(fallbackResults);
      setIsDropdownOpen(fallbackResults.length > 0);
      setActiveIndex(-1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmedQuery = search.trim();

    if (!trimmedQuery) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchSuggestions(trimmedQuery);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [search, fetchSuggestions]);

  const onSelectSuggestion = (value) => {
    setSearch(value);
    setSuggestions([]);
    setIsDropdownOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setActiveIndex(-1);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((currentIndex) =>
        currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((currentIndex) =>
        currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (activeIndex >= 0 && suggestions[activeIndex]) {
        onSelectSuggestion(suggestions[activeIndex]);
        return;
      }

      setIsDropdownOpen(false);
      setActiveIndex(-1);
    }

    if (event.key === "Escape") {
      setIsDropdownOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="autocomplete-list-wrapper">
      <h3>Autocomplete</h3>
      <div className="autocomplete-field">
        <input
          ref={inputRef}
          type="text"
          id="myInput"
          name="myCountry"
          placeholder="Search country"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => search.trim() && setIsDropdownOpen(true)}
          onBlur={() => {
            window.setTimeout(() => {
              setIsDropdownOpen(false);
              setActiveIndex(-1);
            }, 120);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-expanded={isDropdownOpen}
          aria-controls="autocomplete-suggestions"
          aria-autocomplete="list"
        />

        {isLoading && <div className="autocomplete-status">Loading...</div>}

        {isDropdownOpen && suggestions.length > 0 && (
          <ul
            id="autocomplete-suggestions"
            className="autocomplete-suggestions"
          >
            {suggestions.map((item, index) => (
              <li key={`${item}-${index}`}>
                <button
                  type="button"
                  className={`autocomplete-suggestion ${
                    index === activeIndex ? "active" : ""
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelectSuggestion(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className="autocomplete-btn">
        Submit
      </button>
    </div>
  );
}

export default AutoCompleteList;
