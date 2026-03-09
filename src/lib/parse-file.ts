/**
 * Robust file parser — handles CSV, XLSX, XLS, JSON, TXT
 * with automatic delimiter detection, FR/EN number formats,
 * deduplication, and numeric column detection.
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ColumnInfo {
  name: string;
  type: 'number' | 'string' | 'date' | 'mixed';
  validCount: number;
  totalCount: number;
  sampleValues: string[];
}

export interface ParseResult {
  columns: ColumnInfo[];
  data: Record<string, unknown>[];
  numericColumns: string[];
  preview: string[][];
  headers: string[];
  sheets?: string[];
  stats: {
    totalRows: number;
    duplicatesRemoved: number;
    emptyRowsRemoved: number;
    format: string;
  };
}

/** Clean a string value that might be a French or English formatted number */
function cleanNumber(val: unknown): number | null {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (val === null || val === undefined || val === '') return null;

  let str = String(val).trim();

  // Remove currency and percentage symbols
  str = str.replace(/[€$£%\u00a0]/g, '').trim();

  // Remove leading/trailing quotes
  str = str.replace(/^["']|["']$/g, '');

  if (str === '' || str === '-' || str === 'N/A' || str === 'n/a') return null;

  // Detect FR format: "1 234,56" or "1.234,56"
  // vs EN format: "1,234.56"
  const hasCommaDecimal = /\d,\d{1,2}$/.test(str);
  const hasDotDecimal = /\d\.\d{1,2}$/.test(str);

  if (hasCommaDecimal && !hasDotDecimal) {
    // French format: spaces/dots as thousands, comma as decimal
    str = str.replace(/[\s.]/g, '').replace(',', '.');
  } else if (hasDotDecimal && !hasCommaDecimal) {
    // English format: commas as thousands
    str = str.replace(/,/g, '');
  } else {
    // Ambiguous or no decimal — remove spaces, try as-is
    str = str.replace(/\s/g, '');
    // If has both comma and dot, treat last one as decimal
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
      str = str.replace(/,/g, '');
    }
  }

  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

/** Check if a row is entirely empty */
function isEmptyRow(row: Record<string, unknown>): boolean {
  return Object.values(row).every(
    v => v === null || v === undefined || String(v).trim() === ''
  );
}

/** Hash a row for deduplication */
function hashRow(row: Record<string, unknown>): string {
  return Object.values(row)
    .map(v => String(v ?? ''))
    .join('|');
}

/** Flatten nested JSON objects */
function flattenObject(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      Object.assign(
        result,
        flattenObject(value as Record<string, unknown>, newKey)
      );
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

/** Detect column types */
function analyzeColumns(
  data: Record<string, unknown>[],
  headers: string[]
): ColumnInfo[] {
  return headers.map(name => {
    let numCount = 0;
    let strCount = 0;
    let dateCount = 0;
    const samples: string[] = [];
    let total = 0;

    for (const row of data) {
      const val = row[name];
      if (val === null || val === undefined || String(val).trim() === '') continue;
      total++;

      if (samples.length < 5) samples.push(String(val));

      if (cleanNumber(val) !== null) {
        numCount++;
      } else if (!isNaN(Date.parse(String(val))) && String(val).length > 5) {
        dateCount++;
      } else {
        strCount++;
      }
    }

    let type: ColumnInfo['type'];
    if (total === 0) {
      type = 'string';
    } else if (numCount / total > 0.5) {
      type = 'number';
    } else if (dateCount / total > 0.5) {
      type = 'date';
    } else if (numCount > 0 && strCount > 0) {
      type = 'mixed';
    } else {
      type = 'string';
    }

    return {
      name,
      type,
      validCount: type === 'number' ? numCount : total,
      totalCount: total,
      sampleValues: samples,
    };
  });
}

/** Parse CSV or TXT content */
function parseCSV(content: string, fileName: string): { data: Record<string, unknown>[]; headers: string[]; format: string } {
  // Try papaparse with auto-detection
  let result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // We handle number parsing ourselves
  });

  let format = 'CSV';

  // If we got only 1 column, try other delimiters
  if (result.meta.fields && result.meta.fields.length <= 1) {
    for (const delimiter of ['\t', ';', '|', ' ']) {
      const retry = Papa.parse<Record<string, string>>(content, {
        header: true,
        skipEmptyLines: true,
        delimiter,
        dynamicTyping: false,
      });
      if (retry.meta.fields && retry.meta.fields.length > 1) {
        result = retry;
        const delName = delimiter === '\t' ? 'TAB' : delimiter === ' ' ? 'SPACE' : delimiter;
        format = `CSV (${delName})`;
        break;
      }
    }
  } else if (result.meta.delimiter) {
    const d = result.meta.delimiter;
    if (d !== ',') {
      const delName = d === '\t' ? 'TAB' : d;
      format = `CSV (${delName})`;
    }
  }

  if (fileName.endsWith('.txt')) format = `TXT (${format})`;

  const headers = result.meta.fields || [];
  const data = result.data as Record<string, unknown>[];

  return { data, headers, format };
}

/** Parse XLSX/XLS buffer */
function parseExcel(buffer: ArrayBuffer, sheetName?: string): {
  data: Record<string, unknown>[];
  headers: string[];
  sheets: string[];
  format: string;
} {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheets = workbook.SheetNames;
  const targetSheet = sheetName || sheets[0];
  const sheet = workbook.Sheets[targetSheet];

  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    raw: false,
    defval: '',
  });

  const headers =
    jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  return {
    data: jsonData,
    headers,
    sheets,
    format: `XLSX${sheets.length > 1 ? ` (${targetSheet})` : ''}`,
  };
}

