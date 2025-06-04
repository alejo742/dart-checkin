import Navbar from "@/components/Navbar";
import "@/styles/board/board_view.css";

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="board-layout">
        <div className="board-main-content">{children}</div>
      </div>
    </>
  );
}