import { Attendee } from "./attendee";

/**
 * Represents a guessed column with confidence and examples.
 */
export interface ColumnGuess {
  name: string;               // e.g. "name", "email", "id", etc
  confidence: number;         // 0-100, based on heuristics
  sampleData: string[];       // first few values from this column
}

/**
 * Result of the import/parse + heuristic step.
 */
export interface ImportResult {
  raw: string; // original text (for debugging or "undo")
  rows: Attendee[]; // normalized attendee objects
  columns: string[]; // detected column names (may differ from Attendee keys)
  columnGuesses: ColumnGuess[]; // per-column confidence and examples
  notes?: string[]; // warnings, ambiguities, etc
  originalRows: string[][]; // parsed raw rows before normalization
  columnMap: Record<string, string>; // original/detected column -> confirmed name (if user remaps)
}