import ExcelJS from "exceljs";

/**
 * Triggers a file download in the browser.
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

/**
 * Utility to filter out any key that matches /^uid$/i (case-insensitive).
 */
function filterUid(keys: string[]): string[] {
  return keys.filter(k => !/^uid$/i.test(k));
}

/**
 * Exports the given items as a CSV file and triggers download.
 * If columnOrder is provided, uses it to control the order of columns in the export.
 */
export function exportBoardAsCSV(boardName: string, items: any[], columnOrder?: string[]) {
  if (!items.length) return;
  // Prefer provided columnOrder, otherwise use detected keys
  let columns: string[];
  if (Array.isArray(columnOrder) && columnOrder.length > 0) {
    columns = columnOrder.filter(k => !/^uid$/i.test(k));
    // Always put checkedIn first if present
    if (columns.includes("checkedIn")) {
      columns = ["checkedIn", ...columns.filter(k => k !== "checkedIn")];
    }
  } else {
    const keys = Object.keys(items[0]);
    columns = ["checkedIn", ...filterUid(keys).filter(k => k !== "checkedIn")];
  }

  const csvRows = [
    columns.join(","), // header
    ...items.map(item =>
      columns
        .map(col => {
          if (col === "checkedIn") {
            return item.checkedIn ? '"x"' : '""';
          }
          const val = item[col] ?? "";
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\r\n")], { type: "text/csv" });
  triggerDownload(blob, `${boardName || "board"}-export.csv`);
}

/**
 * Exports the given items as an Excel file (.xlsx) using ExcelJS and triggers download.
 * If columnOrder is provided, uses it to control the order of columns in the export.
 */
export async function exportBoardAsExcel(boardName: string, items: any[], columnOrder?: string[]) {
  if (!items.length) return;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Board");

  // Prefer provided columnOrder, otherwise use detected keys
  let columns: string[];
  if (Array.isArray(columnOrder) && columnOrder.length > 0) {
    columns = columnOrder.filter(k => !/^uid$/i.test(k));
    // Always put checkedIn first if present
    if (columns.includes("checkedIn")) {
      columns = ["checkedIn", ...columns.filter(k => k !== "checkedIn")];
    }
  } else {
    const allKeys = Object.keys(items[0] ?? {});
    columns = ["checkedIn", ...filterUid(allKeys).filter(k => k !== "checkedIn")];
  }

  sheet.columns = columns.map(key => ({
    header: key === "checkedIn" ? "Checked In" : key[0].toUpperCase() + key.slice(1),
    key,
  }));

  // Add data rows, "x" if checked in, "" otherwise
  items.forEach(item => {
    const rowObj: any = {};
    columns.forEach(col => {
      if (col === "checkedIn") {
        rowObj.checkedIn = item.checkedIn ? "x" : "";
      } else {
        rowObj[col] = item[col] ?? "";
      }
    });
    sheet.addRow(rowObj);
  });

  // Optional: Auto width for columns
  sheet.columns.forEach(col => {
    let maxLen = col.header?.length || 0;
    items.forEach(item => {
      let val = col.key === "checkedIn" ? (item.checkedIn ? "x" : "") : item[col.key as string];
      if (val !== undefined && val !== null) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    });
    col.width = Math.max(10, Math.min(32, maxLen + 2));
  });

  // Add pretty borders and background colors
  // Header row with distinct color
  const headerRow = sheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBBF7D0" },
    };
    cell.font = { bold: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF34D399" } },
      left: { style: "thin", color: { argb: "FF34D399" } },
      bottom: { style: "thin", color: { argb: "FF34D399" } },
      right: { style: "thin", color: { argb: "FF34D399" } },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Data rows: alternate background for all, including last row
  const rowCount = sheet.rowCount;
  for (let rowNumber = 2; rowNumber <= rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFB8E0D2" } },
        left: { style: "thin", color: { argb: "FFB8E0D2" } },
        bottom: { style: "thin", color: { argb: "FFB8E0D2" } },
        right: { style: "thin", color: { argb: "FFB8E0D2" } },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowNumber % 2 === 0 ? "FFF0FDF4" : "FFFFFFFF" },
      };
      if (colNumber === 1) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { bold: true, color: { argb: "FF059669" } };
      }
    });
  }

  // Generate and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob(
    [buffer],
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
  );
  triggerDownload(blob, `${boardName || "board"}-export.xlsx`);
}