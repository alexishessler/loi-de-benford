import { NextRequest, NextResponse } from 'next/server';
import { parseFile, extractNumbers } from '@/lib/parse-file';
import { analyzeBenford } from '@/lib/benford';

const ALLOWED_HOSTS = [
  'data.gouv.fr',
  'static.data.gouv.fr',
  'www.data.gouv.fr',
  'files.data.gouv.fr',
  'object.files.data.gouv.fr',
];

export async function POST(req: NextRequest) {
  try {
    const { url, column } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
    }

    // Validate URL host
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    const isAllowed = ALLOWED_HOSTS.some(
      h => parsedUrl.hostname === h || parsedUrl.hostname.endsWith('.' + h)
    );
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Seules les URLs de data.gouv.fr sont autorisées' },
        { status: 403 }
      );
    }

    // Download file (10 MB limit)
    const response = await fetch(url, {
      headers: { 'User-Agent': 'LoiBenford/1.0' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur lors du téléchargement (${response.status})` },
        { status: 502 }
      );
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10 Mo)' },
        { status: 400 }
      );
    }

    // Guess filename from URL
    const pathParts = parsedUrl.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1] || 'data.csv';

    const ext = fileName.toLowerCase().split('.').pop() || 'csv';
    let fileContent: string | ArrayBuffer;

    if (ext === 'xlsx' || ext === 'xls') {
      fileContent = await response.arrayBuffer();
    } else {
      fileContent = await response.text();
    }

    const parsed = await parseFile(fileContent, fileName);

    if (!column) {
      return NextResponse.json({
        step: 'preview',
        columns: parsed.columns,
        numericColumns: parsed.numericColumns,
        preview: parsed.preview,
        headers: parsed.headers,
        stats: parsed.stats,
        data: parsed.data.slice(0, 50000), // Limit data sent to client
        fileName,
      });
    }

    // Run Benford analysis
    const numbers = extractNumbers(parsed.data, column);

    if (numbers.length < 10) {
      return NextResponse.json(
        { error: `Pas assez de valeurs numériques dans "${column}" (${numbers.length})` },
        { status: 400 }
      );
    }

    const result = analyzeBenford(numbers);

    return NextResponse.json({
      step: 'result',
      analysis: result,
      columnName: column,
      stats: parsed.stats,
      fileName,
    });
  } catch (error) {
    console.error('Fetch-URL API error:', error);
    const message = error instanceof Error ? error.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
