"use client";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";

interface Person {
  uid: string; // for row identification
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
  onBoardNameChange,
  onSave,
  search = "",
  filter = "all",
}: Props) {
  const [boardName, setBoardName] = useState(boardNameInitial);
  const [boardNameEditing, setBoardNameEditing] = useState(false);
  const [editingRowUid, setEditingRowUid] = useState<string | null>(null);
  const [items, setItems] = useState(itemsInitial);

  // Sync props to state if they change
  useEffect(() => setBoardName(boardNameInitial), [boardNameInitial]);
  useEffect(() => setItems(itemsInitial), [itemsInitial]);

  useEffect(() => {
    if (onBoardNameChange) onBoardNameChange(boardName);
  }, [boardName, onBoardNameChange]);

  // Filtering logic (moved from parent)
  const filteredItems = items.filter(item => {
    if (item.uid === editingRowUid) return true; // Always show the row being edited
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

  const handleNameChange = (uid: string | number, name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, name } : item))
    );
  };

  const handleLastNameChange = (uid: string | number, lastname: string) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, lastname } : item))
    );
  };

  const handleIdChange = (uid: string | number, newId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, id: newId } : item))
    );
  };

  const handleCheckinChange = (uid: string | number, checkedIn: boolean) => {
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
    // filtering returns 
    setEditingRowUid(null);

    if (onSave) onSave(boardName, items);
  };

  // --- Add Row Functionality ---
  const handleAddRow = () => {
    // Generate a unique uid for the row
    const newRow: Person & { uid: string } = {
      uid: nanoid(),
      id: "",
      name: "",
      lastname: "",
      checkedIn: false,
    };
    const newItems = [...items, newRow];
    setItems(newItems);
    if (onSave) onSave(boardName, newItems);
  };

  // --- Remove Row Functionality ---
  const handleRemoveRow = (uid: string | number) => {
    const newItems = items.filter(item => item.uid !== uid);
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
            <tr key={item.uid} className={item.checkedIn ? "row-checked" : ""}>
              <td>
                <input
                  type="checkbox"
                  checked={item.checkedIn}
                  onChange={e => {
                    handleCheckinChange(item.uid, e.target.checked);
                  }}
                  aria-label={item.checkedIn ? "Checked In" : "Not Checked In"}
                />
              </td>
              <td>
                <input
                  className="spreadsheet-cell-input"
                  value={item.name}
                  onFocus={() => setEditingRowUid(item.uid)}
                  onChange={e => handleNameChange(item.uid, e.target.value)}
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
                  onFocus={() => setEditingRowUid(item.uid)}
                  onChange={e => handleLastNameChange(item.uid, e.target.value)}
                  onBlur={handleCellBlur}
                  aria-label="Last Name"
                  placeholder="Last Name"
                />
              </td>
              <td>
                <input
                  className="spreadsheet-cell-input"
                  value={item.id}
                  onFocus={() => setEditingRowUid(item.uid)}
                  onChange={e => handleIdChange(item.uid, e.target.value)}
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
                  onClick={() => handleRemoveRow(item.uid)}
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