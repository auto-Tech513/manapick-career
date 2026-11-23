import { guides, publishedNews } from "@/content/editorial";
import { humanReviewedSlugByOccupation, occupationCatalogCategories, occupationDirectory, publishedOccupationCatalog } from "@/content/catalog";
import profiles from "@/content/professional-careers.json";
import { menuSections } from "@/lib/menu";
import { newsTopic } from "@/lib/news-topics";

/**
 * メニューの検索欄が使う索引（ビルド時に静的ファイルとして書き出す）。
 * 職業はトップの検索欄と同じ行き先・同じ表記。ガイド・ニュース・サイト内ページも含める。
 * n=名前, a=別名, h=行き先, m=補足
 */
export const dynamic = "force-static";

export function GET() {
  const detailedLinks: Record<string, string> = { ...humanReviewedSlugByOccupation, ...Object.fromEntries(profiles.items.map((item) => [item.name, item.slug])) };
  const publishedIdSet = new Set(publishedOccupationCatalog.map((item) => item.catalogId));
  const occupations = occupationDirectory.map((occupation) => {
    const detail = detailedLinks[occupation.name];
    const hasPage = publishedIdSet.has(occupation.catalogId);
    const category = occupationCatalogCategories.find((item) => item.key === occupation.categoryKey)?.label ?? "";
    return {
      n: occupation.name,
      a: occupation.aliases,
      h: detail ? `/career/${detail}/` : hasPage ? `/occupation/${occupation.catalogId}/` : `/all/?q=${encodeURIComponent(occupation.name)}#catalog-title`,
      m: `職業 ・ ${category} ・ ${detail ? "career解説あり" : hasPage ? "個別ページあり" : "職業一覧で見る"}`,
    };
  });
  const pages = menuSections.flatMap((section) => section.items.map((item) => ({ n: item.label, a: [item.description], h: item.href, m: `ページ ・ ${item.description}` })));
  const guideItems = guides.map((guide) => ({ n: guide.title, a: [guide.category], h: `/guide/${guide.slug}/`, m: `ガイド ・ ${guide.category}` }));
  const newsList = publishedNews.map((item) => ({ n: item.title, a: [item.kind, newsTopic(item)], h: `/news/${item.slug}/`, m: `ニュース ・ ${newsTopic(item)} ・ ${item.publishedAt}` }));
  return Response.json({ items: [...pages, ...occupations, ...guideItems, ...newsList] });
}
