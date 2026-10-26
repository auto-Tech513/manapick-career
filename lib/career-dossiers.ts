import dossiers from '@/content/career-dossiers.json';
import evidence from '@/content/career-evidence.json';

export type CareerDossier = (typeof dossiers.items)[number];
export type CareerEvidence = (typeof evidence.sources)[number];
export const careerDossierBySlug = new Map(dossiers.items.map(item => [item.slug, item]));
export const careerEvidenceById = new Map(evidence.sources.map(item => [item.id, item]));
