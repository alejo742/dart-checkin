import BoardHeader from "./BoardHeader";
import BoardFilters from "./BoardFilters";
import "@/styles/board/board_view.css";

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="board-layout">
      <BoardHeader />
      <BoardFilters />
      <div className="board-main-content">{children}</div>
    </div>
  );
}