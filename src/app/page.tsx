"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/user/useCurrentUser";
import { useEffect, useState, useMemo } from "react";
import { fetchBoards } from "@/lib/boards";
import { Board } from "@/types/board";
import "@/styles/home.css";

interface BoardCardProps {
  id: string;
  name: string;
  description?: string;
  updatedAt?: string;
}

function BoardCard({ id, name, description, updatedAt }: BoardCardProps) {
  return (
    <Link href={`/boards/${id}`} className="board-card">
      <div className="board-card-title">{name}</div>
      {description && <div className="board-card-desc">{description}</div>}
      {updatedAt && (
        <div className="board-card-updated">
          Last updated: {new Date(updatedAt).toLocaleString()}
        </div>
      )}
    </Link>
  );
}

export default function LandingPage() {
  const user = useCurrentUser();
  const [boards, setBoards] = useState<BoardCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) {
      setBoards([]);
      return;
    }
    setLoading(true);
    const getBoards = async () => {
      try {
        const boardsData: Board[] = await fetchBoards(user.uid);
        setBoards(
          boardsData.map((b) => ({
            id: b.id,
            name: b.name,
            description: b.description,
            updatedAt: b.updatedAt ? b.updatedAt.toISOString() : undefined,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    getBoards();
  }, [user]);

  // Filter boards by search (matches name or ANY substring in updatedAt's local string)
  const filteredBoards = useMemo(() => {
    if (!search.trim()) return boards;
    const lower = search.toLowerCase();
    return boards.filter((b) => {
      const nameMatch = b.name.toLowerCase().includes(lower);
      const dateString =
        b.updatedAt && new Date(b.updatedAt).toLocaleString().toLowerCase();
      const dateMatch = dateString ? dateString.includes(lower) : false;
      return nameMatch || dateMatch;
    });
  }, [boards, search]);

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="hero">
          <h1 className="title">Dartmouth Event Check-In</h1>
          <p className="subtitle">
            Modern, fast, and easy attendee check-in for your campus events.
          </p>
          <Link href="/board/new" className="cta-button">
            Create a Board
          </Link>
        </section>
        {user && (
          <section className="dashboard">
            <h2 className="dashboard-title">Your Boards</h2>
            <div className="dashboard-searchbar-container">
              <input
                className="dashboard-searchbar"
                type="text"
                placeholder="Search boards by name or date…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="dashboard-loading">Loading boards...</div>
            ) : filteredBoards.length === 0 ? (
              <div className="dashboard-empty">
                {boards.length === 0
                  ? "You have no boards yet. Create your first one!"
                  : "No boards match your search."}
              </div>
            ) : (
              <div className="dashboard-boards">
                {filteredBoards.map((b) => (
                  <BoardCard key={b.id} {...b} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}