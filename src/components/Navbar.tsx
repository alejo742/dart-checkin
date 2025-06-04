import React from "react";
import Link from "next/link";
import "@/styles/board/board_new.css";

export default function Navbar({ right }: { right?: React.ReactNode }) {
  return (
    <nav className="board-new-navbar">
      <Link href="/" className="board-new-logo">Dartmouth Check-In</Link>
      {right ? right : null}
    </nav>
  );
}