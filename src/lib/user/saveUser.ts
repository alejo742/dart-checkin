import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// user should be a FirebaseUser object (from userCredential.user)
export async function saveUserToFirestore(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}) {
  if (!user || !user.uid) return;
  // Save under /users/{uid}
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}