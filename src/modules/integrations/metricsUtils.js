

export function calculateMetric(checks = []) {
  if (!checks.length) return 0;

  const total = checks.reduce((sum, c) => sum + Number(c.score || 0), 0);
  return Number((total / checks.length).toFixed(2));
}

export function getStatusFromScore(score) {
  if (score < 0.4) return "Non-Compliant";
  if (score < 0.7) return "Partially Compliant";
  if (score < 0.9) return "Largely Compliant";
  return "Fully Compliant";
}
