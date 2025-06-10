"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { nanoid } from "nanoid";

interface ItemType {
  uid: string; // for row identification
  checkedIn?: boolean;
  [key: string]: any; // other dynamic fields, all string except checkedIn
}

interface Props {
  boardNameInitial: string;
  itemsInitial: ItemType[];
  onItemsChange?: (items: ItemType[]) => void;
  onBoardNameChange?: (name: string) => void;
  onSave?: (name: string, items: ItemType[]) => void;
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
  const [items, setItems] = useState<ItemType[]>(itemsInitial);

  // Dynamically determine all columns except 'uid' and 'checkedIn'
  const columns = Array.from(
    new Set(
      items.flatMap((item) => Object.keys(item))
        .filter((k) => k !== "uid" && k !== "checkedIn")
    )
  );

  // Filtering logic: always include the row being edited!
  const filteredItems = items.filter(item => {
    if (item.uid === editingRowUid) return true;
    // Search only over values (except checkedIn/uid)
    const matchSearch = columns.some(col => 
      (item[col]?.toString().toLowerCase().includes(search.toLowerCase()))
    );
    const matchFilter =
      filter === "all"
        ? true
        : filter === "checkedin"
        ? item.checkedIn
        : !item.checkedIn;
    return matchSearch && matchFilter;
  });

  // Handle input changes for any dynamic field
  const handleCellChange = (
    uid: string,
    key: string,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.uid === uid ? { ...item, [key]: value } : item
      )
    );
  };

  // Handle checkbox
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

  // --- Add Row Functionality ---
  const handleAddRow = () => {
    // Generate a blank row with all current columns, plus checkedIn
    const newRow: ItemType = {
      uid: nanoid(),
      checkedIn: false,
      ...Object.fromEntries(columns.map(col => [col, ""]))
    };
    const newItems = [...items, newRow];
    setItems(newItems);
    if (onSave) onSave(boardName, newItems);
  };

  // --- Remove Row Functionality ---
  const handleRemoveRow = (uid: string) => {
    const newItems = items.filter(item => item.uid !== uid);
    setItems(newItems);
    if (onSave) onSave(boardName, newItems);
  };

  useEffect(() => {
    if (onBoardNameChange) onBoardNameChange(boardName);
  }, [boardName, onBoardNameChange]);

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
            {columns.map(col => (
              <th key={col}>{col}</th>
            ))}
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
                  checked={!!item.checkedIn}
                  onChange={e => handleCheckinChange(item.uid, e.target.checked)}
                  aria-label={item.checkedIn ? "Checked In" : "Not Checked In"}
                />
              </td>
              {columns.map(col => (
                <td key={col}>
                  <input
                    className="spreadsheet-cell-input"
                    value={item[col] ?? ""}
                    onFocus={() => setEditingRowUid(item.uid)}
                    onChange={e => handleCellChange(item.uid, col, e.target.value)}
                    onBlur={handleCellBlur}
                    aria-label={col}
                    placeholder={col}
                  />
                </td>
              ))}
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