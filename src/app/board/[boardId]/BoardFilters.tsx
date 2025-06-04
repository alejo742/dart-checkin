"use client";
import { useState } from "react";

export default function BoardFilters() {
  const [search, setSearch] = useState("");
  // Simulate filters; replace with real filters as needed
  const [filter, setFilter] = useState("all");

  return (
    <div className="board-filters">
      <input
        className="board-search"
        type="text"
        placeholder="Search attendees/items..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select
        className="board-filter-select"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="checkedin">Checked In</option>
        <option value="notcheckedin">Not Checked In</option>
      </select>
    </div>
  );
}