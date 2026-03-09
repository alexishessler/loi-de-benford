'use client';

import { useState, useRef, type DragEvent } from 'react';

const ARTE_URL = 'https://www.arte.tv/fr/videos/097454-002-A/voyages-au-pays-des-maths/';
const ACCEPTED = '.csv,.txt,.xlsx,.xls,.json,.tsv';

type Props = {
  onFileSelected: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  loading: boolean;
};

export default function FileUpload({ onFileSelected, onUrlSubmit, loading }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelected(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

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

      {/* Upload zone / URL toggle */}
      {!urlMode ? (
        <>
          <div
            className={`upload-zone p-8 sm:p-12 text-center ${dragOver ? 'drag-over' : ''}`}
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

            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-[var(--french-blue)] border-t-transparent rounded-full animate-spin-slow" />
                <p className="text-sm text-[var(--text-secondary)]">Analyse en cours...</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--bg-warm)] flex items-center justify-center text-2xl">
                  📂
                </div>
                <p className="text-sm font-medium text-[var(--text)] mb-1">
                  Glissez votre fichier ici
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mb-3">
                  ou cliquez pour parcourir
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {['CSV', 'XLSX', 'XLS', 'JSON', 'TXT'].map(ext => (
                    <span key={ext} className="badge badge-blue">{ext}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setUrlMode(true)}
            className="mt-3 mx-auto block text-xs text-[var(--text-tertiary)] hover:text-[var(--french-blue)] transition-colors"
          >
            Ou importer depuis une URL data.gouv.fr
          </button>
        </>
      ) : (
        <div className="card p-4">
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block">
            URL du fichier (data.gouv.fr)
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
            &larr; Revenir au drag & drop
          </button>
        </div>
      )}
    </div>
  );
}
