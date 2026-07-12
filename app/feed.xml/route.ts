import { newsItems } from "@/content/editorial";
import { publishedJobs } from "@/content/jobs";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";
const esc = (value: string) => value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character]!));

export function GET() {
  const news = newsItems.map((item) => `<item><title>${esc(item.title)}</title><link>${absoluteUrl(`/news/${item.slug}/`)}</link><guid>${absoluteUrl(`/news/${item.slug}/`)}</guid><description>${esc(item.summary)}</description><category>${esc(item.kind)}</category><pubDate>${new Date(`${item.publishedAt}T00:00:00+09:00`).toUTCString()}</pubDate></item>`);
  const careers = publishedJobs.map((job) => `<item><title>${esc(job.name)}</title><link>${absoluteUrl(`/career/${job.slug}/`)}</link><guid>${absoluteUrl(`/career/${job.slug}/`)}</guid><description>${esc(job.conclusion.join(" "))}</description><category>職業情報</category><pubDate>${new Date(`${job.checkedAt}T00:00:00+09:00`).toUTCString()}</pubDate></item>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE_NAME}</title><link>${absoluteUrl("/")}</link><description>公式資料を独自に整理した職業情報とキャリアニュース</description>${[...news, ...careers].join("")}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
