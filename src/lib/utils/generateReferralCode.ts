export function generateReferralCode(name: string, length: number = 6): string {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
  const namePart = name.split(" ")[0].substring(0, 3).toUpperCase();
  return `${namePart}${randomPart}`;
}
