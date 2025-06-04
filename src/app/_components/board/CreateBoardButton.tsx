import { useCurrentUser } from "@/lib/user/useCurrentUser"; // or whatever hook you use
import { createBoard } from "@/lib/boards";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateBoardButton() {
  const user = useCurrentUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) {
      // Prompt login or show modal
      alert("You must be logged in to create a board.");
      // Or trigger your login popup/modal here
      return;
    }
    setLoading(true);
    try {
      const docRef = await createBoard({
        ownerId: user.uid,
        // Optionally: boardName, items, description
      });
      // Redirect to the new board page
      router.push(`/board/${docRef.id}`);
    } catch (err) {
      alert("Failed to create board: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Hide button if not logged in

  return (
    <button className="create-board-btn" onClick={handleCreate} disabled={loading}>
      {loading ? "Creating..." : "Create Board"}
    </button>
  );
}