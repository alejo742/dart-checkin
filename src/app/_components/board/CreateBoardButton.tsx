import { useCurrentUser } from "@/lib/user/useCurrentUser";
import { createBoard } from "@/lib/boards";
import { parseItemsFromCSVWithAI } from "@/utils/import/parseCsvWithAI";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateBoardButton({
  parsedItems,
  boardName,
  description,
  csvText
}: {
  parsedItems: any[];     // Array of {name, lastname, id, checked} etc.
  boardName?: string;
  description?: string;
  csvText?: string;       // Optional CSV text to parse
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
      // Use AI to parse CSV if csvText is provided (and maybe always use AI)
      if (csvText && csvText.trim()) {
        try {
          items = await parseItemsFromCSVWithAI(csvText);
        } catch (err) {
          alert("Failed to parse CSV with AI: " + (err as Error).message);
          setLoading(false);
          return;
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
    >
      {loading ? "Creating..." : "Create Board"}
    </button>
  );
}