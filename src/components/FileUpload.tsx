'use client';

import { useState, useRef, type DragEvent } from 'react';

const ARTE_URL = 'https://www.arte.tv/fr/videos/097454-002-A/voyages-au-pays-des-maths/';
const ACCEPTED = '.csv,.txt,.xlsx,.xls,.json,.tsv';
const MAX_FILE_SIZE_MB = 20;

const REAL_EXAMPLES = [
  {
    icon: '🏘️',
    label: 'Populations communes',
    description: '35 000 communes de France',
    source: 'data.gouv.fr',
    url: 'https://static.data.gouv.fr/resources/communes-et-villes-de-france-en-csv-excel-json-parquet-et-feather/20250221-162232/communes-france-2025.csv',
    color: 'var(--french-blue)',
    bg: 'rgba(0, 35, 149, 0.05)',
    border: 'rgba(0, 35, 149, 0.12)',
  },
  {
    icon: '🗳️',
    label: 'Présidentielle 2022',
    description: 'Votes 1er tour par département',
    source: 'data.gouv.fr',
    url: 'https://static.data.gouv.fr/resources/resultats-du-premier-tour-de-lelection-presidentielle-2022-par-commune-et-par-departement/20220413-153225/03-resultats-par-departement.csv',
    color: 'var(--french-red)',
    bg: 'rgba(237, 41, 57, 0.04)',
    border: 'rgba(237, 41, 57, 0.12)',
  },
];

const NON_CONFORMING_EXAMPLES: {
  icon: string;
  label: string;
  description: string;
  source: string;
  url?: string;
  localPath?: string;
  badge: string;
  isLocal: boolean;
}[] = [
  {
    icon: '⚔️',
    label: 'Pertes guerre Ukraine',
    description: '570 estimations de pertes — chiffres arrondis par les officiels',
    source: 'The Economist / GitHub',
    url: 'https://raw.githubusercontent.com/TheEconomist/the-economist-ukraine-war-dead-and-wounded-estimates/main/output-data/tracker/raw_estimates.csv',
    badge: 'écarts notables',
    isLocal: false,
  },
  {
    icon: '🔍',
    label: 'Notes de frais suspectes',
    description: '10 000 remboursements — dirigeant en enquête comptable',
    source: 'fichier fictif',
    localPath: '/exemple-suspect.csv',
    badge: 'non conforme !',
    isLocal: true,
  },
];

type Props = {
  onFileSelected: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  loading: boolean;
};

