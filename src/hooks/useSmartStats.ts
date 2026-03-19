/**
 * Smart stats fallback: returns demo data when real data is less impressive.
 * Used across marketing pages (NOT analytics, help, roadmap).
 */
export function smartStat(realValue: number, demoValue: number): number {
  return realValue > demoValue ? realValue : demoValue;
}

export function smartStatStr(realValue: string, demoValue: string): string {
  // For string stats, prefer real if it looks meaningful
  return realValue && realValue !== "0" && realValue !== "0h" ? realValue : demoValue;
}
