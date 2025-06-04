"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCurrentUser } from "@/lib/user/useCurrentUser";
import { useEffect, useState, useMemo } from "react";
import { fetchBoards, deleteBoard } from "@/lib/boards";
import { Board } from "@/types/board";
import AuthButton from "./_components/AuthButton";
import "@/styles/home.css";

interface BoardCardProps {
  id: string;
  name: string;
  description?: string;
  updatedAt?: string;
  onDelete?: (id: string) => void;
}

function BoardCard({ id, name, description, updatedAt, onDelete }: BoardCardProps) {
  return (
    <div className="board-card">
      <Link href={`/board/${id}`} className="board-card-link">
        <div className="board-card-title">{name}</div>
        {description && <div className="board-card-desc">{description}</div>}
        {updatedAt && (
          <div className="board-card-updated">
            Last updated: {new Date(updatedAt).toLocaleString()}
          </div>
        )}
      </Link>
      <div className="board-card-actions">
        <Link
          href={`/board/${id}`}
          className="board-card-edit"
          title="Edit board"
          onClick={e => e.stopPropagation()}
        >
          Edit
        </Link>
        {onDelete && (
          <button
            className="board-card-delete"
            title="Delete board"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(id);
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const user = useCurrentUser();
  const [boards, setBoards] = useState<BoardCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this board? This action cannot be undone."
    );
    if (!confirmDelete) return;
    setDeletingId(id);
    try {
      await deleteBoard(id);
      setBoards((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      alert("Failed to delete the board. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

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
      <Navbar right={ <AuthButton/> } />
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
                  <BoardCard
                    key={b.id}
                    {...b}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
            {deletingId && (
              <div className="dashboard-deleting-overlay">
                Deleting board...
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}