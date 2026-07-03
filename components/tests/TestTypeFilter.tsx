"use client";

import { TestType } from "@/types/testType";

export const ALL_TEST_TYPES = "all";
export const UNSORTED_TEST_TYPE = "unsorted";

interface Props {
  testTypes: TestType[];
  selected: string;
  onSelect: (value: string) => void;
}

/**
 * Scopes a discipline page (stats + chart + history) to one Test Type at a
 * time, so a 5K Time Trial trend isn't diluted by a 10K test or a set of
 * intervals — those are different signals, not points on the same line.
 * "Unsorted" surfaces legacy tests logged before Test Types existed, so
 * the athlete can find and reassign them via Edit.
 */
export default function TestTypeFilter({ testTypes, selected, onSelect }: Props) {
  const options = [
    { value: ALL_TEST_TYPES, label: "All" },
    ...testTypes.map((t) => ({ value: t.id, label: t.name })),
    { value: UNSORTED_TEST_TYPE, label: "Unsorted" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${
            selected === option.value
              ? "bg-cyan-500 text-black font-semibold"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
