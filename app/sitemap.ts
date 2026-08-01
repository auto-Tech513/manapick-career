import type { MetadataRoute } from "next";
import { categories, publishedJobs } from "@/content/jobs";
import { guides, newsItems, newsModifiedAt } from "@/content/editorial";
import { occupationCatalogSource, publishedOccupationCatalog, publishedOccupationRecord } from "@/content/catalog";
import { absoluteUrl } from "@/lib/site";
export const dynamic="force-static";

const latest = (...dates: string[]) => dates.filter(Boolean).sort().at(-1);

export default function sitemap(): MetadataRoute.Sitemap {
  const latestJobCheck = latest(...publishedJobs.map((job) => job.checkedAt));
  const latestGuideCheck = latest(...guides.map((guide) => guide.checkedAt));
  const latestNewsCheck = latest(...newsItems.map(newsModifiedAt));
  const latestEditorialCheck = latest(latestGuideCheck ?? "", latestNewsCheck ?? "");
  const latestSiteCheck = latest(latestJobCheck ?? "", latestEditorialCheck ?? "", occupationCatalogSource.datasetUpdatedAt);
  const contentDerivedDates: Record<string, string | undefined> = {
    "/": latestSiteCheck,
    "/route/": latestJobCheck,
    "/compare/": latestJobCheck,
    "/ranking/": latestJobCheck,
    "/skills/": latestJobCheck,
    "/guide/": latestGuideCheck,
    "/news/": latestNewsCheck,
    "/research/": latestNewsCheck,
    "/all/": latest(latestJobCheck ?? "", occupationCatalogSource.datasetUpdatedAt),
  };
  const fixed = ["/", "/route/", "/compare/", "/ranking/", "/skills/", "/guide/", "/news/", "/research/", "/shop/", "/glossary/", "/faq/", "/about-method/", "/operator/", "/privacy/", "/affiliate/", "/disclaimer/", "/contact/", "/all/"];

  return [
    ...fixed.map((path) => ({
      url: absoluteUrl(path),
      ...(contentDerivedDates[path] ? { lastModified: new Date(contentDerivedDates[path]) } : {}),
    })),
    ...categories.map((category) => {
      const categoryCheck = latest(...publishedJobs.filter((job) => job.category === category.key).map((job) => job.checkedAt));
      return {
        url: absoluteUrl(`/category/${category.key}/`),
        ...(categoryCheck ? { lastModified: new Date(categoryCheck) } : {}),
      };
    }),
    ...publishedOccupationCatalog.map((occupation) => ({
      url: absoluteUrl(`/occupation/${occupation.catalogId}/`),
      lastModified: new Date(publishedOccupationRecord(occupation.catalogId)?.reviewedByHumanAt ?? occupationCatalogSource.datasetUpdatedAt),
    })),
    ...publishedJobs.map((job) => ({ url: absoluteUrl(`/career/${job.slug}/`), lastModified: new Date(job.checkedAt) })),
    ...guides.map((guide) => ({ url: absoluteUrl(`/guide/${guide.slug}/`), lastModified: new Date(guide.checkedAt) })),
    ...newsItems.map((x) => ({ url: absoluteUrl(`/news/${x.slug}/`), lastModified: new Date(newsModifiedAt(x)) })),
  ];
}
