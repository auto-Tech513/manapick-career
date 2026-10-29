import { categories, publishedJobs } from "@/content/jobs";
import { occupationCatalog, publishedOccupationCatalog } from "@/content/catalog";
import { guides, newsItems } from "@/content/editorial";
import { popularityMethod } from "@/content/popularity-ranking";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const lines = [
    "# manapick career",
    "",
    "> 職業の仕事内容・必要スキル・学ぶ順番を公式情報から整理します。適性・採用可能性・年収・将来性は断定しません。",
    "",
    "## Occupation directory",
    `- [job tag出典の${occupationCatalog.length}職業名録](${absoluteUrl("/all/")}): job tag解説系データver.7.01の職業名・別名・分類・概要を検索し、仕事内容・入職条件・労働条件・関連資格をページ内で開ける単一ディレクトリ。配布データと独自解説を区別。適性や採用可能性は判定しません。`,
    "",
    "## Published careers (source-linked)",
    ...publishedJobs.map((job) => `- [${job.name}](${absoluteUrl(`/career/${job.slug}/`)}): ${job.conclusion[0]}`),
    "",
    ...(publishedOccupationCatalog.length ? [
      "## Published occupation pages (source-linked)",
      ...publishedOccupationCatalog.map((occupation) => `- [${occupation.name}](${absoluteUrl(`/occupation/${occupation.catalogId}/`)}): ${occupation.summary}`),
      "",
    ] : []),
    "## Popularity methodology",
    `- [人気職業アクセスランキング](${absoluteUrl("/ranking/")}): ${popularityMethod.description} ${popularityMethod.limitation}`,
    "",
    "## Guides",
    ...guides.map((guide) => `- [${guide.title}](${absoluteUrl(`/guide/${guide.slug}/`)}): ${guide.answer}`),
    "",
    ...(newsItems.length ? [
      "## Career news",
      ...newsItems.map((item) => `- [${item.title}](${absoluteUrl(`/news/${item.slug}/`)}): ${item.answer}`),
      "",
    ] : [
      "## Career news publication status",
      `- [公開準備状況](${absoluteUrl("/news/")}): 出典と掲載条件が記録された記事を案内します。自動取得日時は内容確認日へ転用しません。`,
      "",
    ]),
    "## Evidence room",
    `- [キャリアデータ室](${absoluteUrl("/research/")}): 労働市場の数字を、示すこと・示さないこと・次に確認することへ分けて案内。`,
    "",
    "## Categories",
    ...categories.map((category) => `- [${category.label}](${absoluteUrl(`/category/${category.key}/`)}): ${category.description}`),
    "",
    "## Policies",
    `- [manapi商店](${absoluteUrl("/shop/")}): 学び直し・面接・仕事準備の道具。PRは編集判断と分離。`,
    `- [作成方法・編集方針](${absoluteUrl("/about-method/")})`,
    `- [免責事項](${absoluteUrl("/disclaimer/")})`,
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
