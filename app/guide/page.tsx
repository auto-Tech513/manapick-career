import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { GuideExplorer, type GuideCardItem } from "@/components/GuideExplorer";
import { guides } from "@/content/editorial";
import { absoluteUrl, articleOgUrl } from "@/lib/site";

const title = "迷いを、確認できる手順に変える職業ガイド";
const description = `職業の違い、職業情報の読み方、学ぶ順番、AIと仕事の考え方を、公式出典と確認日付きで整理した${guides.length}本のガイド一覧です。`;
const latestGuideCheck = guides.map((guide) => guide.checkedAt).sort().at(-1) ?? "";
const image = articleOgUrl("guide", "index", `${title}|${guides.length}|${latestGuideCheck}`);
export const metadata: Metadata = { title: "職業ガイド｜職業の違いと仕事の読み方を公式出典で確認", description, alternates: { canonical: "/guide/" }, openGraph: { title, description, url: absoluteUrl("/guide/"), type: "website", siteName: "manapick career", locale: "ja_JP", images: [{ url: image, width: 1200, height: 630, alt: title }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };

const guideTopics = [
  { id: "check", label: "はじめの確認", description: "名前や印象より先に、仕事内容・条件・出典を確認する" },
  { id: "diff", label: "職業の違い", description: "混同しやすい職業の組み合わせを、法律と公式出典で比べる" },
  { id: "try", label: "小さく試す", description: "作業と成果物を小さく試し、経験を言葉にする" },
  { id: "learn", label: "学びを組み立てる", description: "動画・講座・学習時間を、無理のない順番へ整える" },
  { id: "ai", label: "AIと仕事を見直す", description: "変わる作業と人が確認する作業を分けて考える" },
  { id: "qualification", label: "資格・応募へつなぐ", description: "要件と募集条件を一次情報へ戻って確認する" },
] as const;

function topicForCategory(category: string): (typeof guideTopics)[number]["id"] {
  if (category === "職業の違い") return "diff";
  if (["AI活用", "AI検証"].includes(category)) return "ai";
  if (["資格と応募", "資格の確認"].includes(category)) return "qualification";
  if (["学び方", "学習ルート", "学習計画", "学習設計", "動画学習", "上達確認", "講座比較"].includes(category)) return "learn";
  if (["職業を試す", "成果物づくり", "経験の棚卸し", "経験の伝え方"].includes(category)) return "try";
  return "check";
}

function freshLevel(checkedAt: string): number {
  const days = Math.max(0, Math.floor((Date.now() - new Date(`${checkedAt}T00:00:00+09:00`).getTime()) / 86400000));
  if (days <= 45) return 3;
  if (days <= 120) return 2;
  return 1;
}

export default function GuideIndex() {
  const topicsWithGuides = guideTopics.map((topic) => ({
    ...topic,
    guides: guides.filter((guide) => topicForCategory(guide.category) === topic.id),
  })).filter((topic) => topic.guides.length > 0);
  const topics = topicsWithGuides.map((topic) => ({ id: topic.id, label: topic.label, description: topic.description }));
  const items: GuideCardItem[] = guides.map((guide) => ({
    slug: guide.slug,
    title: guide.title,
    category: guide.category,
    topic: topicForCategory(guide.category),
    summary: guide.summary,
    readMinutes: guide.readMinutes,
    checkedAt: guide.checkedAt,
    freshLevel: freshLevel(guide.checkedAt),
    image: `/card/guide/${guide.slug}.png`,
  }));

  const url = absoluteUrl("/guide/");
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", name: title, description, url, inLanguage: "ja-JP", mainEntity: { "@type": "ItemList", numberOfItems: guides.length, itemListElement: guides.map((guide, index) => ({ "@type": "ListItem", position: index + 1, name: guide.title, url: absoluteUrl(`/guide/${guide.slug}/`) })) } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "ガイド", item: url }] },
  ] };

  return <><JsonLd data={graph}/><div className="page-shell editorial-index guide-index-page">
    <nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span>/</span><span aria-current="page">ガイド</span></nav>
    <header className="page-heading">
      <span className="eyebrow">career guide</span>
      <h1>迷いを、確認できる手順に変える。</h1>
      <p>職業名だけで決めず、仕事内容・注意点・出典を読み、次に試す学びへつなげます。すべての記事に先に結論、目次、公式出典、確認日があります。テーマを選ぶと、その場で絞り込めます。各カードには、読む・試す目安の時間と、出典の確認日と新しさを表示します。</p>
    </header>

    <GuideExplorer items={items} topics={topics} />
  </div></>;
}
