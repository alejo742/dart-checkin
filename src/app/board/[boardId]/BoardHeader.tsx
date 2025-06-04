"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const modes = [
  { key: "list", label: "List" },
  { key: "checkin", label: "Check-In" },
];

export default function BoardHeader() {
  const { boardId } = useParams();
  const [boardTitle, setBoardTitle] = useState("Board");

  // Replace with real fetch!
  useEffect(() => {
    // Simulate fetching board title
    setBoardTitle(`Board ${boardId}`);
  }, [boardId]);

  // Mode in localStorage or state
  const [mode, setMode] = useState("list");

  useEffect(() => {
    const stored = window.localStorage.getItem("boardMode");
    if (stored) setMode(stored);
  }, []);
  useEffect(() => {
    window.localStorage.setItem("boardMode", mode);
  }, [mode]);

  return (
    <header className="board-header">
      <h1 className="board-title">{boardTitle}</h1>
      <div className="mode-toggle">
        {modes.map((m) => (
          <button
            key={m.key}
            className={`mode-btn${mode === m.key ? " active" : ""}`}
            onClick={() => setMode(m.key)}
            type="button"
          >
            {m.label}
          </button>
        ))}
      </div>
    </header>
  );
}