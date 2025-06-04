import { Attendee } from "@/types/attendee";
import { ColumnGuess } from "@/types/import";

// Patterns for heuristic guessing
const EMAIL_REGEX = /^[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
const ID_REGEX = /^\d{4,}$/i;
const NAME_REGEX = /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/;

/**
 * Guess the meaning of columns based on values in the rows.
 * Returns an array of guesses with confidence and sample data.
 */
export function guessColumns(rows: string[][]): ColumnGuess[] {
  if (rows.length === 0) return [];

  // Use first N rows for sampling
  const sampleCount = Math.min(10, rows.length);
  const columns = rows[0].length;

  const guesses: ColumnGuess[] = [];

  for (let col = 0; col < columns; col++) {
    const samples = rows.slice(0, sampleCount).map(row => row[col] ?? "");
    let name = `field${col + 1}`;
    let confidence = 0;

    // Heuristic checks
    if (samples.every(val => EMAIL_REGEX.test(val))) {
      name = "email";
      confidence = 100;
    } else if (samples.every(val => ID_REGEX.test(val))) {
      name = "id";
      confidence = 90;
    } else if (samples.every(val => val.toLowerCase() === "pending" || val.toLowerCase() === "checked-in")) {
      name = "status";
      confidence = 90;
    } else if (samples.every(val => val.split(" ").length === 2 && NAME_REGEX.test(val))) {
      name = "name_lastname";
      confidence = 80;
    } else if (samples.every(val => val.split(" ").length === 1 && NAME_REGEX.test(val))) {
      name = "name";
      confidence = 70;
    }

    guesses.push({
      name,
      confidence,
      sampleData: samples,
    });
  }
  return guesses;
}

/**
 * Normalize rows and column guesses into an array of Attendee objects.
 * Attempts to split "name_lastname" if found.
 */
export function normalizeRows(
  rows: string[][],
  guesses: ColumnGuess[]
): Attendee[] {
  return rows.map(row => {
    const attendee: Attendee = {};
    for (let i = 0; i < guesses.length; i++) {
      const guess = guesses[i];
      const val = row[i] ?? "";

      if (guess.name === "name_lastname") {
        const [name, lastname] = val.split(" ");
        attendee.name = name;
        attendee.lastname = lastname;
      } else if (["name", "lastname", "email", "id", "status"].includes(guess.name)) {
        attendee[guess.name] = val;
      } else {
        attendee[guess.name] = val;
      }
    }
    return attendee;
  });
}