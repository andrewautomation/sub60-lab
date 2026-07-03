"use client";

import { useState } from "react";
import { TestType } from "@/types/testType";

export const ALL_TEST_TYPES = "all";
export const UNSORTED_TEST_TYPE = "unsorted";

interface Props {
  testTypes: TestType[];
  selected: string;
  onSelect: (value: string) => void;
  onDelete: (id: string) => Promise<{ error: string | null }>;
}

/**
 * Scopes a discipline page (stats + chart + history) to one Test Type at a
 * time, so a 5K Time Trial trend isn't diluted by a 10K test or a set of
 * intervals — those are different signals, not points on the same line.
 * "Unsorted" surfaces legacy tests logged before Test Types existed, so
 * the athlete can find and reassign them via Edit.
 *
 * A dropdown rather than a row of buttons, since an athlete can create as
 * many types as they want — a button per type doesn't scale. Deleting is a
 * separate, deliberately out-of-the-way "Manage" panel rather than an ✕ on
 * the dropdown itself, so it can't be triggered by accident while filtering.
 */
export default function TestTypeFilter({ testTypes, selected, onSelect, onDelete }: Props) {
  const [managing, setManaging] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TestType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!pendingDelete) return;
    const testType = pendingDelete;

    setDeletingId(testType.id);
    setDeleteError(null);
    const { error } = await onDelete(testType.id);
    setDeletingId(null);
    setPendingDelete(null);

    if (error) {
      setDeleteError(error);
      return;
    }
    if (selected === testType.id) onSelect(ALL_TEST_TYPES);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-lg bg-slate-800 p-2 text-sm"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value={ALL_TEST_TYPES}>All</option>
          {testTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
          <option value={UNSORTED_TEST_TYPE}>Unsorted</option>
        </select>

        {testTypes.length > 0 && (
          <button
            type="button"
            onClick={() => setManaging((v) => !v)}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            {managing ? "Done" : "Manage test types"}
          </button>
        )}
      </div>

      {managing && testTypes.length > 0 && (
        <div className="mt-3 space-y-2 rounded-lg bg-slate-800/60 p-3">
          {testTypes.map((t) => (
            <div key={t.id} className="flex items-center justify-between text-sm">
              <span>{t.name}</span>
              <button
                type="button"
                onClick={() => setPendingDelete(t)}
                disabled={deletingId === t.id}
                className="rounded-lg bg-red-500/10 px-3 py-1 text-red-400 hover:bg-red-500/20 disabled:opacity-60"
              >
                {deletingId === t.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
          {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6">
            <h3 className="text-lg font-bold">Delete &ldquo;{pendingDelete.name}&rdquo;?</h3>
            <p className="mt-2 text-sm text-slate-400">
              Its tests stay logged and move to Unsorted — nothing is deleted except the type label.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deletingId === pendingDelete.id}
                className="rounded-lg bg-slate-800 px-4 py-2 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === pendingDelete.id}
                className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-black disabled:opacity-60"
              >
                {deletingId === pendingDelete.id ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
