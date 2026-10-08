'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Navbar,
  StatusBadge,
  PriorityBadge,
  SlaIndicator,
  AiBadge,
  AiReasoningCard,
  Timeline,
  MetricCard,
} from '../index';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'demo' | 'sla'>('demo');

  // Sample data for AI Visual Showcase
  const sampleAiAnalysis = {
    category: 'IT SERVICES',
    severity: 'CRITICAL',
    urgency: 'IMMEDIATE',
    priority: 'CRITICAL' as const,
    priorityScore: 95,
    priorityReasons: [
      'Critical severity impact reported on computer lab network switch',
      'Immediate urgency ahead of capstone submission freeze',
      'Widespread cohort impact: 60 students affected in Lab 3',
    ],
    department: 'Information Technology',
    summary: 'Core switch failure in Computer Lab 3 affecting 60 workstations.',
    confidence: 0.94,
  };

  // Sample data for Lifecycle Timeline Walkthrough
  const sampleTimelineItems = [
    {
      id: '1',
      status: 'SUBMITTED' as const,
      title: 'Complaint Logged & AI Analyzed',
      timestamp: 'Today, 10:15 AM',
      description: 'Grievance submitted by student. AI assigned initial Priority score 95 (CRITICAL). SLA target: 4 Hours.',
      actorRole: 'STUDENT' as const,
      actorName: 'Alex Mercer (CS-2023-014)',
      isCompleted: true,
      isCurrent: false,
    },
    {
      id: '2',
      status: 'ASSIGNED' as const,
      title: 'Routed to IT Department',
      timestamp: 'Today, 10:18 AM',
      description: 'Intelligently assigned to Senior Network Engineer Officer Mark Sterling.',
      actorRole: 'OFFICER' as const,
      actorName: 'Mark Sterling (IT Admin)',
      isCompleted: true,
      isCurrent: false,
    },
    {
      id: '3',
      status: 'IN_PROGRESS' as const,
      title: 'Hardware Replacement Underway',
      timestamp: 'Today, 11:30 AM',
      description: 'Replacement Cisco Core Switch arrived at Lab 3. Testing 60 workstations.',
      actorRole: 'OFFICER' as const,
      actorName: 'Mark Sterling',
      isCompleted: true,
      isCurrent: false,
    },
    {
      id: '4',
      status: 'STUDENT_VERIFICATION' as const,
      title: 'Resolution Proposed — Awaiting Student Action',
      timestamp: 'Today, 12:45 PM',
      description: 'Officer posted resolution notes. Ticket moved to Closed-Loop Verification.',
      actorRole: 'OFFICER' as const,
      actorName: 'Mark Sterling',
      isCompleted: false,
      isCurrent: true,
    },
    {
      id: '5',
      status: 'CLOSED' as const,
      title: 'Student Verified & Closed',
      timestamp: 'Pending Student Confirmation',
      description: 'Student accepts resolution & provides 5-star rating.',
      actorRole: 'STUDENT' as const,
      isCompleted: false,
      isCurrent: false,
    },
  ];

  return (
    <div style={{ backgroundColor: '#F8FAF8', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      {/* 1. Header / Navbar */}
      <Navbar activePath="/" unreadNotificationsCount={2} />

      {/* 2. Hero Section Grounded in Reference Design */}
      <section
        style={{
          background: 'linear-gradient(180deg, #F0F7F4 0%, #F8FAF8 100%)',
          padding: '4rem 1.5rem 5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Soft Organic Leaf Decor SVG background element */}
        <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.08, pointerEvents: 'none' }}>
          <svg width="400" height="400" viewBox="0 0 100 100">
            <path d="M0 0 C 50 100, 100 50, 100 100 L 100 0 Z" fill="#1B4332" />
          </svg>
        </div>

        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }} className="sg-hero-grid">
            
            {/* Left Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', width: 'fit-content' }}>
                <AiBadge label="Institutional AI Grievance Intelligence 2.0" confidence={0.98} variant="indigo" />
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                  fontWeight: 800,
                  color: '#1B4332',
                  lineHeight: 1.12,
                  letterSpacing: '-0.02em',
                }}
              >
                YOUR VOICE.<br />
                <span style={{ color: '#2D6A4F' }}>YOUR CAMPUS.</span><br />
                YOUR RESOLUTION.
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: '1.125rem',
                  color: '#4B5563',
                  lineHeight: 1.6,
                  maxWidth: '560px',
                }}
              >
                An intelligent student grievance platform that understands complaints, automatically calculates SLA targets, routes to responsible campus departments, and guarantees <strong>closed-loop student verification</strong>.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <Button
                  variant="primary"
                  size="lg"
                  pill
                  onClick={() => (window.location.href = '/student/page')}
                  rightIcon="→"
                >
                  Report a Grievance
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  pill
                  onClick={() => (window.location.href = '/student/page')}
                  leftIcon="🔍"
                >
                  Track Grievance
                </Button>
              </div>

              {/* Live Metric Pills */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #E5E7EB',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1B4332' }}>4 Hours</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Avg Critical SLA</div>
                </div>
                <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2D6A4F' }}>100%</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Closed-Loop Verified</div>
                </div>
                <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4F46E5' }}>AI Powered</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Smart Priority Scoring</div>
                </div>
              </div>
            </div>

            {/* Right Card Grounded in Reference Floating White Card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Card variant="floating" style={{ width: '100%', maxWidth: '480px', padding: '2rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#1B4332',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      margin: '0 auto 0.75rem auto',
                    }}
                  >
                    🏛️
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1B4332' }}>
                    Welcome to AMIT Portal
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                    Access your student dashboard or file an urgent grievance.
                  </p>
                </div>

                {/* Role Switcher Pill Tabs matching reference image */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: '#F3F4F6', padding: '0.3rem', borderRadius: '9999px' }}>
                  <button
                    onClick={() => (window.location.href = '/student/page')}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '9999px',
                      backgroundColor: '#2D6A4F',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    🎓 Student Portal →
                  </button>
                  <button
                    onClick={() => (window.location.href = '/admin/page')}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '9999px',
                      backgroundColor: 'transparent',
                      color: '#374151',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    👤 Admin Portal →
                  </button>
                </div>

                {/* Quick Info Box */}
                <div style={{ backgroundColor: '#F0FDF4', padding: '1rem', borderRadius: '14px', border: '1px solid #DCFCE7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#1B4332' }}>
                    <span>🛡️ Institutional SLA Guarantee</span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#2D6A4F', lineHeight: 1.5 }}>
                    Every ticket is tracked by an automated SLA countdown. Officers must propose resolutions within target timeframes or tickets automatically escalate.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section (01 - 06 Visual Storytelling) */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SIMPLE & TRANSPARENT LIFECYCLE
            </span>
            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.25rem', fontWeight: 800, color: '#1B4332' }}>
              How The System Works
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#6B7280', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              From initial complaint submission to verified resolution, every step is transparent and student-verified.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '01', title: 'Tell us what happened', text: 'Describe the issue, location, severity, and number of affected students in simple words.', icon: '✍️' },
              { step: '02', title: 'AI understands the complaint', text: 'Gemini AI evaluates urgency, assigns priority score (0-100), and calculates SLA hours.', icon: '🤖' },
              { step: '03', title: 'Intelligent routing', text: 'Automatically assigned to responsible campus officers (IT, Hostel, Academics, Canteen).', icon: '🏛️' },
              { step: '04', title: 'Track progress transparently', text: 'Monitor live SLA countdown timers, status transitions, and officer comment updates.', icon: '⏱️' },
              { step: '05', title: 'Verify resolution', text: 'Closed-loop guarantee: You accept the officer resolution or reopen the ticket with reason.', icon: '✅' },
              { step: '06', title: 'Give feedback', text: 'Rate resolution quality (1-5★) to hold officers accountable and drive institutional excellence.', icon: '⭐' },
            ].map((s) => (
              <Card key={s.step} variant="floating" style={{ padding: '1.75rem', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D8F3DC' }}>{s.step}</span>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 700, color: '#1B4332' }}>
                  {s.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.6 }}>
                  {s.text}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI-Powered Grievance Intelligence Showcase */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: '#F0F7F4' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              EXPLAINABLE AI ENGINE
            </span>
            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.25rem', fontWeight: 800, color: '#1E1B4B' }}>
              AI Complaint Understanding
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#475569', maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}>
              No hallucinated decisions. Our system combines Gemini LLM reasoning with deterministic institutional priority formulas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="sg-ai-showcase">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              {/* Input Card */}
              <Card variant="floating" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>STUDENT COMPLAINT INPUT</span>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9375rem', lineHeight: 1.6, color: '#1E293B', fontWeight: 500 }}>
                  &ldquo;All 60 workstations in Computer Lab 3 lost internet connectivity right before our capstone project freeze deadline. Needs immediate fix.&rdquo;
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#E2E8F0', padding: '0.25rem 0.5rem', borderRadius: '6px', color: '#475569' }}>📍 Block B, Lab 3</span>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#E2E8F0', padding: '0.25rem 0.5rem', borderRadius: '6px', color: '#475569' }}>👥 60 Students</span>
                </div>
              </Card>

              {/* Output AI Card */}
              <AiReasoningCard analysis={sampleAiAnalysis} isAiEnhanced={true} />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Resolution Lifecycle Timeline Section */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TRANSPARENT TRACKING
            </span>
            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.25rem', fontWeight: 800, color: '#1B4332' }}>
              Realtime Grievance Timeline
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#6B7280' }}>
              Every status update is recorded with timestamps, officer identities, and resolution proof.
            </p>
          </div>

          <Card variant="floating" style={{ padding: '2rem' }}>
            <Timeline items={sampleTimelineItems} />
          </Card>
        </div>
      </section>

      {/* 6. Final CTA Section */}
      <section style={{ padding: '4rem 1.5rem', backgroundColor: '#1B4332', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Ready to resolve a campus issue?
          </h2>
          <p style={{ margin: '1rem 0 2rem 0', fontSize: '1.125rem', opacity: 0.9, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Submit your grievance in under 60 seconds. Track resolution status in real-time with full institutional SLA transparency.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="lg"
              pill
              onClick={() => (window.location.href = '/student/page')}
              rightIcon="→"
            >
              Submit Grievance Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              pill
              style={{ color: '#FFFFFF', borderColor: '#FFFFFF', backgroundColor: 'transparent' }}
              onClick={() => (window.location.href = '/student/page')}
            >
              Access Student Portal
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Institutional Footer */}
      <footer style={{ backgroundColor: '#0F291E', color: '#9CA3AF', padding: '3rem 1.5rem 2rem 1.5rem', fontSize: '0.875rem' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🏛️</span>
              <div>
                <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1rem' }}>ATMA MALIK INSTITUTE OF TECHNOLOGY & RESEARCH</div>
                <div style={{ fontSize: '0.75rem', color: '#D8F3DC' }}>Smart Student Grievance Management System • 24-Hour Hackathon Project</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <a href="/student/page" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600 }}>Student Portal</a>
              <a href="/admin/page" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600 }}>Admin Portal</a>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #143627', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem' }}>
            <div>© 2026 AMIT Student Experience Engineering Team (Member 2). All rights reserved.</div>
            <div>Built on Next.js 15, PostgreSQL & Supabase Engine.</div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @media (min-width: 900px) {
          .sg-hero-grid {
            grid-template-columns: 1.2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
