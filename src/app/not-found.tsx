import Link from "next/link";
import "@/styles/not_found.css";

export default function NotFound() {
  return (
    <main className="notfound-container">
      <h1 className="notfound-title">404 — Page Not Found</h1>
      <p className="notfound-message">
        Sorry, we couldn't find that page.
      </p>
      <Link href="/" className="notfound-home-link">
        Go Home
      </Link>
    </main>
  );
}