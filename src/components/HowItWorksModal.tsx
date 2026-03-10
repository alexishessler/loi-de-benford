'use client';

import { useState } from 'react';

const STEPS = [
  {
    icon: '📂',
    label: 'Upload',
    color: 'var(--french-blue)',
    bg: 'rgba(0, 35, 149, 0.06)',
    border: 'rgba(0, 35, 149, 0.15)',
    tooltip: 'Chargez votre fichier de donn\u00e9es : CSV, Excel, JSON ou TXT.',
  },
  {
    icon: '🧹',
    label: 'Nettoyage',
    color: '#0F766E',
    bg: 'rgba(15, 118, 110, 0.06)',
    border: 'rgba(15, 118, 110, 0.15)',
    tooltip:
      'D\u00e9doublonnage, normalisation des nombres (FR/EN), suppression des lignes vides, d\u00e9tection automatique des colonnes num\u00e9riques.',
  },
  {
    icon: '📊',
    label: 'Benford',
    color: '#6B21A8',
    bg: 'rgba(107, 33, 168, 0.06)',
    border: 'rgba(107, 33, 168, 0.15)',
    tooltip:
      'Extraction du premier chiffre significatif, comparaison avec P(d) = log\u2081\u2080(1 + 1/d), test du chi\u00b2 et MAD.',
  },
  {
    icon: '✅',
    label: 'R\u00e9sultat',
    color: 'var(--french-red)',
    bg: 'rgba(237, 41, 57, 0.05)',
    border: 'rgba(237, 41, 57, 0.15)',
    tooltip:
      'Score de conformit\u00e9, graphique comparatif attendu vs observ\u00e9, et verdict.',
  },
];

const ANALOGY_LINES = [
  'Ouvrez un journal et regardez le premier chiffre de chaque nombre.',
  'Le 1 appara\u00eet ~30\u00a0% du temps, le 9 seulement ~5\u00a0%.',
  'C\u2019est la signature invisible de la r\u00e9alit\u00e9 \u2014 la loi de Benford.',
  'Si vos donn\u00e9es ne la portent pas\u2026 quelqu\u2019un a peut-\u00eatre trich\u00e9.',
];

function StepNode({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <div className="relative group/node flex flex-col items-center">
      <div
        className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-transform duration-200 group-hover/node:scale-110 cursor-default"
        style={{
          background: step.bg,
          border: `1.5px solid ${step.border}`,
          boxShadow: `0 4px 12px ${step.border}`,
        }}
      >
        {step.icon}
      </div>
      <span
        className="mt-2 text-[10px] sm:text-[11px] font-semibold tracking-wide"
        style={{ color: step.color }}
      >
        {step.label}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pb-2 opacity-0 invisible group-hover/node:opacity-100 group-hover/node:visible transition-all duration-200 z-50 pointer-events-none">
        <div
          className="w-48 p-2.5 bg-white rounded-xl border shadow-lg text-[10px] text-[var(--text-secondary)] leading-relaxed text-center"
          style={{ borderColor: step.border }}
        >
          {step.tooltip}
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center px-0.5 sm:px-1.5 -mt-3">
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-tertiary)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </div>
  );
}

export default function HowItWorksModal() {
  const [open, setOpen] = useState(false);
  const [showAnalogy, setShowAnalogy] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setShowAnalogy(false);
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-14 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95 comprendre-glow border border-[var(--border-subtle)]"
      >
        <span className="text-lg">&#x1f4a1;</span>
        <span className="text-xs font-semibold text-[var(--text-secondary)]">
          Comprendre
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text)]">Comment &ccedil;a marche ?</h2>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg)] text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Infographic */}
        <div className="px-6 py-6">
          <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
            Votre fichier traverse 4 &eacute;tapes pour tester la loi de Benford.
            <br />
            <span className="text-[11px] text-[var(--text-tertiary)]">Survolez chaque &eacute;tape pour en savoir plus.</span>
          </p>

          <div className="flex items-start justify-center">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex items-start">
                <StepNode step={step} />
                {i < STEPS.length - 1 && <Arrow />}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-5">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-tertiary)]">
                R&eacute;sultat instantan&eacute; — aucune donn&eacute;e envoy&eacute;e &agrave; un serveur externe
              </span>
            </div>
          </div>
        </div>

        {/* Analogy section */}
        <div className="border-t border-[var(--border)] px-6 py-5 bg-[var(--bg)]">
          {!showAnalogy ? (
            <button
              onClick={() => setShowAnalogy(true)}
              className="mx-auto flex items-center gap-2 bg-white rounded-full px-5 py-2.5 border border-[var(--border-subtle)] hover:border-[var(--french-blue)]/30 hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-base">&#x1f4a1;</span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">R&eacute;sum&eacute; en une analogie</span>
            </button>
          ) : (
            <div className="comprendre-card">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">&#x1f4a1;</span>
                <span className="text-sm font-bold text-[var(--text)]">En une image&hellip;</span>
              </div>
              <div className="space-y-2.5 pl-1 border-l-2 border-[var(--french-blue)]/20 ml-1">
                {ANALOGY_LINES.map((line, i) => (
                  <p
                    key={i}
                    className={`comprendre-line comprendre-line-${i + 1} text-[13px] leading-relaxed text-[var(--text-secondary)] pl-3`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] px-6 py-3">
          <p className="text-[11px] text-[var(--text-tertiary)] text-center leading-relaxed">
            D&eacute;couvrez-en plus dans{' '}
            <a
              href="https://www.arte.tv/fr/videos/097454-002-A/voyages-au-pays-des-maths/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--french-blue)] hover:underline font-medium"
            >
              le documentaire Arte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
