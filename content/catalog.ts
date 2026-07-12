import catalog from "./job-catalog.json";

export type CatalogOccupation = (typeof catalog.occupations)[number];
export type CatalogCategory = (typeof catalog.categories)[number];

export const occupationCatalog = catalog.occupations;
export const occupationCatalogCategories = catalog.categories;
export const occupationCatalogSource = catalog.source;

export function catalogCategory(categoryKey: string) {
  return occupationCatalogCategories.find((category) => category.key === categoryKey);
}
