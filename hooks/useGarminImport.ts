"use client";

import { useCallback, useState } from "react";
import { getParserForFilename } from "@/lib/parser/registry";
import { saveParsedActivity } from "@/services/import.service";
import { ActivityParseIssue, ParsedActivity } from "@/types/import";

export type ImportRowStatus = "pending" | "saving" | "saved" | "error";

export interface ImportRow {
  id: string;
  activity: ParsedActivity;
  status: ImportRowStatus;
  error: string | null;
}

export type ImportStatus = "idle" | "parsing" | "ready" | "unsupported" | "empty";

export function useGarminImport() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [issues, setIssues] = useState<ActivityParseIssue[]>([]);

  const handleFile = useCallback(async (file: File) => {
    setStatus("parsing");
    setFileName(file.name);
    setRows([]);
    setIssues([]);

    const parser = getParserForFilename(file.name);

    if (!parser) {
      setStatus("unsupported");
      return;
    }

    try {
      const contents =
        parser.readAs === "text"
          ? await file.text()
          : await file.arrayBuffer();

      const result = parser.parse(contents);

      setIssues(result.issues);
      setRows(
        result.activities.map((activity, index) => ({
          id: `${file.name}-${index}`,
          activity,
          status: "pending",
          error: null,
        }))
      );
      setStatus(result.activities.length === 0 ? "empty" : "ready");
    } catch {
      setStatus("unsupported");
      setIssues([
        { row: 0, message: "The file could not be read. Is it a valid CSV export?" },
      ]);
    }
  }, []);

  const saveRow = useCallback(async (id: string) => {
    let target: ImportRow | undefined;

    setRows((prev) => {
      target = prev.find((row) => row.id === id);
      return prev.map((row) =>
        row.id === id ? { ...row, status: "saving", error: null } : row
      );
    });

    if (!target) return;

    const { error } = await saveParsedActivity(target.activity);

    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: error ? "error" : "saved", error }
          : row
      )
    );
  }, []);

  const saveAll = useCallback(async () => {
    for (const row of rows) {
      if (row.status === "pending" || row.status === "error") {
        await saveRow(row.id);
      }
    }
  }, [rows, saveRow]);

  const discardRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setFileName(null);
    setRows([]);
    setIssues([]);
  }, []);

  return {
    status,
    fileName,
    rows,
    issues,
    handleFile,
    saveRow,
    saveAll,
    discardRow,
    reset,
  };
}
