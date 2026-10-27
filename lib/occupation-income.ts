import income from '@/content/occupation-income.json';
import scopes from '@/content/career-income-scope.json';
export type IncomeStatistic = (typeof income.statistics)[number];
export const incomeStatistics = income.statistics;
export const incomeStatisticByCode = new Map(income.statistics.map(item => [item.classificationCode,item]));
export const incomeOccupationByRecord = new Map(income.occupations.map(item => [item.recordNumber,item]));
export const incomeOccupationByCatalogId = new Map(income.occupations.map(item => [item.catalogId,item]));
export const incomeMetadata = { surveyYear: income.surveyYear, population: income.population, formula: income.formula, limitations: income.limitations, sources: income.sources, annualMedian: income.annualMedian };
export function careerIncome(slug: string) {
  const scope=scopes.items.find(item => item.slug===slug);
  return { explanation: scope?.explanation ?? 'このページに対応する職業単位の給与統計は未確認です。', items: (scope?.recordNumbers ?? []).flatMap(number => { const occupation=incomeOccupationByRecord.get(number); const statistic=occupation?.classificationCode ? incomeStatisticByCode.get(occupation.classificationCode) : undefined; return occupation ? [{name:occupation.name,statistic}] : []; }) };
}
