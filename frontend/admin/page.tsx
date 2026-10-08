'use client';

import React, { useState, useEffect } from 'react';

interface OverviewMetrics {
  totalGrievances: number;
  openCount: number;
  inProgressCount: number;
  pendingVerificationCount: number;
  closedCount: number;
  escalatedCount: number;
  overdueCount: number;
  avgResolutionHours: number;
  averageSatisfaction: number;
  totalFeedbackResponses: number;
}

interface AdminGrievance {
  id: string;
  ticket_number: string;
  title: string;
  category: string;
  priority: string;
  priority_score: number;
  status: string;
  due_at: string;
  sla_status?: {
    isOverdue: boolean;
    isWarning: boolean;
    remainingMinutes: number;
  };
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [grievances, setGrievances] = useState<AdminGrievance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const headers = {
          'x-demo-user-id': '00000000-0000-0000-0000-000000000001',
          'x-demo-user-role': 'SUPER_ADMIN',
        };

        const [metricsRes, queueRes] = await Promise.all([
          fetch('/api/admin/analytics/overview', { headers }),
          fetch('/api/admin/grievances', { headers }),
        ]);

        const metricsData = await metricsRes.json();
        const queueData = await queueRes.json();

        if (metricsData.success) setMetrics(metricsData.data);
        if (queueData.success) setGrievances(queueData.data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Run AI / Rule classification
  async function testAiClassification() {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-grievance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: aiInput.slice(0, 50),
          description: aiInput,
          category: 'HOSTEL',
          affected_students: 50,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.data.analysis);
      }
    } catch (err) {
      alert('AI analysis call failed');
    } finally {
      setAiLoading(false);
    }
  }

  // Officer Propose Resolution
  async function handleResolve(id: string) {
    const notes = prompt('Enter resolution notes (min 10 characters):');
    if (!notes || notes.trim().length < 10) {
      alert('Resolution notes must be at least 10 characters.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/grievances/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user-id': '00000000-0000-0000-0000-000000000001',
          'x-demo-user-role': 'SUPER_ADMIN',
        },
        body: JSON.stringify({ resolution_notes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.data.message);
        window.location.reload();
      } else {
        alert(data.error.message);
      }
    } catch (err) {
      alert('Failed to propose resolution');
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', fontFamily: 'system-ui, sans-serif', padding: '0 1rem' }}>
      <h1>⚙️ Institutional Admin & AI Dashboard</h1>
      <p style={{ color: '#666' }}>Intelligent triage, SLA tracking, AI priority classification, and analytics.</p>

      {/* Metric KPI Cards */}
      {metrics && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Total Grievances</span>
            <h2 style={{ margin: '0.25rem 0' }}>{metrics.totalGrievances}</h2>
          </div>
          <div style={{ background: '#e6f4ea', padding: '1rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#137333' }}>Open / Active</span>
            <h2 style={{ margin: '0.25rem 0', color: '#137333' }}>{metrics.openCount}</h2>
          </div>
          <div style={{ background: '#fce8e6', padding: '1rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#c5221f' }}>SLA Overdue</span>
            <h2 style={{ margin: '0.25rem 0', color: '#c5221f' }}>{metrics.overdueCount}</h2>
          </div>
          <div style={{ background: '#fef7e0', padding: '1rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#b06000' }}>Escalated</span>
            <h2 style={{ margin: '0.25rem 0', color: '#b06000' }}>{metrics.escalatedCount}</h2>
          </div>
          <div style={{ background: '#e8f0fe', padding: '1rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#1a73e8' }}>Avg Resolution</span>
            <h2 style={{ margin: '0.25rem 0', color: '#1a73e8' }}>{metrics.avgResolutionHours}h</h2>
          </div>
          <div style={{ background: '#f3e8fd', padding: '1rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#8430ce' }}>Satisfaction</span>
            <h2 style={{ margin: '0.25rem 0', color: '#8430ce' }}>{metrics.averageSatisfaction} / 5.0 ★</h2>
          </div>
        </section>
      )}

      {/* AI Classifier Sandbox */}
      <section style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>🤖 AI Classification Boundary Sandbox</h2>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Test the structured AI boundary endpoint (<code>POST /api/ai/analyze-grievance</code>) with automated Zod validation.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Type raw grievance text (e.g. Yellow contaminated water in Block D cooler)..."
            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            onClick={testAiClassification}
            disabled={aiLoading}
            style={{ padding: '0.5rem 1rem', background: '#6200ee', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {aiLoading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>

        {aiResult && (
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', border: '1px solid #ddd', overflowX: 'auto', fontSize: '0.85rem' }}>
            {JSON.stringify(aiResult, null, 2)}
          </pre>
        )}
      </section>

      {/* Active Triage Queue */}
      <section>
        <h2>📋 Administrative Triage Queue</h2>
        {loading ? (
          <p>Loading queue...</p>
        ) : grievances.length === 0 ? (
          <p>No active grievances in queue.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {grievances.map((g) => (
              <div
                key={g.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>{g.ticket_number} • {g.category}</span>
                  <h3 style={{ margin: '0.25rem 0' }}>{g.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#eee' }}>Status: {g.status}</span>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#eee' }}>Priority: {g.priority} ({g.priority_score}/100)</span>
                    {g.sla_status && (
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: g.sla_status.isOverdue ? '#ffd2d2' : g.sla_status.isWarning ? '#fff3cd' : '#d4edda',
                          color: g.sla_status.isOverdue ? '#a00' : g.sla_status.isWarning ? '#856404' : '#155724',
                        }}
                      >
                        {g.sla_status.isOverdue ? '⚠️ Overdue' : `⏱ ${g.sla_status.remainingMinutes}m remaining`}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {g.status !== 'CLOSED' && g.status !== 'STUDENT_VERIFICATION' && (
                    <button
                      onClick={() => handleResolve(g.id)}
                      style={{ padding: '0.5rem 1rem', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Propose Resolution
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
