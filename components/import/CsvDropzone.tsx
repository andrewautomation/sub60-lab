"use client";

import { useRef, useState } from "react";

type CsvDropzoneProps = {
  onFileSelected: (file: File) => void;
  fileName: string | null;
};

export default function CsvDropzone({
  onFileSelected,
  fileName,
}: CsvDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={`rounded-2xl border-2 border-dashed p-12 text-center transition ${
        isDragging
          ? "border-cyan-400 bg-slate-900/80"
          : "border-slate-700 bg-slate-900"
      }`}
    >
      <p className="text-4xl">⬆</p>

      <p className="mt-4 text-lg font-semibold">
        Drag & drop your Garmin CSV export here
      </p>

      <p className="mt-1 text-sm text-slate-400">or</p>

      <button
        onClick={() => inputRef.current?.click()}
        className="mt-4 rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-black"
      >
        Choose CSV
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {fileName && (
        <p className="mt-4 text-sm text-slate-400">
          Selected file: <span className="text-slate-200">{fileName}</span>
        </p>
      )}
    </div>
  );
}
