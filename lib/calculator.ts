type MonthlyPaymentInput = {
  price: number;
  downPayment: number;
  balloonPayment: number;
  annualRate: number;
  months: number;
};

export function calculateMonthlyPayment({
  price,
  downPayment,
  balloonPayment,
  annualRate,
  months,
}: MonthlyPaymentInput): number {
  const financedAmount = Math.max(price - downPayment, 0);
  const residualValue = Math.max(balloonPayment, 0);
  const principal = Math.max(financedAmount - residualValue, 0);

  if (months <= 0) return 0;

  const monthlyRate = annualRate / 12;

  if (monthlyRate === 0) {
    return principal / months;
  }

  const annuity =
    principal *
    (monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)));

  const balloonSpread = residualValue / months;

  return annuity + balloonSpread;
}

export function formatEuroRange(min: number, max: number): string {
  const roundedMin = Math.round(min);
  const roundedMax = Math.round(max);

  return `€${roundedMin.toLocaleString("nl-NL")} – €${roundedMax.toLocaleString("nl-NL")}`;
}
