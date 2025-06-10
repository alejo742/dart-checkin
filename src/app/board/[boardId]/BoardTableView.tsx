"use client";
import React, { useState, useRef, useCallback, forwardRef } from "react";
import { nanoid } from "nanoid";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

interface ItemType {
  uid: string;
  checkedIn?: boolean;
  [key: string]: any;
}

interface Props {
  boardNameInitial: string;
  columns: string[]; // Pass in columns as from import/preview!
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

  // Filtering logic: always include the row being edited!
  const filteredItems = items.filter((item) => {
    if (item.uid === editingRowUid) return true;
    const matchSearch = columns.some((col) =>
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

  const filteredItemsRef = useRef(filteredItems);
  filteredItemsRef.current = filteredItems;

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
    const newItems = [...items, newRow];
    setItems(newItems);
    if (onSave) onSave(boardName, newItems);
  };

  const handleRemoveRow = (uid: string) => {
    const newItems = items.filter((item) => item.uid !== uid);
    setItems(newItems);
    if (onSave) onSave(boardName, newItems);
  };

  const Row = useCallback(
    ({ index }: ListChildComponentProps) => {
      const item = filteredItemsRef.current[index];
      return (
        <tr key={item.uid} className={item.checkedIn ? "row-checked" : ""}>
          {/* "Check" column handled as a checkbox */}
          <td>
            <input
              type="checkbox"
              checked={!!item.checkedIn}
              onChange={(e) => handleCheckinChange(item.uid, e.target.checked)}
              aria-label={item.checkedIn ? "Checked In" : "Not Checked In"}
            />
          </td>
          {/* Skip first column, which is "Check" */}
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
      );
    },
    [columns]
  );

  // Virtualization setup: only <tr> inside <tbody>
  const InnerElement = forwardRef<HTMLTableSectionElement, React.HTMLProps<HTMLTableSectionElement>>(
    function InnerElement(props, ref) {
      return <>{props.children}</>;
    }
  );
  InnerElement.displayName = "InnerElement";
  const OuterElement = forwardRef<HTMLTableSectionElement, React.HTMLProps<HTMLTableSectionElement>>(
    function OuterElement(props, ref) {
      return <tbody ref={ref} {...props} />;
    }
  );
  OuterElement.displayName = "OuterElement";

  const rowHeight = 48;
  const totalRows = filteredItems.length;
  const listHeight = Math.min(12, totalRows) * rowHeight;

  return (
    <div className="board-table-container" style={{ overflowX: "auto", overflowY: "auto", maxHeight: `${listHeight + 48}px` }}>
      <div
        className="board-table-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
      <table
        className="spreadsheet-table"
        style={{
          minWidth: `${(columns.length + 3) * 160}px`,
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            {/* Show header, but blank for "Check" */}
            {columns.map((col, idx) => (
              <th key={col + idx}>{col === "Check" ? "" : col}</th>
            ))}
            <th>Status</th>
            <th style={{ width: 44, minWidth: 44 }}></th>
          </tr>
        </thead>
        <List
          height={listHeight}
          itemCount={totalRows}
          itemSize={rowHeight}
          width="100%"
          outerElementType={OuterElement as any}
          innerElementType={InnerElement as any}
          style={{ overflowX: "hidden", willChange: "auto" }}
        >
          {Row}
        </List>
      </table>
    </div>
  );
}