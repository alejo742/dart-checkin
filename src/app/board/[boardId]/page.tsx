"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import BoardTableView from "./BoardTableView";
import BoardListView from "./BoardListView";
import { fetchBoardById, updateBoardById, subscribeToBoardById } from "@/lib/boards";
import "@/styles/board/board_view.css";
import BoardFilters from "./BoardFilters";
import { Board } from "@/types/board";
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

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filtering logic (for export and list view)
  const filteredItems = items.filter(item => {
    const matchSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.lastname?.toLowerCase().includes(search.toLowerCase()) ||
      item.id?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "checkedin"
        ? item.checkedIn
        : !item.checkedIn;
    return matchSearch && matchFilter;
  });

  // Fetch board data on mount
  useEffect(() => {
    if (!boardId) return;
    setLoading(true);
    console.log("Subscribing to board", boardId);
    const unsubscribe = subscribeToBoardById(boardId, (board: any) => {
      console.log("onSnapshot fired", board);
      if (!board) {
        setError("Board not found.");
        setBoardName("");
        setItems([]);
      } else {
        setBoardName(board.name ?? "");
        setItems(
          Array.isArray(board.items)
            ? board.items.map((item: any, idx: number) => ({
                id: item.id ?? idx,
                name: item.name ?? "",
                lastname: item.lastname ?? "",
                checkedIn: !!item.checkedIn,
              }))
            : []
        );
      }
      setLoading(false);
    });
    return () => {
      console.log("Unsubscribing from board", boardId);
      unsubscribe();
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

  // Export handlers
  const handleExportCSV = () => {
    exportBoardAsCSV(boardName, filteredItems);
    setShowExportMenu(false);
  };

  const handleExportExcel = async () => {
    await exportBoardAsExcel(boardName, filteredItems);
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