export type CsvValue = string | number | boolean | undefined;

const spreadsheetFormulaPrefix = /^[\t\r\n ]*[=+\-@]/;

export function csvCell(value: CsvValue): string {
  let text = value === undefined ? "" : String(value);
  if (spreadsheetFormulaPrefix.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function csvLine(values: CsvValue[]): string {
  return values.map(csvCell).join(",");
}

export function createCsvObjectUrl(csv: string): string {
  return URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
}
