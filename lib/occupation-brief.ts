export type OccupationBrief = {
  schemaVersion: number;
  catalogId: string;
  name: string;
  work: string;
  entry: string;
  conditions: string;
  qualifications: string[];
  updatedYears: { record: string; classification: string; description: string };
  source: { title: string; provider: string; url: string; importedAt: string; retrievedAt: string; version: string };
};
