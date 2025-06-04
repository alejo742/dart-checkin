import { useEffect, useState } from "react";
import "@/styles/components/floating_alert.css";

interface FloatingAlertProps {
  message: string;
  duration?: number; // milliseconds the alert stays visible
  type?: "info" | "success" | "warning" | "error";
  onDone?: () => void;
}

export default function FloatingAlert({
  message,
  duration = 3000,
  type = "info",
  onDone,
}: FloatingAlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  // Trigger callback when the alert is done hiding
  useEffect(() => {
    if (!visible && onDone) {
      const timer = setTimeout(onDone, 350);
      return () => clearTimeout(timer);
    }
  }, [visible, onDone]);

  return (
    <div
      className={`floating-alert floating-alert-${type} ${
        visible ? "floating-alert-in" : "floating-alert-out"
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}