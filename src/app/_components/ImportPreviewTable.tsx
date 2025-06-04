import React from "react";
import type { NormalizedImportResult } from "@/utils/import/normalizeFlexibleInput";
import "@/styles/components/import_preview_table.css";

export default function ImportPreviewTable({
  importResult,
}: {
  importResult: NormalizedImportResult;
}) {
  const { columns, rows } = importResult;

  return (
    <div className="import-preview-table">
      <h3>Preview</h3>
      <table>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={col + idx}>{col === "Check" ? "" : col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((row, rIdx) => (
            <tr key={rIdx}>
              {/* Always a checkbox in the first col */}
              <td>
                <input type="checkbox" />
              </td>
              {columns.slice(1).map((col, cIdx) => (
                <td key={col + cIdx}>{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 20 && (
        <div style={{ fontSize: ".93em", color: "#666", marginTop: "2px" }}>
          (Showing first 20 rows)
        </div>
      )}
    </div>
  );
}