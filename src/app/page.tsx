import React from 'react';

export default function HomePage() {
  return (
    <main style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
      <h1>Smart Student Grievance System - API Foundation</h1>
      <p>
        The backend engine is running. All API routes, SLA tracking engines, priority scoring,
        and database models are operational.
      </p>
      <h2>Available Service Endpoints</h2>
      <ul>
        <li><code>GET /api/auth/me</code> - Session inspection</li>
        <li><code>GET /api/departments</code> - Active departments</li>
        <li><code>POST /api/grievances</code> - Submit grievance</li>
        <li><code>GET /api/grievances/my</code> - Student grievance list</li>
        <li><code>GET /api/admin/grievances</code> - Administrative queue</li>
        <li><code>GET /api/admin/analytics/overview</code> - Live metric summaries</li>
        <li><code>POST /api/ai/analyze-grievance</code> - AI integration boundary</li>
      </ul>
      <p>See <code>BACKEND_CONTRACT.md</code> and <code>API_REFERENCE.md</code> for complete specifications.</p>
    </main>
  );
}
