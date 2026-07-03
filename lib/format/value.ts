/** Renders a possibly-null field for a table/card cell — "—" when absent
 * rather than an empty cell, so a missing optional metric always reads as
 * "not recorded" rather than looking like a rendering bug. */
export function formatOrDash(value: number | string | null | undefined, suffix: string = ""): string {
  if (value === null || value === undefined || value === "") return "—";
  return `${value}${suffix}`;
}
