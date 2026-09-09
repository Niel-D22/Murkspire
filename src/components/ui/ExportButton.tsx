import { FC, useState } from 'react';
import { Check, Download, Share2 } from 'lucide-react';

interface ExportButtonProps {
  /* `object` rather than Record<string, unknown>: the pages pass interface
     types, and interfaces have no index signature, so the stricter shape
     would reject every real caller. */
  data: readonly object[];
  filename: string;
  format?: 'csv' | 'json';
  className?: string;
}

/** RFC 4180: wrap in quotes when the value contains a comma, quote or newline,
 *  and double any embedded quotes. The previous version only handled commas,
 *  so a description containing a quote produced a broken file. */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCSV(input: readonly object[]): string {
  const rows = input as ReadonlyArray<Record<string, unknown>>;
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) => headers.map((h) => csvCell(row[h])).join(','));
  return [headers.map(csvCell).join(','), ...lines].join('\r\n');
}

export const ExportButton: FC<ExportButtonProps> = ({
  data,
  filename,
  format = 'csv',
  className = '',
}) => {
  const [done, setDone] = useState(false);

  const isEmpty = data.length === 0;

  const build = () =>
    format === 'csv'
      ? { body: toCSV(data), name: `${filename}.csv`, type: 'text/csv;charset=utf-8' }
      : {
          body: JSON.stringify(data, null, 2),
          name: `${filename}.json`,
          type: 'application/json;charset=utf-8',
        };

  const flash = () => {
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };

  const handleExport = async () => {
    if (isEmpty) return;
    const { body, name, type } = build();
    const file = new File([body], name, { type });

    /* Phones first.
       iOS Safari ignores the `download` attribute on blob URLs, so the old
       anchor trick either did nothing or opened raw JSON in the tab. The Web
       Share API is the supported path there and opens the real share sheet,
       which includes "Save to Files". */
    if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name });
        flash();
        return;
      } catch (error) {
        // A user cancelling the sheet is not a failure worth falling through for.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    // Desktop, and mobile browsers without file sharing.
    const url = URL.createObjectURL(new Blob([body], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    /* The old code revoked this immediately after click(). The download is
       asynchronous, so on mobile the URL was dead before the browser had read
       it — the button appeared to do nothing at all. */
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    flash();
  };

  const canShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [new File([''], 'probe.txt', { type: 'text/plain' })] });

  const Icon = done ? Check : canShare ? Share2 : Download;

  return (
    <button
      onClick={handleExport}
      disabled={isEmpty}
      title={isEmpty ? 'Nothing to export yet' : `Export ${data.length} rows`}
      className={`inline-flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-2 text-xs font-medium text-bone transition-colors hover:border-spire/45 hover:bg-spire/[0.08] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/[0.09] disabled:hover:bg-white/[0.03] ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${done ? 'text-spire' : ''}`} />
      <span>{done ? 'Exported' : `Export ${format.toUpperCase()}`}</span>
    </button>
  );
};