export default function FileUpload({ onFileSelected, onUrlSubmit, loading }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState('');
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : ${MAX_FILE_SIZE_MB} Mo.`);
        return;
      }
      onFileSelected(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : ${MAX_FILE_SIZE_MB} Mo.`);
        return;
      }
      onFileSelected(file);
    }
  };

  const handleRealExample = (ex: typeof REAL_EXAMPLES[0]) => {
    if (loading) return;
    setLoadingLabel(ex.label);
    onUrlSubmit(ex.url);
  };

  const handleNonConformingExample = async (ex: typeof NON_CONFORMING_EXAMPLES[0]) => {
    if (loading) return;
    setLoadingLabel(ex.label);
    if (ex.isLocal && ex.localPath) {
      try {
        const res = await fetch(ex.localPath);
        const blob = await res.blob();
        const file = new File([blob], 'remboursements-suspects.csv', { type: 'text/csv' });
        onFileSelected(file);
      } catch {
        setLoadingLabel(null);
      }
    } else if (ex.url) {
      onUrlSubmit(ex.url);
    }
  };

  const renderSpinner = () => (
    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin-slow inline-block" />
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      {/* Hero image — Benford portrait from Arte */}
      <a
        href={ARTE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-6 group"
      >
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
          <img
            src="/benford-portrait.png"
            alt="Frank Benford — Voyages au pays des maths, Arte"
            className="w-full h-44 sm:h-52 object-contain bg-black rounded-2xl transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
            <div>
              <p className="text-white font-bold text-sm sm:text-base">
                Frank Benford (1883-1948)
              </p>
              <p className="text-white/70 text-[11px]">
                Voyages au pays des maths &middot; Arte.tv
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium group-hover:bg-white/30 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Voir le docu
            </div>
          </div>
        </div>
      </a>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold gradient-text mb-2">
          Testez la loi de Benford
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Chargez un fichier de donn&eacute;es et d&eacute;couvrez si vos chiffres suivent
          la distribution naturelle des premiers chiffres significatifs.
        </p>
      </div>

      {/* ─── Section 1: Example datasets ─── */}
      <div className="mb-8">
        <p className="text-[11px] text-[var(--text-tertiary)] text-center mb-3 uppercase tracking-wider font-medium">
          Essayez avec des donn&eacute;es r&eacute;elles
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Conforming examples */}
          {REAL_EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => handleRealExample(ex)}
              disabled={loading}
              className="text-left rounded-xl px-4 py-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex flex-col"
              style={{ background: ex.bg, border: `1px solid ${ex.border}` }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg shrink-0">{ex.icon}</span>
                <span className="text-[13px] font-bold leading-tight" style={{ color: ex.color }}>
                  {loadingLabel === ex.label && loading ? (
                    <span className="flex items-center gap-1.5">{renderSpinner()} Chargement...</span>
                  ) : ex.label}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-snug mt-auto">{ex.description}</p>
            </button>
          ))}

          {/* Non-conforming examples */}
          {NON_CONFORMING_EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => handleNonConformingExample(ex)}
              disabled={loading}
              className="text-left rounded-xl px-4 pt-7 pb-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 relative overflow-hidden ring-2 ring-[var(--orange)]/30 flex flex-col"
              style={{ background: 'rgba(217, 119, 6, 0.08)', border: '1.5px solid rgba(217, 119, 6, 0.3)' }}
            >
              <span className="absolute top-0 right-0 bg-[var(--orange)] text-white text-[8px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-bl-lg">
                {ex.badge}
              </span>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg shrink-0">{ex.icon}</span>
                <span className="text-[13px] font-bold leading-tight" style={{ color: 'var(--orange)' }}>
                  {loadingLabel === ex.label && loading ? (
                    <span className="flex items-center gap-1.5">{renderSpinner()} Chargement...</span>
                  ) : ex.label}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-snug mt-auto">
                {ex.description}
                <br />
                <span className="text-[9px] opacity-70">Source : {ex.source}</span>
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Section 2: Your own data ─── */}
      <div>
        <p className="text-[11px] text-[var(--text-tertiary)] text-center mb-3 uppercase tracking-wider font-medium">
          Essayez avec vos propres jeux de donn&eacute;es
        </p>

        {!urlMode ? (
          <>
            <div
              className={`upload-zone p-8 sm:p-10 text-center ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFileChange}
                className="hidden"
              />

              {loading && !loadingLabel ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-[var(--french-blue)] border-t-transparent rounded-full animate-spin-slow" />
                  <p className="text-sm text-[var(--text-secondary)]">Analyse en cours...</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[var(--bg-warm)] flex items-center justify-center text-xl">
                    📂
                  </div>
                  <p className="text-sm font-medium text-[var(--text)] mb-1">
                    Glissez votre fichier ici
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mb-3">
                    ou cliquez pour parcourir
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                    {['CSV', 'XLSX', 'XLS', 'JSON', 'TXT'].map(ext => (
                      <span key={ext} className="badge badge-blue">{ext}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    Maximum {MAX_FILE_SIZE_MB} Mo
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setUrlMode(true)}
              className="mt-3 mx-auto block text-xs text-[var(--text-tertiary)] hover:text-[var(--french-blue)] transition-colors"
            >
              Ou importer depuis une URL (data.gouv.fr, GitHub...)
            </button>
          </>
        ) : (
          <div className="card p-4">
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block">
              URL du fichier (data.gouv.fr, GitHub)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://static.data.gouv.fr/..."
                className="flex-1 bg-[var(--bg)] rounded-lg px-3 py-2 text-sm text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-[var(--french-blue)] transition-colors"
              />
              <button
                onClick={() => url.trim() && onUrlSubmit(url.trim())}
                disabled={loading || !url.trim()}
                className="btn-primary px-4 py-2 text-sm"
              >
                {loading ? '...' : 'Importer'}
              </button>
            </div>
            <button
              onClick={() => { setUrlMode(false); setUrl(''); }}
              className="mt-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              &larr; Revenir au drag &amp; drop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
