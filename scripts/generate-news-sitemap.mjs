import fs from "node:fs";
import path from "node:path";

// Google News sitemap for manapick career, following the same pattern as
// manapick license: only articles inside the 48-hour news window carry
// <news:news> metadata; when none are recent, the latest article is listed
// without news metadata so the urlset is never empty.
const root = process.cwd();
const siteUrl = "https://career.manapick.app";

const expanded = JSON.parse(fs.readFileSync(path.join(root, "content", "news-expanded.json"), "utf8"));
const publication = JSON.parse(fs.readFileSync(path.join(root, "content", "news-publication.json"), "utf8"));
const publishedAtBySlug = new Map(
  (publication.records ?? []).filter((r) => r.publishedAt).map((r) => [r.slug, r.publishedAt]),
);

const tokyoDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const today = tokyoDate.format(new Date());
const cutoff = new Date(`${today}T00:00:00+09:00`);
cutoff.setDate(cutoff.getDate() - 1);
const tomorrow = new Date(`${today}T00:00:00+09:00`);
tomorrow.setDate(tomorrow.getDate() + 1);

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const publishedNews = expanded
  .filter((item) => publishedAtBySlug.has(item.slug))
  .map((item) => ({ slug: item.slug, title: item.title, date: publishedAtBySlug.get(item.slug) }))
  .filter((item) => {
    const published = new Date(`${item.date}T00:00:00+09:00`);
    return !Number.isNaN(published.getTime()) && published < tomorrow;
  })
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "ja"));

const recentNews = publishedNews.filter((item) => {
  const published = new Date(`${item.date}T00:00:00+09:00`);
  return published >= cutoff;
});

const urls = recentNews
  .map(
    (item) => `  <url>
    <loc>${escapeXml(`${siteUrl}/news/${item.slug}/`)}</loc>
    <news:news>
      <news:publication>
        <news:name>manapick career</news:name>
        <news:language>ja</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(item.date)}</news:publication_date>
      <news:title>${escapeXml(item.title)}</news:title>
    </news:news>
  </url>`,
  )
  .join("\n");

// Google permits older URLs to remain after their news metadata is removed.
// Keeping one published URL prevents Search Console from treating an empty
// urlset as a missing required <url> tag between publication days.
const fallbackUrl =
  recentNews.length === 0 && publishedNews[0]
    ? `  <url>
    <loc>${escapeXml(`${siteUrl}/news/${publishedNews[0].slug}/`)}</loc>
    <lastmod>${escapeXml(publishedNews[0].date)}</lastmod>
  </url>`
    : "";

const sitemapUrls = urls || fallbackUrl;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${sitemapUrls}${sitemapUrls ? "\n" : ""}</urlset>
`;

fs.writeFileSync(path.join(root, "public", "news-sitemap.xml"), xml);
console.log(
  `news sitemap generated: ${recentNews.length} recent article(s), ${fallbackUrl ? 1 : 0} metadata-free fallback URL`,
);
