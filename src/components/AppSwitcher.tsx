'use client';

import { useState, useEffect } from 'react';

const APPS = [
  {
    name: 'MCPDataGouv',
    description: 'Explorez data.gouv.fr avec l\'IA',
    icon: '🇫🇷',
    href: 'https://mcpdatagouv.alexishessler.fr',
    localHref: 'http://localhost:3000',
    color: 'var(--french-blue)',
    bg: 'rgba(0, 35, 149, 0.06)',
    border: 'rgba(0, 35, 149, 0.12)',
    active: false,
  },
  {
    name: 'Loi de Benford',
    description: 'Testez la naturalité de vos données',
    icon: '📊',
    href: '#',
    localHref: '#',
    color: 'var(--french-red)',
    bg: 'rgba(237, 41, 57, 0.05)',
    border: 'rgba(237, 41, 57, 0.12)',
    active: true,
  },
];

export default function AppSwitcher() {
  const [isDev, setIsDev] = useState(false);
  useEffect(() => {
    setIsDev(window.location.hostname === 'localhost');
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {APPS.map(app => {
        const href = app.active ? '#' : (isDev ? app.localHref : app.href);
        return app.active ? (
          <div
            key={app.name}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
            style={{ background: app.bg, color: app.color, border: `1px solid ${app.border}` }}
          >
            <span className="text-sm">{app.icon}</span>
            <span className="hidden sm:inline">{app.name}</span>
          </div>
        ) : (
          <a
            key={app.name}
            href={href}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-warm)] transition-all duration-200 group"
            title={app.description}
          >
            <span className="text-sm">{app.icon}</span>
            <span className="hidden sm:inline">{app.name}</span>
            <svg className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        );
      })}
    </div>
  );
}