/** Parse JSON content */
function parseJSON(content: string): {
  data: Record<string, unknown>[];
  headers: string[];
  format: string;
} {
  const parsed = JSON.parse(content);

  let records: Record<string, unknown>[];

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return { data: [], headers: [], format: 'JSON (vide)' };
    }
    if (typeof parsed[0] === 'object' && parsed[0] !== null) {
      // Array of objects — flatten if nested
      records = parsed.map(item => flattenObject(item as Record<string, unknown>));
    } else {
      // Array of primitives
      records = parsed.map(v => ({ value: v }));
    }
  } else if (typeof parsed === 'object' && parsed !== null) {
    // Single object with arrays as values
    const keys = Object.keys(parsed);
    const firstVal = parsed[keys[0]];
    if (Array.isArray(firstVal)) {
      // Columnar format: { col1: [...], col2: [...] }
      const len = firstVal.length;
      records = Array.from({ length: len }, (_, i) => {
        const row: Record<string, unknown> = {};
        for (const key of keys) {
          row[key] = Array.isArray(parsed[key]) ? parsed[key][i] : parsed[key];
        }
        return row;
      });
    } else {
      // Single flat object
      records = [flattenObject(parsed)];
    }
  } else {
    throw new Error('Format JSON non supporté');
  }

  const headers = records.length > 0 ? Object.keys(records[0]) : [];
  return { data: records, headers, format: 'JSON' };
}

/** Main parse function */
export async function parseFile(
  fileContent: string | ArrayBuffer,
  fileName: string,
  sheetName?: string
): Promise<ParseResult> {
  const ext = fileName.toLowerCase().split('.').pop() || '';

  let data: Record<string, unknown>[];
  let headers: string[];
  let format: string;
  let sheets: string[] | undefined;

  // Parse based on extension
  if (ext === 'xlsx' || ext === 'xls') {
    const buf =
      typeof fileContent === 'string'
        ? new TextEncoder().encode(fileContent).buffer
        : fileContent;
    const result = parseExcel(buf as ArrayBuffer, sheetName);
    data = result.data;
    headers = result.headers;
    format = result.format;
    sheets = result.sheets.length > 1 ? result.sheets : undefined;
  } else if (ext === 'json') {
    const content =
      typeof fileContent === 'string'
        ? fileContent
        : new TextDecoder('utf-8').decode(fileContent as ArrayBuffer);
    const result = parseJSON(content);
    data = result.data;
    headers = result.headers;
    format = result.format;
  } else {
    // CSV, TXT, or any text format
    const content =
      typeof fileContent === 'string'
        ? fileContent
        : new TextDecoder('utf-8').decode(fileContent as ArrayBuffer);
    const result = parseCSV(content, fileName);
    data = result.data;
    headers = result.headers;
    format = result.format;
  }

  // ─── Cleaning ───
  const totalBeforeCleaning = data.length;

  // Remove empty rows
  const beforeEmpty = data.length;
  data = data.filter(row => !isEmptyRow(row));
  const emptyRowsRemoved = beforeEmpty - data.length;

  // Deduplicate
  const seen = new Set<string>();
  const deduped: Record<string, unknown>[] = [];
  for (const row of data) {
    const h = hashRow(row);
    if (!seen.has(h)) {
      seen.add(h);
      deduped.push(row);
    }
  }
  const duplicatesRemoved = data.length - deduped.length;
  data = deduped;

  // ─── Analyze columns ───
  const columns = analyzeColumns(data, headers);
  const numericColumns = columns
    .filter(c => c.type === 'number')
    .map(c => c.name);

  // ─── Preview (first 8 rows) ───
  const previewRows = data.slice(0, 8);
  const preview = previewRows.map(row =>
    headers.map(h => String(row[h] ?? ''))
  );

  return {
    columns,
    data,
    numericColumns,
    preview,
    headers,
    sheets,
    stats: {
      totalRows: data.length,
      duplicatesRemoved,
      emptyRowsRemoved,
      format,
    },
  };
}

/** Extract numeric values from a specific column */
export function extractNumbers(
  data: Record<string, unknown>[],
  columnName: string
): number[] {
  const numbers: number[] = [];
  for (const row of data) {
    const num = cleanNumber(row[columnName]);
    if (num !== null) numbers.push(num);
  }
  return numbers;
}
