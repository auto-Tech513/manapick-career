import insightData from "@/content/career-insights.json";

export type AdjacentCareer = {
  slug: string;
  difference: string;
};

export type QualificationUse = {
  networkId: string;
  jobChangeUse: string;
  internalUse: string;
};

export type CareerInsight = {
  jobSlug: string;
  industryRole: string;
  currentSignal: string;
  usefulness: string;
  adjacentJobs: AdjacentCareer[];
  transitionSummary: string;
  transitionFactors: string[];
  evidenceToPrepare: string[];
  jobChangeUse: string[];
  internalUse: string[];
  qualificationUses: QualificationUse[];
  dailyActions: string[];
  sourceIds: string[];
  checkedAt: string;
};

export const careerInsights = insightData as CareerInsight[];
export const careerInsightBySlug = new Map(careerInsights.map((item) => [item.jobSlug, item]));
