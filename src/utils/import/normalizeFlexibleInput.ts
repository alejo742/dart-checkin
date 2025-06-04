export interface NormalizedImportResult {
  columns: string[];
  rows: Record<string, string>[];
}

// Heuristic helpers
function isNumberLike(value: string) {
  return /^[\d\- ]+$/.test(value.trim());
}
function looksLikeID(value: string) {
  // At least one word in the value is alphanumeric with a digit (e.g. "f0079rn", "12345")
  return value.trim().split(/\s+/).some((word) => /\d/.test(word));
}
function hasTwoWords(value: string) {
  return value.trim().split(/\s+/).length === 2;
}
function splitNameAndId(value: string): { name: string; lastname: string; id: string } {
  const parts = value.trim().split(/\s+/);
  let id = "";
  // Find the last part that contains a digit and treat as ID
  let idIdx = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/\d/.test(parts[i])) {
      idIdx = i;
      id = parts[i];
      break;
    }
  }
  if (idIdx === -1) {
    // No ID found
    if (parts.length === 2) return { name: parts[0], lastname: parts[1], id: "" };
    if (parts.length === 1) return { name: parts[0], lastname: "", id: "" };
    return { name: value.trim(), lastname: "", id: "" };
  } else {
    // ID found, rest are name/lastname
    const nameParts = parts.slice(0, idIdx);
    if (nameParts.length === 2) return { name: nameParts[0], lastname: nameParts[1], id };
    if (nameParts.length === 1) return { name: nameParts[0], lastname: "", id };
    return { name: nameParts.join(" "), lastname: "", id };
  }
}

export function normalizeFlexibleInput(input: string): NormalizedImportResult {
  let columns: string[] = [];
  let rows: Record<string, string>[] = [];

  // 1. Replace all line breaks with spaces (treat as one line)
  // 2. Then split by commas as the only separator
  // 3. Trim and remove empty items
  const items = input
    .replace(/[\r\n]+/g, ' ')
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  // Heuristic: if all items are IDs (each item is only one word and contains a number)
  if (items.length && items.every((v) => v.split(/\s+/).length === 1 && looksLikeID(v))) {
    columns = ["Check", "ID"];
    rows = items.map((id) => ({ Check: "", ID: id }));
    return { columns, rows };
  }

  // If all items look like "Firstname Lastname"
  if (items.length && items.every((v) => hasTwoWords(v) && !looksLikeID(v))) {
    columns = ["Check", "Name", "Lastname"];
    rows = items.map((full) => {
      const [name, lastname] = full.trim().split(/\s+/, 2);
      return { Check: "", Name: name, Lastname: lastname };
    });
    return { columns, rows };
  }

  // If items are a mix of names and/or IDs, possibly attached at the end
  columns = ["Check"];
  let hasName = false, hasLastname = false, hasID = false;
  const parsedRows: Record<string, string>[] = items.map((v) => {
    const parts = v.trim().split(/\s+/);
    if (parts.length === 1 && looksLikeID(parts[0])) {
      hasID = true;
      return { ID: v };
    } else {
      const { name, lastname, id } = splitNameAndId(v);
      if (name) hasName = true;
      if (lastname) hasLastname = true;
      if (id) hasID = true;
      const row: Record<string, string> = {};
      if (name) row["Name"] = name;
      if (lastname) row["Lastname"] = lastname;
      if (id) row["ID"] = id;
      return row;
    }
  });
  if (hasName) columns.push("Name");
  if (hasLastname) columns.push("Lastname");
  if (hasID) columns.push("ID");
  rows = parsedRows.map((r) => {
    const row: Record<string, string> = { Check: "" };
    columns.forEach((col) => {
      if (col !== "Check") row[col] = ((r as Record<string, string>)[col] ?? "");
    });
    return row;
  });
  return { columns, rows };
}