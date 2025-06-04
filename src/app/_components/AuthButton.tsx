"use client";
import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { saveUserToFirestore } from "@/lib/user/saveUser";
import "@/styles/components/auth_button.css";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    try {
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await saveUserToFirestore(result.user);
      }
    } catch (err) {
      alert("Login failed: " + (err as Error).message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div className="auth-profile">
        <img
          src={user.photoURL || ""}
          alt={user.displayName?.split(" ")[0] || "profile"}
          className="auth-avatar"
        />
        <span className="auth-name">{user.displayName || user.email}</span>
        <button className="logout-btn" onClick={handleSignOut}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <button className="login-btn google" onClick={handleSignIn}>
      <img src="/google-icon-colored.svg" alt="Google" className="google-logo" />
      Log in with Google
    </button>
  );
}