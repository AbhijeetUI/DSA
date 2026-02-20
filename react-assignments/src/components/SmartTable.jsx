import { useEffect, useState } from "react";
import { tblData, tblHead } from "../config/tableConfig";

const SmartTable = () => {
  const { pageSizeOptions, columns } = tblHead;
  const [pageSize, setPageSize] = useState(5);
  const [pageData, setPageData] = useState([]);
  const [inputVal, setInputVal] = useState("");
  // Track sort state so it persists during filtering
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleItemsChange = (e) => setPageSize(Number(e.target.value));
  const handleChange = (e) => setInputVal(e.target.value);

  const handleSorting = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  useEffect(() => {
    if (!tblData?.data || !columns) return;

    // 1. Slice first to get ONLY visible items
    let processedData = tblData.data.slice(0, pageSize);

    // 2. Filter
    processedData.filter((item) =>
      columns.some(
        (col) =>
          col.filterable &&
          String(item[col.key]).toLowerCase().includes(inputVal.toLowerCase()),
      ),
    );

    // 3. Sort (Applied before pagination)
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    // 4. Update state to trigger re-render
    setPageData(processedData);
  }, [inputVal, pageSize, sortConfig, columns]);

  return (
    <>
      <h3>Smart Table Demo</h3>
      <div id="smart-table">
        <div className="smart-table-header">
          <input
            className="smart-input"
            placeholder="Search..."
            value={inputVal}
            onChange={handleChange}
          />
          <div className="pagination-controls">
            <label>Items per page: </label>
            <select value={pageSize} onChange={handleItemsChange}>
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="smart-table-container">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>
                  <div
                    className="wrapper"
                    style={{ display: "flex", gap: "8px" }}
                  >
                    <div className="label">{col.label}</div>
                    {col.sortable && (
                      <div
                        className="sort-by"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSorting(col.key)}
                      >
                        {sortConfig.key === col.key
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => (
              <tr key={row.id}>
                {/* Dynamically map cells based on column config */}
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SmartTable;
