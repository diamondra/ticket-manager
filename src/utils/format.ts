export function formatAr(amount: number): string {
  return Math.round(amount).toLocaleString('fr-FR') + ' Ar';
}
