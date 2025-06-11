import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  DocumentReference,
  orderBy, 
  limit,
  deleteDoc,
  updateDoc,
  onSnapshot,
  doc
} from "firebase/firestore";
import { nanoid } from "nanoid";
import { Board, BoardFilters } from "@/types/board";

/**
 * Creates a new board for a user.
 * Ensures the board name is unique for the user (appends a number if necessary).
 * @param ownerId Firebase UID of board owner
 * @param boardName Desired board name (suggested)
 * @param items Array of items (rows) to initialize the board with
 * @param description Optional description
 * @returns The board document reference
 */
export async function createBoard({
  ownerId,
  boardName,
  items,
  description,
}: {
  ownerId: string;
  boardName?: string;
  items?: {
    [key: string]: any;
  }[];
  description?: string;
}): Promise<DocumentReference> {
  // 1. Get all board names for this user
  const boardsRef = collection(db, "boards");
  const userBoardsQuery = query(boardsRef, where("ownerId", "==", ownerId));
  const userBoardsSnap = await getDocs(userBoardsQuery);

  const userBoards = userBoardsSnap.docs.map((doc) => doc.data());
  // 2. Find the highest Board N used, suggest next
  const baseName = (boardName && boardName.trim()) || "Board";
  let finalName = baseName;
  let count = 1;
  const userBoardNames = userBoards.map((b) => String(b.name || "").toLowerCase());
  while (
    userBoardNames.includes(finalName.toLowerCase())
  ) {
    count += 1;
    finalName = baseName + " " + count;
  }

  // 3. Ensure each item has a unique uid
  const itemsWithUid = (items || []).map(item => ({
    ...item,
    uid: nanoid(),
  }));

  // 4. Determine column order from the first item, excluding 'uid'
  let columnOrder: string[] = [];
  if (itemsWithUid.length > 0) {
    columnOrder = Object.keys(itemsWithUid[0]).filter(
      key => key !== "uid"
    );
  }

  // 5. Add the board
  const docRef = await addDoc(boardsRef, {
    name: finalName,
    ownerId,
    items: itemsWithUid,
    columnOrder, // <--- store column order too
    description: description || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef;
}

/**
 * Fetch boards for a user, optionally filtering by board name, updatedAt, etc.
 * @param userId The Firebase user UID (required)
 * @param filters Optional filters: name, updatedAfter, updatedBefore, limit
 * @returns Array of board objects
 */
export async function fetchBoards(
  userId: string,
  filters?: BoardFilters
): Promise<Board[]> {
  let q = query(
    collection(db, "boards"),
    where("ownerId", "==", userId)
  );

  // Apply name filter
  if (filters?.name) {
    q = query(q, where("name", "==", filters.name));
  }

  // Apply updatedAt filters
  if (filters?.updatedAfter) {
    q = query(q, where("updatedAt", ">", filters.updatedAfter));
  }
  if (filters?.updatedBefore) {
    q = query(q, where("updatedAt", "<", filters.updatedBefore));
  }

  // Always order by updatedAt descending by default for dashboards
  q = query(q, orderBy("updatedAt", "desc"));

  // Limit if requested
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
      updatedAt: data.updatedAt?.toDate
        ? data.updatedAt.toDate()
        : undefined,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
      items: data.items
    } as Board;
  });
}

/**
 * Fetches the column order for a board by its document ID.
 * Returns an array of column keys in the order they should be displayed (excluding "uid").
 * If columnOrder is not set, will infer from the first item row (excluding "uid").
 * 
 * @param boardId The Firestore document ID of the board.
 * @returns Promise<string[]> Array of column names in order (excluding "uid").
 */
