import React, { useState, useEffect } from "react";

interface ItemType {
  uid: string;
  checkedIn?: boolean;
  [key: string]: any;
}

export default function BoardListView({ items }: { items: ItemType[] }) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  if (!items || items.length === 0) {
    return <div className="board-list-empty">No items to display.</div>;
  }

  // Dynamically compute all columns (except 'checkedIn' and 'uid')
  const columns = Array.from(
    new Set(
      items.flatMap(item => Object.keys(item))
        .filter(key => key !== "checkedIn" && key !== "uid")
    )
  );

  // Calculate pagination values
  const totalRows = items.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  
  // Reset page if it's out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);
  
  // Get current page of data
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const currentPageRows = items.slice(startIndex, endIndex);

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

  // Calculate stats for pagination display
  const firstRowNumber = totalRows === 0 ? 0 : startIndex + 1;
  const lastRowNumber = endIndex;
  const paginationText = `${firstRowNumber}-${lastRowNumber} of ${totalRows} rows`;

  // Calculate check-in stats
  const checkedInCount = items.filter(item => item.checkedIn).length;
  const notCheckedInCount = totalRows - checkedInCount;
  const checkInStats = `${checkedInCount} checked in, ${notCheckedInCount} not checked in`;

  return (
    <div className="board-list-container">
      {/* Stats row */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "12px" 
      }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {`${totalRows} rows total (${checkInStats})`}
        </div>
      </div>
      
      <div style={{ overflowX: "auto" }}>
        <table className="board-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col}</th>
              ))}
              {"checkedIn" in items[0] && <th style={{ width: "120px" }}>Status</th>}
            </tr>
          </thead>
          <tbody>
            {currentPageRows.map(item =>
              <tr key={item.uid || item.id}>
                {columns.map(col => (
                  <td key={col} style={{ textAlign: "center" }}>
                    {item[col] ?? ""}
                  </td>
                ))}
                {"checkedIn" in item && (
                  <td style={{ textAlign: "center" }}>
                    <span className={item.checkedIn ? "status-green" : "status-red"}>
                      {item.checkedIn ? "Checked In" : "Not Checked In"}
                    </span>
                  </td>
                )}
              </tr>
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