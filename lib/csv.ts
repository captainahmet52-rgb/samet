function safeCell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function csvOlustur(headers: string[], rows: Array<Array<string | number>>) {
  return `\uFEFF${[headers, ...rows].map(row => row.map(safeCell).join(";")).join("\r\n")}`;
}
