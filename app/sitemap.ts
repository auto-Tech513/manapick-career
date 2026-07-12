import type { MetadataRoute } from "next";
import { categories, publishedJobs } from "@/content/jobs";
import { guides, newsItems } from "@/content/editorial";
import { absoluteUrl } from "@/lib/site";
export const dynamic="force-static";
export default function sitemap():MetadataRoute.Sitemap{const fixed=["/","/route/","/compare/","/ranking/","/skills/","/guide/","/news/","/glossary/","/faq/","/about-method/","/operator/","/privacy/","/affiliate/","/disclaimer/","/contact/","/all/"];return [...fixed.map(url=>({url:absoluteUrl(url),changeFrequency:"monthly" as const,priority:url==="/"?1:0.6})),...categories.map(x=>({url:absoluteUrl(`/category/${x.key}/`),changeFrequency:"monthly" as const,priority:0.7})),...publishedJobs.map(x=>({url:absoluteUrl(`/career/${x.slug}/`),lastModified:new Date(x.checkedAt),changeFrequency:"monthly" as const,priority:0.8})),...guides.map(x=>({url:absoluteUrl(`/guide/${x.slug}/`),lastModified:new Date(x.checkedAt),changeFrequency:"monthly" as const,priority:0.7})),...newsItems.map(x=>({url:absoluteUrl(`/news/${x.slug}/`),lastModified:new Date(x.checkedAt),changeFrequency:"monthly" as const,priority:0.6}))]}
