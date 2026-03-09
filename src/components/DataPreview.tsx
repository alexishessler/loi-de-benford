'use client';

import type { ColumnInfo } from '@/lib/parse-file';

type Props = {
  headers: string[];
  preview: string[][];
  columns: ColumnInfo[];
  numericColumns: string[];
  selectedColumn: string | null;
  onSelectColumn: (col: string) => void;
  stats: {
    totalRows: number;
    duplicatesRemoved: number;
    emptyRowsRemoved: number;
    format: string;
  };
  sheets?: string[];
  onSelectSheet?: (sheet: string) => void;
};

/** Highlight the first significant digit in a numeric string */
function highlightFirstDigit(value: string): JSX.Element {
  const trimmed = value.trim().replace(/^[-+]/, '');
  // Find first non-zero digit
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch >= '1' && ch <= '9') {
      const prefix = value.slice(0, value.indexOf(ch));
      const rest = value.slice(value.indexOf(ch) + 1);
      return (
        <>
          {prefix}
          <span className="first-digit">{ch}</span>
          {rest}
        </>
      );
    }
  }
  return <>{value}</>;
}

export default function DataPreview({
  headers,
  preview,
  columns,
  numericColumns,
  selectedColumn,
  onSelectColumn,
  stats,
  sheets,
  onSelectSheet,
}: Props) {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-5">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
        <span className="badge badge-blue">{stats.format}</span>
        <span>{stats.totalRows.toLocaleString('fr-FR')} lignes</span>
        {stats.duplicatesRemoved > 0 && (
          <span className="text-[var(--text-tertiary)]">
            &middot; {stats.duplicatesRemoved} doublon{stats.duplicatesRemoved > 1 ? 's' : ''} supprim&eacute;{stats.duplicatesRemoved > 1 ? 's' : ''}
          </span>
        )}
        {stats.emptyRowsRemoved > 0 && (
          <span className="text-[var(--text-tertiary)]">
            &middot; {stats.emptyRowsRemoved} ligne{stats.emptyRowsRemoved > 1 ? 's' : ''} vide{stats.emptyRowsRemoved > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Sheet selector (XLSX multi-sheets) */}
      {sheets && sheets.length > 1 && onSelectSheet && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--text-secondary)]">Feuille :</span>
          <div className="flex gap-1.5 flex-wrap">
            {sheets.map(s => (
              <button
                key={s}
                onClick={() => onSelectSheet(s)}
                className="badge badge-blue cursor-pointer hover:opacity-80 transition-opacity"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Data table preview */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map(h => (
                  <th
                    key={h}
                    className={selectedColumn === h ? 'bg-[rgba(0,35,149,0.1)]' : ''}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => {
                    const colName = headers[j];
                    const isSelected = selectedColumn === colName;
                    const isNumeric = numericColumns.includes(colName);
                    return (
                      <td
                        key={j}
                        className={`${isSelected ? 'highlight' : ''} ${
                          isNumeric && !isSelected ? 'text-[var(--text-secondary)]' : ''
                        }`}
                      >
                        {isSelected ? highlightFirstDigit(cell) : cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stats.totalRows > 8 && (
          <div className="text-center py-2 text-[10px] text-[var(--text-tertiary)] bg-[var(--bg)]">
            {stats.totalRows - 8} lignes suppl&eacute;mentaires non affich&eacute;es
          </div>
        )}
      </div>

      {/* Column selector */}
      <div>
        <p className="text-sm font-medium text-[var(--text)] mb-3">
          S&eacute;lectionnez la colonne &agrave; analyser
        </p>
        {numericColumns.length === 0 ? (
          <div className="card p-4 text-center">
            <p className="text-sm text-[var(--french-red)]">
              Aucune colonne num&eacute;rique d&eacute;tect&eacute;e dans ce fichier.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {numericColumns.map(col => {
              const info = columns.find(c => c.name === col);
              const isSelected = selectedColumn === col;
              return (
                <button
                  key={col}
                  onClick={() => onSelectColumn(col)}
                  className={`col-card text-left ${isSelected ? 'selected' : ''}`}
                >
                  <p className="text-sm font-medium text-[var(--text)] truncate">
                    {col}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    {info ? `${info.validCount.toLocaleString('fr-FR')} valeurs` : ''}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
