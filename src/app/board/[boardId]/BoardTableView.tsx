"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";

interface ItemType {
  uid: string;
  checkedIn?: boolean;
  [key: string]: any;
}

interface Props {
  boardNameInitial: string;
  columns: string[]; // This will be used for reference but not directly for headers
  itemsInitial: ItemType[];
  onBoardNameChange?: (name: string) => void;
  onSave?: (name: string, items: ItemType[]) => void;
  search?: string;
  filter?: string;
}

export default function BoardTableView({
  boardNameInitial,
  columns,
  itemsInitial,
  onBoardNameChange,
  onSave,
  search = "",
  filter = "all",
}: Props) {
  const [boardName, setBoardName] = useState(boardNameInitial);
  const [boardNameEditing, setBoardNameEditing] = useState(false);
  const [editingRowUid, setEditingRowUid] = useState<string | null>(null);
  const [items, setItems] = useState<ItemType[]>(itemsInitial);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Separate the header row (first row) from the data rows
  const headerRow = items.length > 0 ? items[0] : null;
  const dataRows = items.length > 0 ? items.slice(1) : [];

  // Improved filtering logic for comprehensive search
  const filteredDataRows = dataRows.filter((item) => {
    // Always include the row being edited
    if (item.uid === editingRowUid) return true;
    
    // Search filter - search across ALL fields, not just columns
    const searchLower = search.toLowerCase().trim();
    const matchSearch = searchLower === "" || Object.entries(item).some(([key, value]) => {
      // Skip uid and internal fields
      if (key === "uid") return false;
      
      // Convert value to string safely, handling null/undefined
      const valueStr = value == null ? "" : String(value).toLowerCase();
      return valueStr.includes(searchLower);
    });
    
    // Status filter
    const matchFilter =
      filter === "all"
        ? true  // Show all rows regardless of check-in status
        : filter === "checkedin"
        ? !!item.checkedIn  // Show only checked-in rows (convert to boolean)
        : !item.checkedIn;  // Show only not-checked-in rows
    
    return matchSearch && matchFilter;
  });

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  // Calculate pagination values
  const totalRows = filteredDataRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  
  // Make sure currentPage is valid
  const validCurrentPage = Math.min(totalPages, Math.max(1, currentPage));
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  // Get current page of data
  const startIndex = (validCurrentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const currentPageRows = filteredDataRows.slice(startIndex, endIndex);

  const filteredDataRowsRef = useRef(filteredDataRows);
  filteredDataRowsRef.current = filteredDataRows;

  const handleCellChange = (uid: string, key: string, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, [key]: value } : item))
    );
  };

  const handleCheckinChange = (uid: string, checkedIn: boolean) => {
    const updatedItems = items.map((item) =>
      item.uid === uid ? { ...item, checkedIn } : item
    );
    setItems(updatedItems);
    if (onSave) onSave(boardName, updatedItems);
  };

  const handleBoardNameBlur = () => {
    setBoardNameEditing(false);
    if (onSave) onSave(boardName, items);
  };

  const handleCellBlur = () => {
    setEditingRowUid(null);
    if (onSave) onSave(boardName, items);
  };

  // Add Row: new row has all columns (except "Check") as blank
  const handleAddRow = () => {
    const newRow: ItemType = {
      uid: nanoid(),
      checkedIn: false,
      ...Object.fromEntries(columns.filter(col => col !== "Check").map((col) => [col, ""])),
    };
    // Add the new row after the header (if header exists)
    const newItems = headerRow 
      ? [headerRow, ...dataRows, newRow] 
      : [...items, newRow];
    
    setItems(newItems);
    if (onSave) onSave(boardName, newItems);
  };

  const handleRemoveRow = (uid: string) => {
    // Don't allow removing the header row
    if (headerRow && uid === headerRow.uid) return;
    
    const newItems = items.filter((item) => item.uid !== uid);
    setItems(newItems);
    if (onSave) onSave(boardName, newItems);
  };

  // Pagination controls
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Function to handle "check all visible rows"
  const handleCheckAllVisible = () => {
    const updatedItems = items.map(item => {
      // Only update items that are in the filtered data rows
      const isInFilteredRows = filteredDataRows.some(filtered => filtered.uid === item.uid);
      if (isInFilteredRows) {
        return { ...item, checkedIn: true };
      }
      return item;
    });
    
    setItems(updatedItems);
    if (onSave) onSave(boardName, updatedItems);
  };

  // Function to handle "uncheck all visible rows"
  const handleUncheckAllVisible = () => {
    const updatedItems = items.map(item => {
      // Only update items that are in the filtered data rows
      const isInFilteredRows = filteredDataRows.some(filtered => filtered.uid === item.uid);
      if (isInFilteredRows) {
        return { ...item, checkedIn: false };
      }
      return item;
    });
    
    setItems(updatedItems);
    if (onSave) onSave(boardName, updatedItems);
  };

  // Custom row renderer
  const renderTableRows = () => {
    return currentPageRows.map((item) => (
      <tr key={item.uid} className={item.checkedIn ? "row-checked" : ""}>
        {/* Checkbox column */}
        <td style={{ width: "60px" }}>
          <input
            type="checkbox"
            checked={!!item.checkedIn}
            onChange={(e) => handleCheckinChange(item.uid, e.target.checked)}
            aria-label={item.checkedIn ? "Checked In" : "Not Checked In"}
          />
        </td>
        
        {/* Data columns (skip first "Check" column) */}
        {columns.slice(1).map((col) => (
          <td key={col}>
            <input
              className="spreadsheet-cell-input"
              value={item[col] ?? ""}
              onFocus={() => setEditingRowUid(item.uid)}
              onChange={(e) => handleCellChange(item.uid, col, e.target.value)}
              onBlur={handleCellBlur}
              aria-label={col}
              placeholder={col}
            />
          </td>
        ))}
        
        {/* Status column */}
        <td style={{ width: "120px" }}>
          <span className={item.checkedIn ? "status-green" : "status-red"}>
            {item.checkedIn ? "Checked In" : "Not Checked In"}
          </span>
        </td>
        
        {/* Actions column */}
        <td style={{ width: "100px" }}>
          <button
            className="spreadsheet-remove-row-btn"
            aria-label="Remove Row"
            title="Remove Row"
            onClick={() => handleRemoveRow(item.uid)}
            type="button"
            tabIndex={0}
          >
            Remove
          </button>
        </td>
      </tr>
    ));
  };

  // Calculate stats for pagination display
  const firstRowNumber = totalRows === 0 ? 0 : startIndex + 1;
  const lastRowNumber = endIndex;
  const paginationText = `${firstRowNumber}-${lastRowNumber} of ${totalRows} rows`;

  // Calculate check-in stats
  const checkedInCount = filteredDataRows.filter(item => item.checkedIn).length;
  const notCheckedInCount = totalRows - checkedInCount;
  const checkInStats = `${checkedInCount} checked in, ${notCheckedInCount} not checked in`;

  return (
    <div className="board-table-container">
      <div
        className="board-table-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div>
          {boardNameEditing ? (
            <input
              value={boardName}
              autoFocus
              className="board-edit-title"
              onChange={(e) => setBoardName(e.target.value)}
              onBlur={handleBoardNameBlur}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === "Escape") &&
                handleBoardNameBlur()
              }
            />
          ) : (
            <h2
              className="board-title-spreadsheet"
              onClick={() => setBoardNameEditing(true)}
              tabIndex={0}
              title="Click to edit board name"
            >
              {boardName}
              <span className="edit-icon" title="Edit">
                &#9998;
              </span>
            </h2>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: '14px', color: '#666', marginRight: '12px' }}>
            {totalRows !== dataRows.length ? 
              `Filtered ${totalRows} of ${dataRows.length} rows (${checkInStats})` : 
              `${totalRows} rows total (${checkInStats})`}
          </div>
          <button
            className="spreadsheet-add-row-btn"
            style={{
              background: "#059669",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "6px 16px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 15,
            }}
            onClick={handleAddRow}
            aria-label="Add Row"
            type="button"
          >
            + Add Row
          </button>
        </div>
      </div>
      
      {/* Bulk Actions Row */}
      {totalRows > 0 && (
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          marginBottom: "12px" 
        }}>
          <button
            onClick={handleCheckAllVisible}
            style={{
              padding: "4px 12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              background: "#f3f4f6",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Check All Visible ({totalRows})
          </button>
          <button
            onClick={handleUncheckAllVisible}
            style={{
              padding: "4px 12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              background: "#f3f4f6",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Uncheck All Visible ({totalRows})
          </button>
        </div>
      )}
      
      <div style={{ overflowX: "auto" }}>
        <table
          className="spreadsheet-table"
          style={{
            minWidth: `${(columns.length + 2) * 160}px`,
            tableLayout: "fixed",
            width: "100%",
            borderCollapse: "collapse"
          }}
        >
          <thead>
            <tr>
              {/* Check column header (empty) */}
              <th style={{ width: "60px" }}></th>
              
              {/* Use header row values for column headers, if available */}
              {columns.slice(1).map((col) => (
                <th key={col}>
                  {headerRow ? headerRow[col] || col : col}
                </th>
              ))}
              
              {/* Status and Actions column headers */}
              <th style={{ width: "120px" }}>Status</th>
              <th style={{ width: "100px" }}></th>
            </tr>
          </thead>
          <tbody>
            {totalRows === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: '20px' }}>
                  No items match your filter criteria
                </td>
              </tr>
            ) : (
              renderTableRows()
            )}
          </tbody>
        </table>

        {/* Pagination controls */}
        {totalRows > 0 && (
          <div className="pagination-controls" style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            padding: "12px 0",
            borderTop: "1px solid #e5e7eb"
          }}>
            <div className="rows-per-page" style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "8px", fontSize: "14px" }}>Rows per page:</span>
              <select 
                value={rowsPerPage} 
                onChange={handleRowsPerPageChange}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db"
                }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
              </select>
            </div>
            
            <div style={{ fontSize: "14px" }}>
              {paginationText}
            </div>
            
            <div className="pagination-buttons" style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                style={{
                  padding: "4px 12px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  background: currentPage === 1 ? "#f3f4f6" : "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                style={{
                  padding: "4px 12px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  background: currentPage === totalPages ? "#f3f4f6" : "white",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}