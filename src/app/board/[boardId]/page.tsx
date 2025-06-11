"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BoardTableView from "./BoardTableView";
import BoardListView from "./BoardListView";
import { fetchBoardById, updateBoardById, subscribeToBoardById, fetchBoardColumnOrder } from "@/lib/boards";
import "@/styles/board/board_view.css";
import BoardFilters from "./BoardFilters";
import { Board } from "@/types/board";
import { nanoid } from "nanoid";
import { exportBoardAsCSV, exportBoardAsExcel } from "@/utils/export/exportBoard";

export default function BoardPage() {
  const params = useParams();
  const boardId = params?.boardId as string;

  const [mode, setMode] = useState<"table" | "list">("table");
  const [loading, setLoading] = useState(true);
  const [boardName, setBoardName] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filtering logic (for export and list view)
  const filteredItems = items.filter(item => {
    const matchSearch = Object.entries(item)
    .filter(([key]) => key !== "uid" && key !== "checkedIn")
    .some(([_, value]) =>
      typeof value === "string" &&
      value.toLowerCase().includes(search.toLowerCase())
    );
    const matchFilter =
      filter === "all"
        ? true
        : filter === "checkedin"
        ? item.checkedIn
        : !item.checkedIn;
    return matchSearch && matchFilter;
  });

  // Fetch board data & column order on mount
  useEffect(() => {
    if (!boardId) return;
    setLoading(true);
    let unsub: (() => void) | undefined;

    const fetchColumnsAndSubscribe = async () => {
      // Fetch column order first
      const colOrder = await fetchBoardColumnOrder(boardId);
      setColumnOrder(colOrder);

      unsub = subscribeToBoardById(boardId, (board: any) => {
        if (!board) {
          setError("Board not found.");
          setBoardName("");
          setItems([]);
        } else {
          setBoardName(board.name ?? "");
          setItems(
            Array.isArray(board.items)
              ? board.items.map((item: any) => ({
                  ...item,
                  uid: item.uid ?? nanoid(),
                  checkedIn: typeof item.checkedIn === "boolean" ? item.checkedIn : !!item.checkedIn,
                }))
              : []
          );
          // Always update column order if present in board
          if (Array.isArray(board.columnOrder)) setColumnOrder(board.columnOrder);
        }
        setLoading(false);
      });
    };

    fetchColumnsAndSubscribe();

    return () => {
      if (unsub) unsub();
    };
  }, [boardId]);

  // TableView board name change handler (update local, save on user action)
  const handleTableBoardNameChange = (newName: string) => {
    setBoardName(newName);
  };

  // TableView save action: only call one save, not both
  const handleTableSave = (newName: string, newItems: any[]) => {
    setSaving(true);
    updateBoardById(boardId, { name: newName, items: newItems })
      .catch(() => setError("Failed to save changes."))
      .finally(() => setSaving(false));
  };

  // Export handlers (pass columnOrder)
  const handleExportCSV = () => {
    exportBoardAsCSV(boardName, filteredItems, columnOrder);
    setShowExportMenu(false);
  };

  const handleExportExcel = async () => {
    await exportBoardAsExcel(boardName, filteredItems, columnOrder);
    setShowExportMenu(false);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!showExportMenu) return;
    const handleClick = (e: MouseEvent) => {
      setShowExportMenu(false);
    };
    window.addEventListener("click", handleClick, { once: true });
    return () => window.removeEventListener("click", handleClick);
  }, [showExportMenu]);

  // automatically type-in on search bar whenever key pressed (when not focused on input, except when focused on checkboxes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // if focused on input (not checkbox), return
      if (e.target instanceof HTMLInputElement) {
        if (e.target.type !== "checkbox") {
          return;
        }
      }

      if (e.key === "Escape") {
        setSearch("");
      }
      // if it is a character or number, write
      else if ((e.key.length === 1 && e.key.match(/^[a-zA-Z0-9]$/))) {
        e.preventDefault();
        setSearch(prev => prev + e.key);
      }
      // if it is space, write space
      else if (e.key === " ") {
        e.preventDefault();
        setSearch(prev => prev + " ");
      }
      // if it is backspace
      else if (e.key === "Backspace") {
        e.preventDefault();
        setSearch(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center" }}>Loading...</div>;
  }
  if (error) {
    return <div style={{ padding: 32, textAlign: "center", color: "#b40026" }}>{error}</div>;
  }

  return (
    <div>
      <div className="board-main-actions">
        <div className="board-mode-switch">
          <button
            className={`mode-btn${mode === "table" ? " active" : ""}`}
            onClick={() => setMode("table")}
          >
            Table
          </button>
          <button
            className={`mode-btn${mode === "list" ? " active" : ""}`}
            onClick={() => setMode("list")}
          >
            List
          </button>
        </div>

        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            className="export-board-btn"
            onClick={e => {
              e.stopPropagation();
              setShowExportMenu(s => !s);
            }}
            type="button"
          >
            Export as...
            <span className="material-symbols-outlined">keyboard_arrow_down</span>
          </button>
          {showExportMenu && (
            <div className="export-menu-dropdown">
              <button onClick={handleExportCSV} type="button">Export as CSV</button>
              <button onClick={handleExportExcel} type="button">Export as Excel</button>
            </div>
          )}
        </div>
      </div>
      <BoardFilters
        search={search}
        filter={filter}
        onSearch={setSearch}
        onFilter={setFilter}
      />
      {saving && (
        <div className="saving-overlay">
          <span>Saving</span>
        </div>
      )}
      {mode === "table" ? (
        <BoardTableView
          boardNameInitial={boardName}
          itemsInitial={items}
          columns={columnOrder}
          onBoardNameChange={handleTableBoardNameChange}
          onSave={handleTableSave}
          search={search}
          filter={filter}
        />
      ) : (
        <BoardListView items={filteredItems} />
      )}
    </div>
  );
}