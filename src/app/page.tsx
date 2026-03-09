'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import DataPreview from '@/components/DataPreview';
import BenfordChart from '@/components/BenfordChart';
import ResultCard from '@/components/ResultCard';
import LegalModal from '@/components/LegalModal';
import HowItWorksModal from '@/components/HowItWorksModal';
import type { ColumnInfo } from '@/lib/parse-file';
import type { BenfordResult } from '@/lib/benford';

type AppState = 'idle' | 'loading' | 'preview' | 'analyzing' | 'result';

interface PreviewData {
  headers: string[];
  preview: string[][];
  columns: ColumnInfo[];
  numericColumns: string[];
  stats: {
    totalRows: number;
    duplicatesRemoved: number;
    emptyRowsRemoved: number;
    format: string;
  };
  sheets?: string[];
  data?: Record<string, unknown>[];
}

interface ResultData {
  analysis: BenfordResult;
  columnName: string;
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<AppState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);

  // Auto-import from URL param (?url=...)
  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      handleUrlImport(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setState('loading');
    setSelectedColumn(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur serveur');

      setPreviewData(data);
      setState('preview');

      // Auto-select if only one numeric column
      if (data.numericColumns.length === 1) {
        setSelectedColumn(data.numericColumns[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
      setState('idle');
    }
  };

  const handleUrlImport = async (url: string) => {
    setError(null);
    setState('loading');
    setSelectedColumn(null);
    setFile(null);

    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur serveur');

      setPreviewData(data);
      setState('preview');

      if (data.numericColumns.length === 1) {
        setSelectedColumn(data.numericColumns[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
      setState('idle');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedColumn) return;
    setError(null);
    setState('analyzing');

    try {
      let res: Response;

      if (previewData?.data) {
        // Data already in memory (from URL import)
        res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: previewData.data, column: selectedColumn }),
        });
      } else if (file) {
        // Re-upload file with column selection
        const formData = new FormData();
        formData.append('file', file);
        formData.append('column', selectedColumn);
        res = await fetch('/api/analyze', { method: 'POST', body: formData });
      } else {
        throw new Error('Aucun fichier ou données disponibles');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');

      setResultData({ analysis: data.analysis, columnName: selectedColumn });
      setState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
      setState('preview');
    }
  };

  const handleReset = () => {
    setState('idle');
    setFile(null);
    setPreviewData(null);
    setSelectedColumn(null);
    setResultData(null);
    setError(null);
  };

  return (
    <main className="flex flex-col min-h-screen bg-[var(--bg)]">
      <Header />
      <HowItWorksModal />

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-10">
        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-4 p-3 rounded-xl bg-[rgba(237,41,57,0.05)] border border-[rgba(237,41,57,0.15)] text-sm text-[var(--french-red)] animate-fade-in-up">
            {error}
          </div>
        )}

        {/* State: idle or loading */}
        {(state === 'idle' || state === 'loading') && (
          <FileUpload
            onFileSelected={handleFileSelected}
            onUrlSubmit={handleUrlImport}
            loading={state === 'loading'}
          />
        )}

        {/* State: preview */}
        {state === 'preview' && previewData && (
          <>
            <DataPreview
              headers={previewData.headers}
              preview={previewData.preview}
              columns={previewData.columns}
              numericColumns={previewData.numericColumns}
              selectedColumn={selectedColumn}
              onSelectColumn={setSelectedColumn}
              stats={previewData.stats}
              sheets={previewData.sheets}
            />

            {/* Action buttons */}
            <div className="max-w-4xl mx-auto mt-6 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                &larr; Nouveau fichier
              </button>

              <button
                onClick={handleAnalyze}
                disabled={!selectedColumn}
                className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Lancer l&apos;analyse Benford
              </button>
            </div>
          </>
        )}

        {/* State: analyzing */}
        {state === 'analyzing' && (
          <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in-up">
            <div className="w-12 h-12 mx-auto mb-4 border-3 border-[var(--french-blue)] border-t-transparent rounded-full animate-spin-slow" />
            <p className="text-sm text-[var(--text-secondary)]">
              Analyse de la distribution des premiers chiffres...
            </p>
          </div>
        )}

        {/* State: result */}
        {state === 'result' && resultData && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Column name header */}
            <div className="text-center animate-fade-in-up">
              <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium mb-1">
                Analyse Benford
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold gradient-text">
                {resultData.columnName}
              </h2>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {resultData.analysis.totalNumbers.toLocaleString('fr-FR')} valeurs analys&eacute;es
                {resultData.analysis.excludedCount > 0 && (
                  <span> &middot; {resultData.analysis.excludedCount} exclues</span>
                )}
              </p>
            </div>
            <BenfordChart result={resultData.analysis} />
            <ResultCard result={resultData.analysis} columnName={resultData.columnName} />

            {/* Actions */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {previewData && previewData.numericColumns.length > 1 && (
                <button
                  onClick={() => {
                    setState('preview');
                    setResultData(null);
                    setSelectedColumn(null);
                  }}
                  className="text-xs text-[var(--french-blue)] hover:underline"
                >
                  Tester une autre colonne
                </button>
              )}
              <button
                onClick={handleReset}
                className="btn-primary px-5 py-2 text-sm"
              >
                Nouvelle analyse
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-white border-t border-[var(--border)] px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-0">
          <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
            <span className="text-[10px] text-[var(--text-tertiary)] tracking-wide">
              Propuls&eacute; par{' '}
              <span className="font-medium text-[var(--text-secondary)]">Alexis</span>
              {', '}
              <span className="font-medium text-[var(--text-secondary)]">Mistral AI</span>
              {' & '}
              <span className="font-medium text-[var(--text-secondary)]">Data.gouv</span>
            </span>
            <span className="text-[var(--border)]">&middot;</span>
            <LegalModal />
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <a
              href="https://www.linkedin.com/in/alexishessler/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-tertiary)] hover:text-[#0A66C2] transition-colors"
              title="LinkedIn"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="https://www.arte.tv/fr/videos/097454-002-A/voyages-au-pays-des-maths/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--french-red)] transition-colors"
            >
              Documentaire Arte &rarr;
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
