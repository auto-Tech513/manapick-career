import catalog from "./job-catalog.json";
import publication from "./occupation-publication.json";

export type CatalogOccupation = (typeof catalog.occupations)[number];
export type CatalogCategory = (typeof catalog.categories)[number];
export type OccupationDirectoryEntry = Pick<CatalogOccupation, "catalogId" | "name" | "aliases" | "categoryKey" | "classificationCode" | "recordNumber">;

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
}));
export const occupationCatalogCategories = catalog.categories;
export const occupationCatalogSource = catalog.source;
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
