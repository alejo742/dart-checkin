import Papa from "papaparse";

/**
 * Parses CSV text into rows. Returns an array of arrays of strings.
 * Skips empty lines.
 */
export function parseCsv(text: string): string[][] {
  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: true,
    dynamicTyping: false,
    delimiter: undefined, // auto-detect
  });
  // PapaParse returns result.data as (string | undefined)[][]
  // We'll coerce undefined to empty string for safety
  return (result.data as (string | undefined)[][]).map(row =>
    row.map(cell => cell ?? "")
  );
}