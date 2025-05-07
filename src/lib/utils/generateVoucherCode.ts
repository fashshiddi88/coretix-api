export function generateVoucherCode(): string {
  return `REWARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
