import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Smart Student Grievance System',
  description: 'Autonomous Agentic Student Grievance Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
