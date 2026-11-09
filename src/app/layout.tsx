import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Consent Console — Trust & Policy Layer for PayPal AI Agents',
  description: 'Deterministic human-in-the-loop policy gate and real-time defense against Excessive Agency and Prompt Injection for PayPal Agent Workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090d16] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
