import catalog from "./job-catalog.json";
import { incomeOccupationByCatalogId } from "@/lib/occupation-income";
import corrections from "./occupation-corrections.json";
import evidence from "./career-evidence.json";
import publication from "./occupation-publication.json";
import employerRegistry from "./occupation-employers.json";
import dossiers from "./career-dossiers.json";
import professionalCareers from "./professional-careers.json";
import { createHash } from "node:crypto";

export type CatalogOccupation = (typeof catalog.occupations)[number];
export type CatalogCategory = (typeof catalog.categories)[number];
export type OccupationDirectoryEntry = Pick<CatalogOccupation, "catalogId" | "name" | "aliases" | "categoryKey" | "classificationCode" | "recordNumber" | "summary" | "updatedYears"> & { incomeCode: string | null };

export type OccupationPublicationStatus = "draft" | "reviewed" | "published";
export type OccupationPublicationRecord = {
  catalogId: string;
  status: OccupationPublicationStatus;
  uniqueEditorialBody: string | null;
  officialSourceIds: string[];
  checkedAt: string | null;
  relatedVideoIds: string[];
  relatedQualificationIds: string[];
  relatedAiIds: string[];
  author: string | null;
  editor: string | null;
  editorReviewed: boolean;
  reviewedAt: string | null;
  reviewedByHumanAt: string | null;
  publishedAt: string | null;
  reviewEvidence: string | null;
};

export const occupationCatalog = catalog.occupations;
export const occupationDirectory: OccupationDirectoryEntry[] = catalog.occupations.map((occupation) => ({
  catalogId: occupation.catalogId,
  name: occupation.name,
  aliases: occupation.aliases,
  categoryKey: occupation.categoryKey,
  classificationCode: occupation.classificationCode,
  recordNumber: occupation.recordNumber,
  summary: occupation.summary,
  updatedYears: occupation.updatedYears,
  incomeCode: incomeOccupationByCatalogId.get(occupation.catalogId)?.classificationCode ?? null,
}));
export const occupationCatalogCategories = catalog.categories;
export const occupationCatalogSource = catalog.source;
export const occupationBriefVersion = createHash("sha256").update(JSON.stringify({occupations: catalog.occupations, corrections, evidence, employerRegistry, dossiers})).digest("hex").slice(0,12);
export const occupationPublicationPolicy = publication.policy;
export const occupationPublicationRecords = publication.records as OccupationPublicationRecord[];

const occupationPublicationById = new Map(occupationPublicationRecords.map((record) => [record.catalogId, record]));

function isCompletePublishedOccupation(record: OccupationPublicationRecord | undefined) {
  return Boolean(
    record &&
    record.status === "published" &&
    record.uniqueEditorialBody &&
    Array.from(record.uniqueEditorialBody).length >= 1000 &&
    record.officialSourceIds.length > 0 &&
    record.checkedAt &&
    record.relatedVideoIds.length > 0 &&
    record.relatedQualificationIds.length > 0 &&
    record.relatedAiIds.length > 0 &&
    record.author &&
    record.editor &&
    record.editorReviewed === true &&
    record.reviewedAt &&
    record.reviewedByHumanAt &&
    record.publishedAt &&
    /^git:[0-9a-f]{7,40}$/i.test(record.reviewEvidence ?? "")
  );
}

export const publishedOccupationCatalog = occupationCatalog.filter((occupation) => isCompletePublishedOccupation(occupationPublicationById.get(occupation.catalogId)));

export const humanReviewedSlugByOccupation: Record<string, string> = {
  "ITコンサルタント": "it-consultant",
  "システムエンジニア（Webサービス開発）": "software-engineer",
  "データサイエンティスト": "data-analyst",
  "Webマーケティング（ネット広告・販売促進）": "web-marketer",
  "映像編集者": "video-editor",
  "動画制作": "video-editor",
  "Webデザイナー（Web制作会社）": "web-designer",
  "一般事務": "office-administration",
  "経理事務": "accounting",
  "医薬品販売/登録販売者": "registered-salesperson",
};

export function catalogCategory(categoryKey: string) {
  return occupationCatalogCategories.find((category) => category.key === categoryKey);
}

export function catalogOccupation(catalogId: string) {
  return occupationCatalog.find((occupation) => occupation.catalogId === catalogId);
}

export function publishedCatalogOccupation(catalogId: string) {
  return publishedOccupationCatalog.find((occupation) => occupation.catalogId === catalogId);
}

export function publishedOccupationRecord(catalogId: string) {
  const record = occupationPublicationById.get(catalogId);
  return isCompletePublishedOccupation(record) ? record : undefined;
}

export function occupationJobTagUrl(recordNumber: string) {
  return `https://shigoto.mhlw.go.jp/Occupation/Detail?occupationId=${encodeURIComponent(recordNumber)}`;
}

export type OccupationEmployerEntry = {
  name: string;
  role: string;
  description: string;
  source: { title: string; url: string; checkedAt: string };
};

export function occupationEmployers(catalogId: string): OccupationEmployerEntry[] {
  const existing = employerRegistry.existingDossiers.find((item) => item.catalogId === catalogId);
  const dossier = existing ? dossiers.items.find((item) => item.slug === existing.slug) : undefined;
  if (dossier) {
    return dossier.employers.flatMap((item) => {
      const source = evidence.sources.find((entry) => entry.id === item.sourceId);
      return source
        ? [{ name: item.name, role: item.role, description: item.description, source: { title: source.title, url: source.url, checkedAt: source.accessedAt } }]
        : [];
    });
  }
  const registryItem = employerRegistry.items.find((item) => item.catalogId === catalogId);
  return (registryItem?.employers ?? []) as OccupationEmployerEntry[];
}

export function occupationDossierSlug(catalogId: string): string | null {
  return employerRegistry.existingDossiers.find((item) => item.catalogId === catalogId)?.slug ?? null;
}

export function careerSlugCatalogId(slug: string): string | null {
  const dossier = employerRegistry.existingDossiers.find((item) => item.slug === slug);
  if (dossier) return dossier.catalogId;
  for (const [name, candidate] of Object.entries(humanReviewedSlugByOccupation)) {
    if (candidate === slug) {
      const occupation = occupationCatalog.find((item) => item.name === name);
      if (occupation) return occupation.catalogId;
    }
  }
  const profile = (professionalCareers.items as { slug: string; name: string }[]).find((item) => item.slug === slug);
  if (profile) {
    const occupation = occupationCatalog.find((item) => item.name === profile.name);
    if (occupation) return occupation.catalogId;
  }
  return null;
}

export function relatedPublishedOccupationsForCareer(slug: string) {
  const catalogId = careerSlugCatalogId(slug);
  if (!catalogId) return [];
  const self = catalogOccupation(catalogId);
  if (!self) return [];
  return publishedOccupationCatalog.filter((item) => item.categoryKey === self.categoryKey && item.catalogId !== catalogId);
}
