import income from '@/content/occupation-income.json';
import scopes from '@/content/career-income-scope.json';
export type IncomeStatistic = (typeof income.statistics)[number];
export const incomeStatistics = income.statistics;
export const incomeStatisticByCode = new Map(income.statistics.map(item => [item.classificationCode,item]));
export const incomeOccupationByRecord = new Map(income.occupations.map(item => [item.recordNumber,item]));
export const incomeOccupationByCatalogId = new Map(income.occupations.map(item => [item.catalogId,item]));
export const incomeMetadata = { surveyYear: income.surveyYear, population: income.population, formula: income.formula, limitations: income.limitations, sources: income.sources, annualMedian: income.annualMedian };
// 年収換算（円）を万円・小数第1位へ四捨五入して表示する。浮動小数点の toFixed は
// 673.15万円のような境界値で切り捨て方向へ倒れるため、整数演算で丸める。
export function formatManYen1dp(yen: number): string {
  const q = Math.floor((yen + 500) / 1000);
  return `${Math.floor(q / 10).toLocaleString('ja-JP')}.${q % 10}`;
}
export function careerIncome(slug: string) {
  const scope=scopes.items.find(item => item.slug===slug);
  return { explanation: scope?.explanation ?? 'このページに対応する職業単位の給与統計は未確認です。', items: (scope?.recordNumbers ?? []).flatMap(number => { const occupation=incomeOccupationByRecord.get(number); const statistic=occupation?.classificationCode ? incomeStatisticByCode.get(occupation.classificationCode) : undefined; return occupation ? [{name:occupation.name,statistic}] : []; }) };
}
