import Link from "next/link";
import "@/styles/landing.css";

export default function LandingPage() {
  return (
    <main className="container">
      <section className="hero">
        <h1 className="title">Dartmouth Event Check-In</h1>
        <p className="subtitle">
          Modern, fast, and easy attendee check-in for your campus events.
        </p>
        <Link href="/board/new" className="cta-button">
          Create a Board
        </Link>
      </section>
    </main>
  );
}