import type { MetadataRoute } from "next";
import { categories, publishedJobs } from "@/content/jobs";
import { absoluteUrl } from "@/lib/site";
export const dynamic="force-static";
export default function sitemap():MetadataRoute.Sitemap{const fixed=["/","/route/","/compare/","/skills/","/glossary/","/faq/","/about-method/","/operator/","/privacy/","/affiliate/","/disclaimer/","/contact/","/all/"];return [...fixed.map(url=>({url:absoluteUrl(url),changeFrequency:"monthly" as const,priority:url==="/"?1:0.6})),...categories.map(x=>({url:absoluteUrl(`/category/${x.key}/`),changeFrequency:"monthly" as const,priority:0.7})),...publishedJobs.map(x=>({url:absoluteUrl(`/career/${x.slug}/`),lastModified:new Date(x.checkedAt),changeFrequency:"monthly" as const,priority:0.8}))]}
