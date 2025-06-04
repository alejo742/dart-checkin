"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import BoardTableView from "./BoardTableView";
import BoardListView from "./BoardListView";
import { fetchBoardById, updateBoardById } from "@/lib/boards";
import "@/styles/board/board_view.css";
import BoardFilters from "./BoardFilters";

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

  // Filtering logic
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
    fetchBoardById(boardId)
      .then((board) => {
        if (!board) {
          setError("Board not found.");
          setBoardName("");
          setItems([]);
        } else {
          setBoardName(board.name ?? "");
          if (Array.isArray(board.items)) {
            setItems(
              board.items.map((item: any, idx: number) => ({
                id: item.id ?? idx,
                name: item.name ?? "",
                lastname: item.lastname ?? "",
                checkedIn: !!item.checkedIn,
              }))
            );
          } else {
            setItems([]);
          }
        }
      })
      .catch(() => {
        setError("Failed to load board.");
        setBoardName("");
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [boardId]);

// Save handler for board name
const handleSaveBoardName = useCallback(
    async (newName: string) => {
      if (!boardId) return;
      setSaving(true);
      try {
        await updateBoardById(boardId, { name: newName });
        // No setBoardName here!
      } catch {
        setError("Failed to save board name.");
      } finally {
        setSaving(false);
      }
    },
    [boardId]
  );
  
  // Save handler for board items
  const handleSaveItems = useCallback(
    async (newItems: any[]) => {
      if (!boardId) return;
      setSaving(true);
      try {
        await updateBoardById(boardId, { items: newItems });
        // No setItems here!
      } catch {
        setError("Failed to save items.");
      } finally {
        setSaving(false);
      }
    },
    [boardId]
  );
  
  // TableView item change handler (update local, save on user action)
  const handleTableItemsChange = (newItems: any[]) => {
    setItems(newItems);
  };

  // TableView board name change handler (update local, save on user action)
  const handleTableBoardNameChange = (newName: string) => {
    setBoardName(newName);
  };

  // TableView save action: only call one save, not both
  const handleTableSave = (newName: string, newItems: any[]) => {
    // Save both at once if you want:
    setSaving(true);
    updateBoardById(boardId, { name: newName, items: newItems })
      .catch(() => setError("Failed to save changes."))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center" }}>Loading...</div>;
  }
  if (error) {
    return <div style={{ padding: 32, textAlign: "center", color: "#b40026" }}>{error}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 20, display: "flex", gap: 16 }}>
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
          onItemsChange={handleTableItemsChange}
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