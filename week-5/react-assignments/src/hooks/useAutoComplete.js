import { useCallback, useEffect, useRef, useState } from "react";

function useAutoComplete({
  list = [],
  debounceMs = 150,
  maxPrefixResults = 8,
  maxContainsResults = 2,
} = {}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const cacheRef = useRef(new Map());
  const requestIdRef = useRef(0);

  const computeSuggestions = useCallback(
    (term) => {
      const trimmedValue = term.trim();

      if (!trimmedValue) {
        return [];
      }

      const lowerTerm = trimmedValue.toLowerCase();

      const prefixMatches = list
        .filter((item) => String(item).toLowerCase().startsWith(lowerTerm))
        .slice(0, maxPrefixResults);

      const prefixSet = new Set(
        prefixMatches.map((item) => String(item).toLowerCase()),
      );

      const containsMatches = list
        .filter((item) => {
          const lowerItem = String(item).toLowerCase();
          return lowerItem.includes(lowerTerm) && !prefixSet.has(lowerItem);
        })
        .slice(0, maxContainsResults);

      return [...prefixMatches, ...containsMatches];
    },
    [list, maxPrefixResults, maxContainsResults],
  );

  useEffect(() => {
    const trimmedValue = query.trim();

    if (!trimmedValue) {
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
      setIsLoading(false);
      setError(null);
      return;
    }

    const cacheKey = trimmedValue.toLowerCase();
    const cachedResults = cacheRef.current.get(cacheKey);

    if (cachedResults) {
      setSuggestions(cachedResults);
      setIsOpen(cachedResults.length > 0);
      setActiveIndex(-1);
      setIsLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      try {
        const nextSuggestions = computeSuggestions(trimmedValue);
        cacheRef.current.set(cacheKey, nextSuggestions);

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setSuggestions(nextSuggestions);
        setIsOpen(nextSuggestions.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          setError(err);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, computeSuggestions, debounceMs]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const selectSuggestion = useCallback((value) => {
    setQuery(value);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (!isOpen || suggestions.length === 0) {
        if (event.key === "Escape") {
          closeDropdown();
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
          selectSuggestion(suggestions[activeIndex]);
          return;
        }

        closeDropdown();
      }

      if (event.key === "Escape") {
        closeDropdown();
      }
    },
    [isOpen, suggestions, activeIndex, closeDropdown, selectSuggestion],
  );

  const onFocus = useCallback(() => {
    if (query.trim() && suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [query, suggestions.length]);

  const onBlur = useCallback(() => {
    window.setTimeout(() => {
      closeDropdown();
    }, 120);
  }, [closeDropdown]);

  return {
    query,
    setQuery,
    suggestions,
    activeIndex,
    setActiveIndex,
    isOpen,
    isLoading,
    error,
    inputRef,
    closeDropdown,
    selectSuggestion,
    handleKeyDown,
    onFocus,
    onBlur,
  };
}

export default useAutoComplete;
