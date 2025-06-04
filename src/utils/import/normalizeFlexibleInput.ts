import Papa from "papaparse";

export interface NormalizedImportResult {
  columns: string[];
  rows: Record<string, string>[];
}

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

/**
 * Normalize a flexible input (CSV) to {columns, rows}.
 * Handles:
 * 1. CSV with headers (columns inferred from first row if non-numeric).
 * 2. CSV without headers (guesses columns: Name, Lastname, ID).
 * 3. Single-line comma-separated input (Alejandro,Manrique,f0079rn,...).
 */
export function normalizeFlexibleInput(input: string): NormalizedImportResult {
  // Use PapaParse to split into rows/columns
  let rowsArr = parseCsv(input);
  // Remove any rows that are fully empty
  rowsArr = rowsArr.filter(row => row.some(cell => cell.trim().length > 0));

  if (rowsArr.length === 0) {
    return { columns: [], rows: [] };
  }

  // Heuristic: If the first row is ["Alejandro", "Manrique", "f0079rn"]
  // and the second is similar, treat as no header and guess columns.

  // If only one row and >2 columns, treat as a single "list" row
  if (rowsArr.length === 1 && rowsArr[0].length > 2) {
    // Try to chunk into triplets: Name, Lastname, ID
    const triplets = [];
    for (let i = 0; i < rowsArr[0].length; i += 3) {
      triplets.push(rowsArr[0].slice(i, i + 3));
    }
    rowsArr = triplets;
  }

  // Guess columns if not present
  let columns: string[] = [];
  let dataRows: string[][] = [];

  // Detect header: if first row has ANY cell with non-alpha chars or "Name"/"Lastname"/"ID"
  const firstRow = rowsArr[0].map(s => s.trim());
  const isHeader =
    firstRow.some(cell => /name|last\s*name|id/i.test(cell)) ||
    firstRow.some(cell => cell === "Check") ||
    // If all values are non-numeric, likely header
    firstRow.every(cell => /^[a-zA-Z\s]+$/.test(cell) && cell.length > 0);

  if (isHeader) {
    columns = firstRow;
    dataRows = rowsArr.slice(1);
  } else {
    // Guess number of columns
    const maxLen = Math.max(...rowsArr.map(row => row.length));
    if (maxLen === 3) {
      columns = ["Name", "Lastname", "ID"];
    } else if (maxLen === 2) {
      columns = ["Name", "ID"];
    } else if (maxLen === 1) {
      columns = ["ID"];
    } else {
      // Fallback: Name, Lastname, ID, Extra1, Extra2...
      columns = Array.from({ length: maxLen }, (_, i) =>
        ["Name", "Lastname", "ID"][i] || `Field${i + 1}`
      );
    }
    dataRows = rowsArr;
  }

  // Always prepend "Check" as first column
  if (!columns.includes("Check")) columns = ["Check", ...columns];

  // Build normalized rows
  const normalizedRows: Record<string, string>[] = dataRows.map(rawRow => {
    const row: Record<string, string> = {};
    columns.forEach((col, idx) => {
      if (col === "Check") {
        row[col] = "";
        return;
      }
      row[col] = (rawRow[idx - 1] ?? "").trim(); // idx-1 because of Check
    });
    return row;
  });

  return {
    columns,
    rows: normalizedRows,
  };
}