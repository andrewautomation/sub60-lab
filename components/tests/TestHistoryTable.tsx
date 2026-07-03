"use client";

import { ReactNode, useState } from "react";

export interface TestColumnConfig<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

interface Props<T extends { id: string }> {
  columns: TestColumnConfig<T>[];
  rows: T[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<{ error: string | null }>;
  emptyMessage: string;
}

/**
 * Shared history list for the Swim/Bike/Run test modules: a real table on
 * medium+ screens, a stacked card list on mobile — same column config
 * drives both so there's exactly one place that knows each sport's fields.
 */
export default function TestHistoryTable<T extends { id: string }>({
  columns,
  rows,
  onEdit,
  onDelete,
  emptyMessage,
}: Props<T>) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this test? This can't be undone.")) return;

    setDeletingId(id);
    setDeleteError(null);
    const { error } = await onDelete(id);
    setDeletingId(null);

    if (error) setDeleteError({ id, message: error });
  }

  if (rows.length === 0) {
    return <div className="rounded-2xl bg-slate-900 p-10 text-center text-slate-400">{emptyMessage}</div>;
  }

  return (
    <div className="rounded-2xl bg-slate-900 overflow-hidden">
      <table className="w-full text-left hidden md:table">
        <thead className="bg-slate-800 text-slate-300 text-sm">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="p-4">
                {col.label}
              </th>
            ))}
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-800 align-top">
              {columns.map((col) => (
                <td key={col.key} className="p-4">
                  {col.render(row)}
                </td>
              ))}
              <td className="p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(row.id)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    disabled={deletingId === row.id}
                    className="rounded-lg bg-red-500/10 text-red-400 px-3 py-1.5 text-sm hover:bg-red-500/20 disabled:opacity-60"
                  >
                    {deletingId === row.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
                {deleteError?.id === row.id && <p className="mt-1 text-xs text-red-400">{deleteError.message}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="md:hidden divide-y divide-slate-800">
        {rows.map((row) => (
          <div key={row.id} className="p-4 space-y-2">
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between gap-4 text-sm">
                <span className="text-slate-400">{col.label}</span>
                <span className="font-medium text-right">{col.render(row)}</span>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => onEdit(row.id)} className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm">
                Edit
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                disabled={deletingId === row.id}
                className="flex-1 rounded-lg bg-red-500/10 text-red-400 px-3 py-2 text-sm disabled:opacity-60"
              >
                {deletingId === row.id ? "Deleting..." : "Delete"}
              </button>
            </div>
            {deleteError?.id === row.id && <p className="text-xs text-red-400">{deleteError.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
