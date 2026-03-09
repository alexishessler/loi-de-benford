'use client';

import { useState } from 'react';

const STEPS = [
  {
    icon: '📂',
    label: 'Upload',
    color: 'var(--french-blue)',
    bg: 'rgba(0, 35, 149, 0.06)',
    border: 'rgba(0, 35, 149, 0.15)',
    tooltip: 'Chargez votre fichier de données : CSV, Excel, JSON ou TXT.',
  },
  {
    icon: '🧹',
    label: 'Nettoyage',
    color: '#0F766E',
    bg: 'rgba(15, 118, 110, 0.06)',
    border: 'rgba(15, 118, 110, 0.15)',
    tooltip:
      'Dédoublonnage, normalisation des nombres (FR/EN), suppression des lignes vides, détection automatique des colonnes numériques.',
  },
  {
    icon: '📊',
    label: 'Benford',
    color: '#6B21A8',
    bg: 'rgba(107, 33, 168, 0.06)',
    border: 'rgba(107, 33, 168, 0.15)',
    tooltip:
      'Extraction du premier chiffre significatif, comparaison avec P(d) = log₁₀(1 + 1/d), test du chi² et MAD.',
  },
  {
    icon: '✅',
    label: 'Résultat',
    color: 'var(--french-red)',
    bg: 'rgba(237, 41, 57, 0.05)',
    border: 'rgba(237, 41, 57, 0.15)',
    tooltip:
      'Score de conformité, graphique comparatif attendu vs observé, et verdict : conforme, douteux ou non conforme.',
  },
];

function StepNode({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <div className="relative group/node flex flex-col items-center">
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-transform duration-200 group-hover/node:scale-110 cursor-default"
        style={{
          background: step.bg,
          border: `1.5px solid ${step.border}`,
          boxShadow: `0 4px 12px ${step.border}`,
        }}
      >
        {step.icon}
      </div>
      <span
        className="mt-2.5 text-[11px] sm:text-xs font-semibold tracking-wide"
        style={{ color: step.color }}
      >
        {step.label}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pb-2 opacity-0 invisible group-hover/node:opacity-100 group-hover/node:visible transition-all duration-200 z-50 pointer-events-none">
        <div
          className="w-52 p-2.5 bg-white rounded-xl border shadow-lg text-[11px] text-[var(--text-secondary)] leading-relaxed text-center"
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
    <div className="flex items-center px-1 sm:px-2 -mt-4">
      <svg
        className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-tertiary)]"
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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text)] bg-[var(--bg)] hover:bg-[var(--bg-warm)] border border-[var(--border-subtle)] rounded-lg px-2 sm:px-2.5 py-1 transition-all duration-200"
        title="Comment ça marche ?"
      >
        <span className="sm:hidden">?</span>
        <span className="hidden sm:inline">Comment &ccedil;a marche ?</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden animate-fade-in-up">
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

        <div className="px-6 py-8">
          <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
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

          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg)] border border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-tertiary)]">
                R&eacute;sultat instantan&eacute; — aucune donn&eacute;e envoy&eacute;e &agrave; un serveur externe
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] px-6 py-4 bg-[var(--bg)]">
          <p className="text-[11px] text-[var(--text-tertiary)] text-center leading-relaxed">
            La loi de Benford s&apos;applique aux donn&eacute;es qui couvrent plusieurs ordres de grandeur : populations, PIB, surfaces, transactions financi&egrave;res...
            <br />
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
