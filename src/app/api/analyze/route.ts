import { NextRequest, NextResponse } from 'next/server';
import { parseFile, extractNumbers } from '@/lib/parse-file';
import { analyzeBenford } from '@/lib/benford';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // ─── Mode 1: File upload via FormData ───
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const column = formData.get('column') as string | null;
      const sheet = formData.get('sheet') as string | null;

      if (!file) {
        return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
      }

      // Size limit: 10 MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Fichier trop volumineux (max 10 Mo)' },
          { status: 400 }
        );
      }

      const ext = file.name.toLowerCase().split('.').pop() || '';
      let fileContent: string | ArrayBuffer;

      if (ext === 'xlsx' || ext === 'xls') {
        fileContent = await file.arrayBuffer();
      } else {
        fileContent = await file.text();
      }

      const parsed = await parseFile(fileContent, file.name, sheet || undefined);

      // If no column specified, return preview + columns for selection
      if (!column) {
        return NextResponse.json({
          step: 'preview',
          columns: parsed.columns,
          numericColumns: parsed.numericColumns,
          preview: parsed.preview,
          headers: parsed.headers,
          sheets: parsed.sheets,
          stats: parsed.stats,
        });
      }

      // Column specified — run Benford analysis
      const numbers = extractNumbers(parsed.data, column);

      if (numbers.length < 10) {
        return NextResponse.json(
          { error: `Pas assez de valeurs numériques dans "${column}" (${numbers.length} trouvées, minimum 10)` },
          { status: 400 }
        );
      }

      const result = analyzeBenford(numbers);

      return NextResponse.json({
        step: 'result',
        analysis: result,
        columnName: column,
        stats: parsed.stats,
      });
    }

    // ─── Mode 2: JSON body (re-analyze with different column) ───
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { data, column, fileName, sheet } = body;

      if (data && column) {
        // Data already parsed, just run Benford
        const numbers = extractNumbers(data, column);

        if (numbers.length < 10) {
          return NextResponse.json(
            { error: `Pas assez de valeurs numériques (${numbers.length} trouvées, minimum 10)` },
            { status: 400 }
          );
        }

        const result = analyzeBenford(numbers);
        return NextResponse.json({
          step: 'result',
          analysis: result,
          columnName: column,
        });
      }

      // Raw content string passed (from URL fetch)
      if (body.content && body.fileName) {
        const parsed = await parseFile(body.content, body.fileName, sheet);

        if (!column) {
          return NextResponse.json({
            step: 'preview',
            columns: parsed.columns,
            numericColumns: parsed.numericColumns,
            preview: parsed.preview,
            headers: parsed.headers,
            sheets: parsed.sheets,
            stats: parsed.stats,
            data: parsed.data,
          });
        }
      }

      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Content-Type non supporté' }, { status: 400 });
  } catch (error) {
    console.error('Analyze API error:', error);
    const message = error instanceof Error ? error.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
