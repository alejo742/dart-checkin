"use client";
import { useState } from "react";

interface Person {
  id: string | number;
  name: string;
  lastname?: string;
  checkedIn: boolean;
}

interface Props {
  boardNameInitial: string;
  itemsInitial: Person[];
}

export default function BoardTableView({ boardNameInitial, itemsInitial }: Props) {
  const [boardName, setBoardName] = useState(boardNameInitial);
  const [boardNameEditing, setBoardNameEditing] = useState(false);
  const [items, setItems] = useState(itemsInitial);

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

  const handleBoardNameBlur = () => setBoardNameEditing(false);

  return (
    <div className="board-table-container">
      <div className="board-table-header">
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
      <table className="spreadsheet-table">
        <thead>
          <tr>
            <th style={{ width: 36 }}></th>
            <th>Name</th>
            <th>Last Name</th>
            <th>ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={item.checkedIn ? "row-checked" : ""}>
              <td>
                <input
                  type="checkbox"
                  checked={item.checkedIn}
                  onChange={e => handleCheckinChange(item.id, e.target.checked)}
                  aria-label={item.checkedIn ? "Checked In" : "Not Checked In"}
                />
              </td>
              <td>
                <input
                  className="spreadsheet-cell-input"
                  value={item.name}
                  onChange={e => handleNameChange(item.id, e.target.value)}
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
                  aria-label="Last Name"
                  placeholder="Last Name"
                />
              </td>
              <td>
                <input
                  className="spreadsheet-cell-input"
                  value={item.id}
                  onChange={e => handleIdChange(item.id, e.target.value)}
                  aria-label="ID"
                  placeholder="ID"
                />
              </td>
              <td>
                <span className={item.checkedIn ? "status-green" : "status-red"}>
                  {item.checkedIn ? "Checked In" : "Not Checked In"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}