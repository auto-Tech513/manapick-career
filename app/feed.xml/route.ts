import { newsItems } from "@/content/editorial";
import { publishedJobs } from "@/content/jobs";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";
const esc = (value: string) => value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character]!));

export function GET() {
  // ニュースは公開台帳と一致するサイト公開日（publishedAt）の新しい順。職業解説は公開日を持たないため、
  // 確認日を公開日と偽らず pubDate を付けない（RSS 2.0 で pubDate は任意）。
  const sortedNews = [...newsItems].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));
  const news = sortedNews.map((item) => `<item><title>${esc(item.title)}</title><link>${absoluteUrl(`/news/${item.slug}/`)}</link><guid>${absoluteUrl(`/news/${item.slug}/`)}</guid><description>${esc(item.summary)}</description><category>${esc(item.kind)}</category><pubDate>${new Date(`${item.publishedAt}T00:00:00+09:00`).toUTCString()}</pubDate></item>`);
  const careers = publishedJobs.map((job) => `<item><title>${esc(job.name)}</title><link>${absoluteUrl(`/career/${job.slug}/`)}</link><guid>${absoluteUrl(`/career/${job.slug}/`)}</guid><description>${esc(job.conclusion.join(" "))}</description><category>職業情報</category></item>`);
  const description = newsItems.length ? "公式資料を独自に整理した職業情報と、出典付きのキャリアニュース" : "公式資料を独自に整理し、出典と記録日を示す職業情報";
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE_NAME}</title><link>${absoluteUrl("/")}</link><description>${description}</description>${[...news, ...careers].join("")}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
