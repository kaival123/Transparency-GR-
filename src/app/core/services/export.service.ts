import { DOCUMENT, Injectable, inject } from '@angular/core';

export interface ExportColumn<T> {
  field: keyof T & string;
  header: string;
}

/**
 * Exports AGGREGATE data only (scheme directory).
 * Must never be used for beneficiary-level records — spec §7 forbids bulk download.
 */
@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly document = inject(DOCUMENT);

  /** CSV with UTF-8 BOM so Excel opens it with the right encoding. */
  toCsv<T>(rows: readonly T[], columns: readonly ExportColumn<T>[], fileName: string): void {
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      columns.map((c) => escape(c.header)).join(','),
      ...rows.map((row) => columns.map((c) => escape(row[c.field])).join(','))
    ];
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = this.document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Opens a print-ready view; the user picks "Save as PDF". Returns false if pop-ups are blocked. */
  toPrint<T>(rows: readonly T[], columns: readonly ExportColumn<T>[], title: string, lang = 'en'): boolean {
    const win = this.document.defaultView?.open('', '_blank');
    if (!win) return false;
    const esc = (v: unknown) =>
      String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
    const head = columns.map((c) => `<th>${esc(c.header)}</th>`).join('');
    const body = rows.map((r) => `<tr>${columns.map((c) => `<td>${esc(r[c.field])}</td>`).join('')}</tr>`).join('');
    win.document.write(`<!doctype html><html lang="${esc(lang)}"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      body{font-family:Inter,'Noto Sans Devanagari','Nirmala UI',Mangal,Arial,sans-serif;padding:24px;color:#111}h1{font-size:18px}
      table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      th{background:#f3f4f6}</style></head><body><h1>${esc(title)}</h1>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`);
    win.document.close();
    win.focus();
    win.print();
    return true;
  }
}
