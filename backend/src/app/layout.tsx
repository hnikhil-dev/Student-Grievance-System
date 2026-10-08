import type { Metadata } from 'next';
import React from 'react';
import '@student/styles/tokens.css';

export const metadata: Metadata = {
  title: 'Smart Student Grievance System API',
  description: 'Backend foundation for 24-hour Student Grievance Hackathon',
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
