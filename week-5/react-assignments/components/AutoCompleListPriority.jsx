import { COUNTRIES } from "../src/constants";
import useAutoComplete from "../src/hooks/useAutoComplete";

function AutoCompleListPriority() {
  const {
    query,
    setQuery,
    suggestions,
    activeIndex,
    isOpen,
    isLoading,
    error,
    inputRef,
    handleKeyDown,
    onFocus,
    onBlur,
    selectSuggestion,
  } = useAutoComplete({
    list: COUNTRIES,
    debounceMs: 150,
    maxPrefixResults: 8,
    maxContainsResults: 2,
  });

  return (
    <div>
      <h3>Autocomple</h3>
      <div>
        <input
          ref={inputRef}
          type="text"
          name="myCountry"
          placeholder="Search country"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        {isLoading && <div>Loading...</div>}
        {error && <div style={{ color: "red" }}>{error.message}</div>}

        {isOpen && suggestions.length > 0 && (
          <ul>
            {suggestions.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <li
                  key={`${item}-${index}`}
                  style={{
                    backgroundColor: isActive ? "#e0f2fe" : "transparent",
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    padding: "4px 8px",
                    listStyle: "none",
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(item)}
                >
                  {item}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AutoCompleListPriority;
