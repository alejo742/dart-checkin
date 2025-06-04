"use client";
import { useRef, useState, useEffect } from "react";
import ExcelJS, { CellValue } from "exceljs";
import { normalizeFlexibleInput } from "@/utils/import/normalizeFlexibleInput";
import ImportPreviewTable from "@/app/_components/ImportPreviewTable";
import FloatingAlert from "@/components/FloatingAlert";
import LoadingModal from "@/components/LoadingModal";
import AuthButton from "@/app/_components/AuthButton";
import Navbar from "@/components/Navbar";
import CreateBoardButton from "@/app/_components/board/CreateBoardButton";
import "@/styles/board/board_new.css";

const SAMPLE_CSV = `Alejandro Manrique f0875xx, Shawn Montreal f0071xx, \nPatty O'Connor f0002xx`;

export default function BoardNewPage() {
  const [csvText, setCsvText] = useState("");
  const [importResult, setImportResult] = useState<any>(null);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPreviewAlert, setShowPreviewAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Run normalization whenever csvText changes
  useEffect(() => {
    if (!csvText.trim()) {
      setImportResult(null);
      setShowPreviewAlert(false);
      return;
    }
    try {
      const normalized = normalizeFlexibleInput(csvText);
      setImportResult(normalized);
      setShowPreviewAlert(true);
    } catch (err) {
      setImportResult(null);
      setShowPreviewAlert(false);
    }
  }, [csvText]);

  // Handle file upload for CSV and Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsLoading(true);

    const ext = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();

    if (ext === "csv") {
      reader.onload = (ev) => {
        setCsvText(ev.target?.result as string);
        setIsLoading(false);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      reader.onload = async (ev) => {
        try {
          const buffer = ev.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          const worksheet = workbook.worksheets[0];
          let csv = "";
          worksheet.eachRow({ includeEmpty: true }, (row) => {
            const values = Array.isArray(row.values) ? row.values : [];
            const rowVals = values.slice(1).map((cell: CellValue) => {
              if (cell === null || cell === undefined) return "";
              if (typeof cell === "object") {
                if (cell instanceof Date) return cell.toISOString();
                return JSON.stringify(cell);
              }
              return String(cell);
            });
            csv += rowVals.join(",") + "\n";
          });
          setCsvText(csv.trim());
        } catch (err) {
          alert("Error parsing Excel file.");
        }
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Unsupported file type. Please upload a CSV or Excel file.");
      setIsLoading(false);
    }
  };

  // Handle CSV paste
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData?.getData) {
      setCsvText(e.clipboardData.getData("text"));
    }
  };

  // Paste CSV example
  const handleCsvExample = () => {
    setCsvText(SAMPLE_CSV);
  };

  // For now, stub for "Create Board"
  const handleCreateBoard = () => {
    if (!csvText.trim()) {
      alert("Please upload or paste CSV data first.");
      return;
    }
    alert("Board creation is not implemented in this stub.");
  };

  return (
    <main className="board-new-main-bg">
      {isLoading && (
        <LoadingModal show={isLoading} />
      )}
      <Navbar right={<AuthButton/>} />
      <section className="board-new-flex">
        <div className="board-new-form-card">
          <h2 className="board-new-title">
            Create a New Board
          </h2>
          <div className="format-guide">
            <b>Format Guide:</b> Paste a comma-separated list of names, IDs, or both. We’ll do the rest!<br />
            <span className="csv-example-btn" onClick={handleCsvExample} role="button" tabIndex={0}>
              See an example
            </span>
          </div>

          <div className="file-upload-area">
            <input
              type="file"
              accept=".csv, .xls, .xlsx, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              className="file-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              {fileName ? "Change File" : "Upload File"}
            </button>
            <span className="file-name">
              {fileName
                ? `📄 ${fileName}`
                : "No file selected (CSV or Excel)"}
            </span>
          </div>

          <div className="or-divider">or</div>
          <textarea
            className="csv-textarea"
            placeholder="Paste CSV data here..."
            rows={13}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            onPaste={handlePaste}
            spellCheck={false}
          />

          {/* Button to create */}
          <CreateBoardButton />
          
          { importResult && (
            <p className="preview-note">
              You can modify this later. Click "Create Board" to finalize your import.
            </p> 
          )}
          {/* Preview Table */}
          {importResult && (
            <div className="import-preview-wrapper">
              <ImportPreviewTable importResult={importResult} />
            </div>
          )}
        </div>
      </section>
      {showPreviewAlert && (
        <FloatingAlert
          message="Preview generated! Scroll down to check your imported attendees."
          type="info"
          duration={3300}
          onDone={() => setShowPreviewAlert(false)}
        />
      )}
    </main>
  );
}