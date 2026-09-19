import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Share Pool Tracker',
  description: '250 Shares pool management and public contribution tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased flex flex-col">

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
          Target: 250 Shares • ₹400 / Share • Total Value: ₹1,00,000
        </footer>
      </body>
    </html>
  );
}