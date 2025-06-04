import React from "react";
import "@/styles/components/loading_modal.css";

export default function LoadingModal({ show, text }: { show: boolean; text?: string }) {
  if (!show) return null;
  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="loading-modal-spinner" />
        <div className="loading-modal-text">
          {text || "Loading..."}
        </div>
      </div>
    </div>
  );
}