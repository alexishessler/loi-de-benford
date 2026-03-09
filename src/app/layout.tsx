import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Loi de Benford — Testez vos données',
  description:
    'Analysez la conformité de vos données avec la loi de Benford. Upload CSV, Excel, JSON — résultat instantané avec graphiques.',
  openGraph: {
    title: 'Loi de Benford — Testez vos données',
    description:
      'Vérifiez si vos données suivent la loi de Benford. Analyse statistique instantanée.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
