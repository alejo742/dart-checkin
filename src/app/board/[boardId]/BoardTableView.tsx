"use client";
import { useState, useEffect } from "react";

interface Person {
  id: string | number;
  name: string;
  lastname?: string;
  checkedIn: boolean;
}

interface Props {
  boardNameInitial: string;
  itemsInitial: Person[];
  onItemsChange?: (items: Person[]) => void;
  onBoardNameChange?: (name: string) => void;
  onSave?: (name: string, items: Person[]) => void;
  search?: string;
  filter?: string;
}

export default function BoardTableView({
  boardNameInitial,
  itemsInitial,
  onItemsChange,
  onBoardNameChange,
  onSave,
  search = "",
  filter = "all",
}: Props) {
  const [boardName, setBoardName] = useState(boardNameInitial);
  const [boardNameEditing, setBoardNameEditing] = useState(false);
  const [items, setItems] = useState(itemsInitial);

  // Sync props to state if they change
  useEffect(() => setBoardName(boardNameInitial), [boardNameInitial]);
  useEffect(() => setItems(itemsInitial), [itemsInitial]);

  useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);

  useEffect(() => {
    if (onBoardNameChange) onBoardNameChange(boardName);
  }, [boardName, onBoardNameChange]);

  // Filtering logic (moved from parent)
  const filteredItems = items.filter(item => {
    const matchSearch =
      (item.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (item.lastname?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (item.id?.toString().toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchFilter =
      filter === "all"
        ? true
        : filter === "checkedin"
        ? item.checkedIn
        : !item.checkedIn;
    return matchSearch && matchFilter;
  });

  const handleNameChange = (id: string | number, name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const handleLastNameChange = (id: string | number, lastname: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, lastname } : item))
    );
  };

  const handleIdChange = (id: string | number, newId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, id: newId } : item))
    );
  };

  const handleCheckinChange = (id: string | number, checkedIn: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checkedIn } : item))
    );
  };

  const handleBoardNameBlur = () => {
    setBoardNameEditing(false);
    if (onSave) onSave(boardName, items);
  };

  const handleCellBlur = () => {
    if (onSave) onSave(boardName, items);
  };

  // --- Add Row Functionality ---
  const handleAddRow = () => {
    // Generate a unique id (timestamp + random)
    const newId = `row_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const newRow: Person = {
      id: newId,
      name: "",
      lastname: "",
      checkedIn: false,
    };
    const newItems = [...items, newRow];
    setItems(newItems);
    if (onSave) onSave(boardName, newItems);
  };

  // --- Remove Row Functionality ---
  const handleRemoveRow = (id: string | number) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    if (onSave) onSave(boardName, newItems);
  };

  return (
    <div className="board-table-container">
      <div className="board-table-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          {boardNameEditing ? (
            <input
              value={boardName}
              autoFocus
              className="board-edit-title"
              onChange={e => setBoardName(e.target.value)}
              onBlur={handleBoardNameBlur}
              onKeyDown={e => (e.key === "Enter" || e.key === "Escape") && handleBoardNameBlur()}
            />
          ) : (
            <h2
              className="board-title-spreadsheet"
              onClick={() => setBoardNameEditing(true)}
              tabIndex={0}
              title="Click to edit board name"
            >
              {boardName}
              <span className="edit-icon" title="Edit">&#9998;</span>
            </h2>
          )}
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
      <table className="spreadsheet-table">
        <thead>
          <tr>
            <th style={{ width: 36 }}></th>
            <th>Name</th>
            <th>Last Name</th>
            <th>ID</th>
            <th>Status</th>
            <th style={{ width: 44 }}></th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, index) => (
            <tr key={item.id} className={item.checkedIn ? "row-checked" : ""}>
              <td>
                <input
                  type="checkbox"
                  checked={item.checkedIn}
                  onChange={e => {
                    handleCheckinChange(item.id, e.target.checked);
                  }}
                  onBlur={handleCellBlur}
                  aria-label={item.checkedIn ? "Checked In" : "Not Checked In"}
                />
              </td>
              <td>
                <input
                  className="spreadsheet-cell-input"
                  value={item.name}
                  onChange={e => handleNameChange(item.id, e.target.value)}
                  onBlur={handleCellBlur}
                  style={{ color: item.checkedIn ? "#0b8132" : "#b40026", fontWeight: 500 }}
                  aria-label="First Name"
                  placeholder="First Name"
                />
              </td>
              <td>
                <input
                  className="spreadsheet-cell-input"
                  value={item.lastname ?? ""}
                  onChange={e => handleLastNameChange(item.id, e.target.value)}
                  onBlur={handleCellBlur}
                  aria-label="Last Name"
                  placeholder="Last Name"
                />
              </td>
              <td>
                <input
                  className="spreadsheet-cell-input"
                  value={item.id}
                  onChange={e => handleIdChange(item.id, e.target.value)}
                  onBlur={handleCellBlur}
                  aria-label="ID"
                  placeholder="ID"
                />
              </td>
              <td>
                <span className={item.checkedIn ? "status-green" : "status-red"}>
                  {item.checkedIn ? "Checked In" : "Not Checked In"}
                </span>
              </td>
              <td>
                <button
                  className="spreadsheet-remove-row-btn"
                  aria-label="Remove Row"
                  title="Remove Row"
                  onClick={() => handleRemoveRow(item.id)}
                  type="button"
                  tabIndex={0}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}