export async function fetchBoardColumnOrder(boardId: string): Promise<string[]> {
  if (!boardId) throw new Error("No board ID provided.");
  const ref = doc(db, "boards", boardId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data();

  // Prefer explicit columnOrder
  if (Array.isArray(data.columnOrder) && data.columnOrder.length > 0) {
    return data.columnOrder.filter((col: string) => col !== "uid");
  }

  // Fallback: infer from first item if present
  if (Array.isArray(data.items) && data.items.length > 0) {
    return Object.keys(data.items[0]).filter((col) => col !== "uid");
  }

  // No columns available
  return [];
}

/**
 * Fetch a single board by its document ID.
 * @param boardId The Firestore document ID of the board to fetch.
 * @returns The board object or null if not found.
 */
export async function fetchBoardById(boardId: string): Promise<Board | null> {
  if (!boardId) throw new Error("No board ID provided.");
  const ref = doc(db, "boards", boardId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();

  return {
    id: snap.id,
    name: data.name,
    description: data.description,
    ownerId: data.ownerId,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
    items: data.items,
    ...data,
  } as Board;
}

/**
 * Updates a board in Firestore by its ID.
 * Uses a smart merge strategy that prioritizes preserving positive check-ins.
 * 
 * @param boardId - Firestore document ID of the board
 * @param boardUpdate - The updated board data (can be partial)
 * @returns Promise<void>
 */
export async function updateBoardById(
  boardId: string,
  boardUpdate: Partial<Board>
): Promise<void> {
  if (!boardId) throw new Error("No board ID provided.");

  const boardRef = doc(db, "boards", boardId);
  
  // If the update doesn't contain items, just do a simple update
  if (!boardUpdate.items) {
    await updateDoc(boardRef, {
      ...boardUpdate,
      updatedAt: serverTimestamp(),
    });
    return;
  }
  
  // For updates with items, we need to implement our smart merge strategy
  // First get the current state of the board
  const currentBoardSnap = await getDoc(boardRef);
  if (!currentBoardSnap.exists()) {
    throw new Error("Board not found");
  }
  
  const currentBoard = currentBoardSnap.data();
  const currentItems = currentBoard.items || [];
  
  // Create a map of current items by UID for easy lookup
  const currentItemsMap = new Map();
  for (const item of currentItems) {
    if (item && item.uid) {
      currentItemsMap.set(item.uid, item);
    }
  }
  
  // Process the updated items with our merge strategy
  const updatedItems = (boardUpdate.items || []).map(updatedItem => {
    // If this item doesn't exist in the current board, just use the updated version
    if (!updatedItem.uid || !currentItemsMap.has(updatedItem.uid)) {
      return updatedItem;
    }
    
    const currentItem = currentItemsMap.get(updatedItem.uid);
    
    // Special case: If the current item is checked in but the update would uncheck it,
    // preserve the checked-in status (prioritize positive check-ins)
    if (currentItem.checkedIn === true && updatedItem.checkedIn === false) {
      return {
        ...updatedItem,
        checkedIn: true // Preserve the checked-in status
      };
    }
    
    // Otherwise, use the updated item
    return updatedItem;
  });
  
  // Update the board with our merged items
  await updateDoc(boardRef, {
    ...boardUpdate,
    items: updatedItems,
    updatedAt: serverTimestamp(),
  });
}
/**
 * Subscribes to real-time updates for a board by ID.
 * Calls the callback with the latest board data on each change.
 * Returns the unsubscribe function.
 * @param boardId The Firestore document ID of the board to subscribe to.
 * @param callback The function to call with the board data on updates.}
 * @returns A function to unsubscribe from the updates.
 */
export function subscribeToBoardById(
  boardId: string,
  callback: (board: Board | null) => void
): () => void {
  if (!boardId) throw new Error("No board ID provided.");
  const ref = doc(db, "boards", boardId);
  return onSnapshot(ref, (snap: any) => {
    if (!snap.exists()) { callback(null); return; }
    const data = snap.data();
    callback({
      id: snap.id,
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
      items: data.items,
      ...data,
    } as Board);
  });
}

/**
 * Deletes a board by its document ID.
 * @param boardId The Firestore document ID of the board to delete.
 * @returns A promise that resolves when the board is deleted.
 */
export async function deleteBoard(boardId: string): Promise<void> {
  if (!boardId) throw new Error("No board ID provided.");
  await deleteDoc(doc(db, "boards", boardId));
}