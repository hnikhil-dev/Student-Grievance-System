import { describe, it, expect } from 'vitest';
import { computeSha256, verifySha256, generateEvidenceIntegrityMetadata } from '@/lib/evidence/hasher';
import { EvidenceAgent } from '@/lib/agents/evidence-agent';

describe('Evidence Vault & Cryptographic Hasher', () => {
  it('computes accurate SHA-256 hashes for string, Buffer, and ArrayBuffer', () => {
    const rawString = 'Grievance evidence text sample';
    const hashFromString = computeSha256(rawString);
    const hashFromBuffer = computeSha256(Buffer.from(rawString, 'utf-8'));

    expect(hashFromString).toBeDefined();
    expect(hashFromString.length).toBe(64); // SHA-256 produces 64 hex characters
    expect(hashFromString).toBe(hashFromBuffer);
  });

  it('correctly verifies authentic payloads and rejects tampered data', () => {
    const originalBuffer = Buffer.from('Official photo evidence bytes', 'utf-8');
    const originalHash = computeSha256(originalBuffer);

    expect(verifySha256(originalBuffer, originalHash)).toBe(true);

    const tamperedBuffer = Buffer.from('Tampered photo evidence bytes', 'utf-8');
    expect(verifySha256(tamperedBuffer, originalHash)).toBe(false);
  });

  it('generates structured tamper-proof integrity metadata', () => {
    const fileBuffer = Buffer.from('image payload simulation', 'utf-8');
    const metadata = generateEvidenceIntegrityMetadata(fileBuffer, 'switch_burned.jpg', 'image/jpeg');

    expect(metadata.fileName).toBe('switch_burned.jpg');
    expect(metadata.mimeType).toBe('image/jpeg');
    expect(metadata.byteSize).toBe(fileBuffer.byteLength);
    expect(metadata.sha256).toBe(computeSha256(fileBuffer));
    expect(metadata.fingerprint.startsWith('SHA256:')).toBe(true);
  });

  describe('EvidenceAgent Multimodal Analysis', () => {
    it('verifies genuine matching image evidence with high relevance score and CoT trace', async () => {
      const buffer = Buffer.from('corrupted switch image sample');
      const result = await EvidenceAgent.analyze({
        grievanceId: 'grievance-101',
        uploadedBy: 'student-001',
        fileName: 'switch_burn.jpg',
        fileType: 'image/jpeg',
        fileSize: buffer.byteLength,
        fileBuffer: buffer,
        filePath: 'evidence/grievance-101/switch_burn.jpg',
        grievanceTitle: 'Lab 3 Cisco Gigabit Switch Burnt Out',
        grievanceDescription: 'Power supply burned with smoke in Lab 3 server rack',
        grievanceCategory: 'IT',
      });

      expect(result.success).toBe(true);
      expect(result.agentName).toBe('EVIDENCE_AGENT');
      expect(result.data.authenticityStatus).toBe('VERIFIED');
      expect(result.data.relevanceScore).toBeGreaterThanOrEqual(80);
      expect(result.thoughtProcess).toContain('[STEP 1: CRYPTOGRAPHIC FINGERPRINTING]');
      expect(result.thoughtProcess).toContain('[STEP 4: AUTHENTICITY CERTIFICATION]');
    });

    it('flags unwhitelisted MIME types or corrupted zero-byte payloads as SUSPICIOUS', async () => {
      const result = await EvidenceAgent.analyze({
        grievanceId: 'grievance-102',
        uploadedBy: 'student-002',
        fileName: 'virus.exe',
        fileType: 'application/x-msdownload',
        fileSize: 500,
        filePath: 'evidence/grievance-102/virus.exe',
        grievanceTitle: 'Broken chair in Classroom 402',
        grievanceDescription: 'Leg is detached from the wooden seat',
      });

      expect(result.data.authenticityStatus).toBe('SUSPICIOUS');
      expect(result.data.relevanceScore).toBeLessThan(50);
      expect(result.data.metadata.visualChecks.fileExtensionValid).toBe(false);
    });

    it('processes officer counter-evidence proof of resolution', async () => {
      const buffer = Buffer.from('repaired plumbing photo');
      const result = await EvidenceAgent.analyze({
        grievanceId: 'grievance-103',
        uploadedBy: 'officer-005',
        fileName: 'repaired_pipe_fix.png',
        fileType: 'image/png',
        fileSize: buffer.byteLength,
        fileBuffer: buffer,
        filePath: 'evidence/grievance-103/repaired_pipe_fix.png',
        isResolutionProof: true,
        grievanceTitle: 'Water leak in washroom',
        grievanceDescription: 'Pipe broken under sink',
      });

      expect(result.data.aiDescription).toContain('Official resolution proof');
      expect(result.thoughtProcess).toContain('OFFICER_RESOLUTION_PROOF');
    });
  });
});
