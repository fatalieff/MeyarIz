export type ScoreInput = { correctAnswers:number; totalQuestions:number };
export function calculateScore({ correctAnswers, totalQuestions }:ScoreInput) {
  if (!Number.isInteger(correctAnswers) || !Number.isInteger(totalQuestions)) throw new Error("Cavab və sual sayı tam ədəd olmalıdır.");
  if (totalQuestions <= 0) throw new Error("Sual sayı sıfırdan böyük olmalıdır.");
  if (correctAnswers < 0 || correctAnswers > totalQuestions) throw new Error("Düzgün cavab sayı icazə verilən aralıqda deyil.");
  return (correctAnswers / totalQuestions) * 100;
}
export const performanceTrend = (latest:number|null, previous:number|null) => {
  if (latest == null || previous == null) return { status:"insufficient" as const, change:null };
  const change = latest - previous;
  return { status:change > 5 ? "improving" as const : change < -5 ? "declining" as const : "stable" as const, change };
};
