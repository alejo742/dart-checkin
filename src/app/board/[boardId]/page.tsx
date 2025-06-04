"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BoardTableView from "./BoardTableView";
import BoardListView from "./BoardListView";
import { fetchBoardById } from "@/lib/boards"; 
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
          // Defensive: convert board.items to match the editable table format
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
      {mode === "table" ? (
        <BoardTableView
          boardNameInitial={boardName}
          itemsInitial={filteredItems}
        />
      ) : (
        <BoardListView items={filteredItems} />
      )}
    </div>
  );
}