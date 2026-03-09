'use client';

import { useState } from 'react';

export default function LegalModal() {
  const [open, setOpen] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      >
        Mentions l&eacute;gales
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-fade-in-up">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text)]">
            Mentions l&eacute;gales &amp; Confidentialit&eacute;
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg)] text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 text-sm text-[var(--text-secondary)] leading-relaxed overflow-y-auto max-h-[65vh]">
          <section>
            <h3 className="text-[var(--text)] font-semibold mb-1.5">&Eacute;diteur du site</h3>
            <p>
              Ce site est &eacute;dit&eacute; par <span className="font-medium text-[var(--text)]">Alexis Hessler</span>, personne physique.
            </p>
            <p className="mt-1.5">
              Contact :{' '}
              {showEmail ? (
                <a
                  href="mailto:alexis.hessler@protonmail.fr"
                  className="text-[var(--french-blue)] hover:underline"
                >
                  alexis.hessler@protonmail.fr
                </a>
              ) : (
                <button
                  onClick={() => setShowEmail(true)}
                  className="text-[var(--french-blue)] hover:underline cursor-pointer"
                >
                  Afficher l&apos;adresse e-mail
                </button>
              )}
            </p>
          </section>

          <section>
            <h3 className="text-[var(--text)] font-semibold mb-1.5">Donn&eacute;es collect&eacute;es</h3>
            <p className="mb-2">
              Seules les donn&eacute;es strictement n&eacute;cessaires au fonctionnement sont collect&eacute;es :
            </p>
            <ul className="space-y-1.5 pl-4">
              <li className="flex items-start gap-2">
                <span className="text-[var(--french-blue)] mt-1 text-xs">&bull;</span>
                <span><span className="font-medium text-[var(--text)]">Adresse IP</span> &mdash; utilis&eacute;e uniquement pour le contr&ocirc;le du quota. Non stock&eacute;e de fa&ccedil;on permanente.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--french-blue)] mt-1 text-xs">&bull;</span>
                <span><span className="font-medium text-[var(--text)]">Identifiant de session</span> &mdash; g&eacute;n&eacute;r&eacute; al&eacute;atoirement dans votre navigateur. Aucun cookie n&apos;est utilis&eacute;.</span>
              </li>
            </ul>
            <p className="mt-3 text-xs font-medium text-[var(--text)] bg-[var(--bg)] rounded-lg px-3 py-2">
              Les IP et sessions sont purg&eacute;es automatiquement toutes les 24h si vous ne revenez pas sur le site.
            </p>
          </section>

          <section>
            <h3 className="text-[var(--text)] font-semibold mb-1.5">Ce que nous ne faisons pas</h3>
            <ul className="space-y-1 pl-4">
              {[
                'Aucun cookie de tracking ou publicitaire',
                'Aucune collecte de donn\u00e9es personnelles',
                'Aucun partage de donn\u00e9es avec des tiers',
                'Aucun stockage de vos fichiers ou r\u00e9sultats',
                'Aucune donn\u00e9e sauvegard\u00e9e \u2014 ni fichier, ni conversation, ni r\u00e9sultat',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5 text-xs">&check;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[var(--text)] font-semibold mb-1.5">Services tiers</h3>
            <ul className="space-y-1 pl-4">
              <li className="flex items-start gap-2">
                <span className="text-[var(--french-blue)] mt-1 text-xs">&bull;</span>
                <span><span className="font-medium text-[var(--text)]">Mistral AI</span> &mdash; utilis&eacute; pour le chatbot Data Explorer. Voir la <a href="https://mistral.ai/fr/terms/#privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline">politique de confidentialit&eacute; de Mistral</a>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--french-blue)] mt-1 text-xs">&bull;</span>
                <span><span className="font-medium text-[var(--text)]">data.gouv.fr</span> &mdash; plateforme officielle des donn&eacute;es ouvertes fran&ccedil;aises.</span>
              </li>
            </ul>
          </section>

          <section className="bg-[var(--bg)] rounded-xl p-4">
            <p className="text-xs text-[var(--text-secondary)]">
              Projets open source :{' '}
              <a href="https://github.com/alexishessler/MCPdatagouv" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline font-medium">MCPdatagouv</a>
              {' '}&middot;{' '}
              <a href="https://github.com/alexishessler/loi-de-benford" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline font-medium">Loi de Benford</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
