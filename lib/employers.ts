import catalog from "@/content/job-catalog.json";
import employersData from "@/content/occupation-employers.json";
import profiles from "@/content/professional-careers.json";
import { publishedOccupationCatalog } from "@/content/catalog";

export type EmployerItem = (typeof employersData.items)[number];
export type EmployerCategory = (typeof catalog.categories)[number] & { items: EmployerItem[] };

export const occupationById = new Map(catalog.occupations.map(item => [item.catalogId, item]));

/** 企業例が確認できている職業を、名録の分野ごとにまとめる（空の分野は含まない）。 */
export const employerCategories: EmployerCategory[] = catalog.categories
  .map(category => ({
    ...category,
    items: employersData.items.filter(item => occupationById.get(item.catalogId)?.categoryKey === category.key),
  }))
  .filter(category => category.items.length > 0);

export const publishedOccupationIds = new Set(publishedOccupationCatalog.map(item => item.catalogId));

const dossierById = new Map(profiles.items.map(item => [item.recordNumber, item]));
export const employerDossiers = employersData.existingDossiers
  .map(entry => ({ entry, profile: dossierById.get(entry.catalogId) ?? profiles.items.find(item => item.slug === entry.slug) }))
  .filter(item => item.profile);

export const employerTotal = employersData.items.length + employerDossiers.length;
