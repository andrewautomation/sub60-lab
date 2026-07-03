"use client";

import Link from "next/link";
import CsvDropzone from "@/components/import/CsvDropzone";
import ActivityPreviewCard from "@/components/import/ActivityPreviewCard";
import { useGarminImport } from "@/hooks/useGarminImport";

export default function ImportPage() {
  const {
    status,
    fileName,
    rows,
    issues,
    handleFile,
    saveRow,
    saveAll,
    discardRow,
    reset,
  } = useGarminImport();

  const pendingCount = rows.filter(
    (row) => row.status === "pending" || row.status === "error"
  ).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <p className="text-cyan-400 tracking-[0.3em] text-sm">
            GARMIN IMPORT
          </p>
          <h1 className="text-4xl font-bold mt-2">Import Activity</h1>
        </div>

        <Link href="/dashboard" className="text-cyan-400">
          ← Dashboard
        </Link>
      </div>

      <div className="mt-10 rounded-2xl bg-slate-900 p-6">
        <p className="text-lg font-semibold">Import Garmin CSV</p>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Export your activities from Garmin Connect as CSV and drop the file
          below. This is the recommended way to add new performance
          data — manual entry is still available on each module, but
          importing is faster and captures more metrics automatically.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-2xl">🏊</p>
            <p className="mt-2 font-semibold">Pool Swim</p>
            <p className="text-sm text-slate-400">
              Distance, pace, SWOLF, strokes, HR
            </p>
          </div>
          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-2xl">🚴</p>
            <p className="mt-2 font-semibold">Cycling</p>
            <p className="text-sm text-slate-400">
              Power, normalized power, cadence, speed, HR
            </p>
          </div>
          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-2xl">🏃</p>
            <p className="mt-2 font-semibold">Running</p>
            <p className="text-sm text-slate-400">
              Distance, pace, cadence, HR
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <CsvDropzone onFileSelected={handleFile} fileName={fileName} />
      </div>

      {status === "parsing" && (
        <p className="mt-6 text-slate-400">Parsing {fileName}...</p>
      )}

      {status === "unsupported" && (
        <p className="mt-6 text-red-400">
          Unsupported file. Please upload a Garmin Connect CSV export (.csv).
        </p>
      )}

      {status === "empty" && (
        <p className="mt-6 text-red-400">
          No recognizable Pool Swim, Cycling, or Running activities were
          found in this file.
        </p>
      )}

      {issues.length > 0 && (
        <div className="mt-6 rounded-2xl bg-slate-900 border border-red-900/50 p-5">
          <p className="font-semibold text-red-400">
            {issues.length} row{issues.length > 1 ? "s" : ""} could not be
            imported
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-400">
            {issues.map((issue, index) => (
              <li key={index}>
                Row {issue.row}
                {issue.field ? ` (${issue.field})` : ""}: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Detected Activities ({rows.length})
            </h2>

            <div className="flex gap-3">
              <button
                onClick={saveAll}
                disabled={pendingCount === 0}
                className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black disabled:opacity-50"
              >
                Save All ({pendingCount})
              </button>

              <button
                onClick={reset}
                className="rounded-lg bg-slate-800 px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {rows.map((row) => (
              <ActivityPreviewCard
                key={row.id}
                row={row}
                onSave={saveRow}
                onDiscard={discardRow}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
