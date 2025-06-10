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
  return (result.data as (string | undefined)[][]).map(row =>
    row.map(cell => cell ?? "")
  );
}

/**
 * Normalize a flexible input (CSV) to {columns, rows}.
 * Always treats the first row as the header.
 */
export function normalizeFlexibleInput(input: string): NormalizedImportResult {
  let rowsArr = parseCsv(input);
  rowsArr = rowsArr.filter(row => row.some(cell => cell.trim().length > 0));

  if (rowsArr.length === 0) {
    return { columns: [], rows: [] };
  }

  // Always treat first row as header (standard CSV)
  const columns = rowsArr[0].map(s => s.trim());
  const dataRows = rowsArr.slice(1);

  // Build normalized rows
  const normalizedRows: Record<string, string>[] = dataRows.map(rawRow => {
    const row: Record<string, string> = {};
    columns.forEach((col, idx) => {
      row[col] = (rawRow[idx] ?? "").trim();
    });
    return row;
  });

  return {
    columns,
    rows: normalizedRows,
  };
}