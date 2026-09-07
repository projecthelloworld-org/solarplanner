import { describe, expect, it } from "vitest";
import { csvCell, csvLine } from "./csv";

describe("CSV serialization", () => {
  it("quotes delimiters and spreadsheet formulas safely", () => {
    expect(csvCell('Router, "primary"')).toBe('"Router, ""primary"""');
    expect(csvCell("=2+2")).toBe('"\'=2+2"');
    expect(csvCell("  @SUM(A1:A2)")).toBe('"\'  @SUM(A1:A2)"');
    expect(csvLine(["Name", 2])).toBe('"Name","2"');
  });
});
