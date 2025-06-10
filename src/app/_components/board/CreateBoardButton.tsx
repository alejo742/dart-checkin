import { useCurrentUser } from "@/lib/user/useCurrentUser";
import { createBoard } from "@/lib/boards";
import { parseItemsFromCSVWithAI } from "@/utils/import/parseCsvWithAI";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseCsv } from "@/utils/import/normalizeFlexibleInput";
import { guessColumns, normalizeRows } from "@/utils/import/heuristics";

export default function CreateBoardButton({
  parsedItems,
  boardName,
  description,
  csvText
}: {
  parsedItems: any[];
  boardName?: string;
  description?: string;
  csvText?: string;
}) {
  const user = useCurrentUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) {
      alert("You must be logged in to create a board.");
      return;
    }
    setLoading(true);
    try {
      let items = parsedItems ?? [];
      if (csvText && csvText.trim()) {
        if (csvText.length > 5000) {
          // Use heuristics for large CSVs
          const rows = parseCsv(csvText);
          // Remove empty rows
          const filteredRows = rows.filter(row => row.some(cell => cell.trim().length > 0));
          const guesses = guessColumns(filteredRows);
          items = normalizeRows(filteredRows, guesses);
        } else {
          // Use OpenAI for small CSVs
          try {
            items = await parseItemsFromCSVWithAI(csvText);
          } catch (err) {
            alert("Failed to parse CSV with AI: " + (err as Error).message);
            setLoading(false);
            return;
          }
        }
      }
      const docRef = await createBoard({
        ownerId: user.uid,
        boardName,
        items,
        description,
      });
      router.push(`/board/${docRef.id}`);
    } catch (err) {
      alert("Failed to create board: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="create-board-btn"
      onClick={handleCreate}
      disabled={loading}
    >
      {loading ? "Creating..." : "Create Board"}
    </button>
  );
}