import catalog from "./job-catalog.json";

export type CatalogOccupation = (typeof catalog.occupations)[number];
export type CatalogCategory = (typeof catalog.categories)[number];

export const occupationCatalog = catalog.occupations;
export const occupationCatalogCategories = catalog.categories;
export const occupationCatalogSource = catalog.source;

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

export function occupationJobTagUrl(recordNumber: string) {
  return `https://shigoto.mhlw.go.jp/Occupation/Detail?occupationId=${encodeURIComponent(recordNumber)}`;
}
