import { categories, publishedJobs } from "@/content/jobs";
import { occupationCatalog } from "@/content/catalog";
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
    `- [job tag出典の${occupationCatalog.length}職業名録](${absoluteUrl("/all/")}): job tag解説系データver.7.01から、職業名・別名・分類・仕事内容・就くには・労働条件・関連団体・関連資格を出典付きで構造化。個別詳細は /occupation/{id}/。`,
    "",
    "## Published careers (human reviewed)",
    ...publishedJobs.map((job) => `- [${job.name}](${absoluteUrl(`/career/${job.slug}/`)}): ${job.conclusion[0]}`),
    "",
    "## Popularity methodology",
    `- [人気職業アクセスランキング](${absoluteUrl("/ranking/")}): ${popularityMethod.description} ${popularityMethod.limitation}`,
    "",
    "## Guides",
    ...guides.map((guide) => `- [${guide.title}](${absoluteUrl(`/guide/${guide.slug}/`)}): ${guide.answer}`),
    "",
    "## Career news",
    ...newsItems.map((item) => `- [${item.title}](${absoluteUrl(`/news/${item.slug}/`)}): ${item.answer}`),
    "",
    "## Categories",
    ...categories.map((category) => `- [${category.label}](${absoluteUrl(`/category/${category.key}/`)}): ${category.description}`),
    "",
    "## Policies",
    `- [career manapi商店](${absoluteUrl("/shop/")}): 学び直し・面接・仕事準備の道具。PRは編集判断と分離。`,
    `- [作成方法・編集方針](${absoluteUrl("/about-method/")})`,
    `- [免責事項](${absoluteUrl("/disclaimer/")})`,
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
