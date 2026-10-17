import type { Metadata } from 'next';
import React from 'react';
import '@student/styles/tokens.css';

export const metadata: Metadata = {
  title: 'AMRIT Student Grievance Redressal System',
  description: 'AMRIT Student Grievance Redressal System Portal & API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
