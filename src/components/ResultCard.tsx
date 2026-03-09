'use client';

import { useEffect, useState } from 'react';
import type { BenfordResult } from '@/lib/benford';

type Props = {
  result: BenfordResult;
  columnName: string;
};

const VERDICT_CONFIG = {
  conforming: {
    label: 'Conforme à Benford',
    icon: '✓',
    css: 'verdict-conforming',
    color: 'var(--green)',
    explanation:
      'Vos données suivent la distribution naturelle de Benford. C\'est le comportement attendu pour des données réelles (populations, surfaces, cours de bourse, etc.).',
  },
  questionable: {
    label: 'Écarts notables',
    icon: '⚠',
    css: 'verdict-questionable',
    color: 'var(--orange)',
    explanation:
      'La distribution s\'écarte sensiblement de Benford. Cela peut venir de données arrondies, d\'un domaine restreint, ou mériter un examen plus approfondi.',
  },
  'non-conforming': {
    label: 'Non conforme',
    icon: '✗',
    css: 'verdict-non-conforming',
    color: 'var(--french-red)',
    explanation:
      'Vos données ne suivent pas la loi de Benford. Cela peut signaler des données fabriquées, arrondies, ou issues d\'un domaine restreint (notes, âges, etc.).',
  },
};

export default function ResultCard({ result, columnName }: Props) {
  const config = VERDICT_CONFIG[result.verdict];
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  // Animate confidence circle
  useEffect(() => {
    const target = result.confidence;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedConfidence(current);
    }, 15);
    return () => clearInterval(interval);
  }, [result.confidence]);

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (animatedConfidence / 100) * circumference;

  return (
    <div className="animate-fade-in-up">
      {/* Main verdict card */}
      <div className={`${config.css} rounded-2xl p-6 text-center`}>
        <div className="flex items-center justify-center gap-6 mb-4">
          {/* Animated circle */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                opacity={0.15}
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={config.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-extrabold" style={{ color: config.color }}>
                {animatedConfidence}
              </span>
            </div>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{config.icon}</span>
              <h3 className="text-lg font-bold" style={{ color: config.color }}>
                {config.label}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Colonne &laquo; {columnName} &raquo; &middot; {result.totalNumbers.toLocaleString('fr-FR')} valeurs analys&eacute;es
              {result.excludedCount > 0 && (
                <span className="text-[var(--text-tertiary)]">
                  {' '}({result.excludedCount} exclues)
                </span>
              )}
            </p>
          </div>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto">
          {config.explanation}
        </p>
      </div>

      {/* Data quality warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="mt-3 space-y-2">
          {result.warnings.map((w, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 text-xs leading-relaxed flex items-start gap-2.5 ${
                w.severity === 'critical'
                  ? 'bg-[rgba(237,41,57,0.06)] border border-[rgba(237,41,57,0.15)] text-[var(--french-red)]'
                  : w.severity === 'warning'
                  ? 'bg-[rgba(217,119,6,0.06)] border border-[rgba(217,119,6,0.15)] text-[var(--orange)]'
                  : 'bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              <span className="text-sm flex-shrink-0 mt-px">
                {w.severity === 'critical' ? '\u26a0\ufe0f' : w.severity === 'warning' ? '\u26a0' : '\u2139\ufe0f'}
              </span>
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats details */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="card p-3 text-center">
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            Chi&sup2;
          </p>
          <p className="text-base font-bold text-[var(--text)]">{result.chiSquared}</p>
          <p className="text-[9px] text-[var(--text-tertiary)]">ddl = 8</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            p-value
          </p>
          <p className="text-base font-bold text-[var(--text)]">
            {result.pValue < 0.0001 ? '<0.0001' : result.pValue.toFixed(4)}
          </p>
          <p className="text-[9px] text-[var(--text-tertiary)]">seuil 0.05</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            MAD
          </p>
          <p className="text-base font-bold text-[var(--text)]">{result.mad}</p>
          <p className="text-[9px] text-[var(--text-tertiary)]">
            {result.mad < 0.6 ? 'excellent' : result.mad < 1.2 ? 'acceptable' : 'marginal'}
          </p>
        </div>
      </div>
    </div>
  );
}
