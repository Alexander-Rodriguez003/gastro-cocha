"use client";
import { useState, useRef } from "react";
import { Upload } from "lucide-react";

interface Props {
  currentUrl: string;
  onUrlChange: (url: string) => void;
}

export function ImageUpload({ currentUrl, onUrlChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        onUrlChange(data.url);
      } else {
        alert("Error al subir la imagen: " + (data.error || "desconocido"));
      }
    } catch {
      alert("Error de conexión al subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <input
        type="text"
        value={currentUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://ejemplo.com/imagen.jpg"
        style={{ flex: 1, padding: "0.45rem 0.65rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: "0.8rem" }}
      />
      <label
        style={{
          padding: "0.45rem 0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)",
          cursor: "pointer", fontSize: "0.78rem", color: "var(--color-muted)", display: "flex", alignItems: "center", gap: 4,
          whiteSpace: "nowrap", background: "var(--color-bg)", opacity: uploading ? 0.6 : 1,
        }}
      >
        <Upload size={14} />
        {uploading ? "Subiendo..." : "Subir"}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      </label>
    </div>
  );
}
