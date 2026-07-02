import { ActivityParseResult } from "@/types/import";
import { parseGarminCsv } from "./garminCsvParser";

export type FileReadStrategy = "text" | "arraybuffer";

export interface ActivityFileParser {
  id: string;
  label: string;
  extensions: string[];
  readAs: FileReadStrategy;
  parse: (contents: string | ArrayBuffer) => ActivityParseResult;
}

/**
 * Every supported file format registers here as a self-contained strategy.
 * Adding FIT/TCX/GPX later means writing one new file that implements this
 * interface and adding it to the list below — the UI, hook, and preview
 * screen never need to change.
 */
const FILE_PARSERS: ActivityFileParser[] = [
  {
    id: "garmin-csv",
    label: "Garmin Connect CSV export",
    extensions: ["csv"],
    readAs: "text",
    // The registry's `parse` signature must also cover future binary
    // formats (FIT), so the string-only garminCsvParser is cast here.
    parse: (contents) => parseGarminCsv(contents as string),
  },
];

export function getParserForFilename(
  filename: string
): ActivityFileParser | null {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return (
    FILE_PARSERS.find((parser) => parser.extensions.includes(extension)) ??
    null
  );
}
