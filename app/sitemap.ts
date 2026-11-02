import type { MetadataRoute } from "next";
import { categories, publishedJobs } from "@/content/jobs";
import { guides, newsItems, newsModifiedAt } from "@/content/editorial";
import { occupationCatalogSource, publishedOccupationCatalog, publishedOccupationRecord } from "@/content/catalog";
import { absoluteUrl } from "@/lib/site";
import profiles from '@/content/professional-careers.json';
export const dynamic="force-static";

const latest = (...dates: string[]) => dates.filter(Boolean).sort().at(-1);

export default function sitemap(): MetadataRoute.Sitemap {
  const latestJobCheck = latest(...publishedJobs.map((job) => job.checkedAt), ...profiles.items.map(job=>job.researchedAt));
  const latestGuideCheck = latest(...guides.map((guide) => guide.checkedAt));
  const latestNewsCheck = latest(...newsItems.map(newsModifiedAt));
  const latestEditorialCheck = latest(latestGuideCheck ?? "", latestNewsCheck ?? "");
  const latestSiteCheck = latest(latestJobCheck ?? "", latestEditorialCheck ?? "", occupationCatalogSource.datasetUpdatedAt);
  // lastModified は、コンテンツ由来の日付を引けるページにだけ付ける。
  // 日付の根拠がない固定ページ（/shop/ /privacy/ など）には付けない。
  const contentDerivedDates: Record<string, string | undefined> = {
    "/": latestSiteCheck,
    "/route/": latestJobCheck,
    "/compare/": latestJobCheck,
    "/ranking/": latestJobCheck,
    "/skills/": latestJobCheck,
    "/guide/": latestGuideCheck,
    "/news/": latestNewsCheck,
    "/research/": latestNewsCheck,
    "/employers/": latest(latestJobCheck ?? "", occupationCatalogSource.datasetUpdatedAt),
    "/all/": latest(latestJobCheck ?? "", occupationCatalogSource.datasetUpdatedAt),
  };
  const fixed = ["/", "/route/", "/compare/", "/ranking/", "/skills/", "/guide/", "/news/", "/research/", "/shop/", "/employers/", "/tools/net-income/", "/glossary/", "/faq/", "/about-method/", "/operator/", "/privacy/", "/affiliate/", "/disclaimer/", "/contact/", "/all/"];

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
    ...profiles.items.map(job=>({url:absoluteUrl(`/career/${job.slug}/`),lastModified:new Date(job.researchedAt)})),
    ...publishedJobs.map((job) => ({ url: absoluteUrl(`/career/${job.slug}/`), lastModified: new Date(latest(job.checkedAt, ...profiles.items.map(item=>item.researchedAt))!) })),
    ...guides.map((guide) => ({ url: absoluteUrl(`/guide/${guide.slug}/`), lastModified: new Date(guide.checkedAt) })),
    ...newsItems.map((x) => ({ url: absoluteUrl(`/news/${x.slug}/`), lastModified: new Date(newsModifiedAt(x)) })),
  ];
}
