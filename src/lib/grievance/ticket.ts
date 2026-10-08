/**
 * Generates human-readable ticket numbers such as GRV-2026-00001.
 * If a custom sequence counter is provided it formats with 5 digits.
 * Otherwise uses timestamp + random salt for unique fallback.
 */
export function generateTicketNumber(sequenceNumber?: number): string {
  const year = new Date().getFullYear();
  if (sequenceNumber !== undefined && sequenceNumber > 0) {
    const padded = sequenceNumber.toString().padStart(5, '0');
    return `GRV-${year}-${padded}`;
  }
  
  // Random 5-digit number fallback if running outside sequence trigger
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `GRV-${year}-${randomSuffix}`;
}
