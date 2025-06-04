import { useCurrentUser } from "@/lib/user/useCurrentUser";
import { createBoard } from "@/lib/boards";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateBoardButton({
  parsedItems,
  boardName,
  description,
}: {
  parsedItems: any[];     // Array of {name, lastname, id, checked} etc.
  boardName?: string;
  description?: string;
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
      const docRef = await createBoard({
        ownerId: user.uid,
        boardName,
        items: parsedItems ?? [],
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