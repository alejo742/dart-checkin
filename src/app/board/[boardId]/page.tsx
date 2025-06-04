"use client";
import { useState, useEffect } from "react";
import BoardListView from "./BoardListView";
import BoardCheckinView from "./BoardCheckinView";

// In a real app, get these from context or a store (passed from layout/header/filters)
function useBoardMode() {
  const [mode, setMode] = useState("list");
  useEffect(() => {
    const stored = window.localStorage.getItem("boardMode");
    if (stored) setMode(stored);
  }, []);
  return mode;
}

export default function BoardPage() {
  const mode = useBoardMode();

  // Simulate board data
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    setItems([
      { id: 1, name: "Alice Smith", checkedIn: true },
      { id: 2, name: "Bob Jones", checkedIn: false },
      { id: 3, name: "Carol Lee", checkedIn: false },
    ]);
  }, []);

  return mode === "checkin"
    ? <BoardCheckinView items={items} />
    : <BoardListView items={items} />;
}