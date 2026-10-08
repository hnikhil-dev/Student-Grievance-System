'use client';

import React, { useState, useEffect } from 'react';

interface GrievanceItem {
  id: string;
  ticket_number: string;
  title: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  created_at: string;
  sla_status?: {
    remainingMinutes: number;
    elapsedPercent: number;
    isOverdue: boolean;
    isWarning: boolean;
  };
}

export default function StudentPortal() {
  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IT');
  const [description, setDescription] = useState('');

  // Fetch student grievances
  useEffect(() => {
    async function fetchMyGrievances() {
      try {
        const res = await fetch('/api/grievances/my', {
          headers: {
            'x-demo-user-id': '00000000-0000-0000-0000-000000000006',
            'x-demo-user-role': 'STUDENT',
          },
        });
        const data = await res.json();
        if (data.success) {
          setGrievances(data.data);
        }
      } catch (err) {
        console.error('Failed to load grievances:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyGrievances();
  }, []);

  // Submit new grievance
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user-id': '00000000-0000-0000-0000-000000000006',
          'x-demo-user-role': 'STUDENT',
        },
        body: JSON.stringify({
          title,
          category,
          description,
          affected_students: 1,
          severity: 'MODERATE',
          urgency: 'MEDIUM',
        }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`Grievance submitted successfully! Ticket: ${result.data.ticket_number}`);
        setTitle('');
        setDescription('');
        // Reload list
        window.location.reload();
      } else {
        alert(`Error: ${result.error.message}`);
      }
    } catch (err) {
      alert('Failed to submit grievance');
    }
  }

  // Handle closed-loop verification
  async function handleVerify(id: string, accepted: boolean) {
    const reason = accepted ? undefined : prompt('Please provide reason for reopening:');
    if (!accepted && (!reason || reason.length < 5)) {
      alert('A reason of at least 5 characters is required to reopen.');
      return;
    }

    try {
      const res = await fetch(`/api/grievances/${id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user-id': '00000000-0000-0000-0000-000000000006',
          'x-demo-user-role': 'STUDENT',
        },
        body: JSON.stringify({ accepted, reason }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.data.message);
        window.location.reload();
      } else {
        alert(data.error.message);
      }
    } catch (err) {
      alert('Verification update failed');
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', fontFamily: 'system-ui, sans-serif', padding: '0 1rem' }}>
      <h1>🎓 Student Grievance Portal</h1>
      <p style={{ color: '#666' }}>Submit complaints, track live SLA countdowns, and verify resolutions.</p>

      {/* New Complaint Form */}
      <section style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>Submit a New Grievance</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Title</label>
            <input
              type="text"
              required
              minLength={5}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wi-Fi disconnection in Library 2nd Floor"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="IT">IT & Network</option>
              <option value="ACADEMICS">Academic Affairs</option>
              <option value="HOSTEL">Hostel & Housing</option>
              <option value="MAINTENANCE">Campus Maintenance</option>
              <option value="TRANSPORT">Transport Services</option>
              <option value="CANTEEN">Canteen & Food</option>
              <option value="LIBRARY">Library</option>
              <option value="STUDENT_AFFAIRS">Student Affairs</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Description</label>
            <textarea
              required
              minLength={10}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details about the issue..."
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '0.75rem',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Submit Grievance
          </button>
        </form>
      </section>

      {/* My Complaints List */}
      <section>
        <h2>My Complaints</h2>
        {loading ? (
          <p>Loading complaints...</p>
        ) : grievances.length === 0 ? (
          <p>No complaints submitted yet.</p>
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
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#eee' }}>
                      Status: {g.status}
                    </span>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#eee' }}>
                      Priority: {g.priority}
                    </span>
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

                {/* Closed-Loop Verification Trigger */}
                {(g.status === 'STUDENT_VERIFICATION' || g.status === 'RESOLUTION_PROPOSED') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleVerify(g.id, true)}
                      style={{ padding: '0.4rem 0.8rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      ✓ Accept Resolution
                    </button>
                    <button
                      onClick={() => handleVerify(g.id, false)}
                      style={{ padding: '0.4rem 0.8rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      ✕ Reopen Ticket
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
