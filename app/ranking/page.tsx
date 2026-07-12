import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PopularityRanking } from "@/components/PopularityRanking";
import { popularityMethod, popularityRanking } from "@/content/popularity-ranking";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "人気職業アクセスランキング", description: "厚生労働省job tagのアクセス履歴に基づく人気職業ランキング。職業価値や採用可能性ではなく、関心の入口として10件ずつ表示します。", alternates: { canonical: "/ranking/" } };

export default function RankingPage() {
  return <div className="page-shell ranking-page">
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "人気職業アクセスランキング", numberOfItems: popularityRanking.length, itemListElement: popularityRanking.map((item) => ({ "@type": "ListItem", position: item.rank, name: item.name, url: item.careerSlug ? absoluteUrl(`/career/${item.careerSlug}/`) : absoluteUrl("/all/") })) }} />
    <header className="page-heading"><span className="eyebrow">公式アクセス履歴 × manapick連携</span><h1>人気職業アクセスランキング</h1><p>人気の順序はjob tagのアクセス履歴だけを使います。manapickの動画・AI・資格表示は、次に確認できる情報の有無であり、順位には一切加えていません。</p></header>
    <section className="ranking-method"><div><strong>順位の根拠</strong><p>{popularityMethod.description}</p></div><div><strong>この順位が示さないこと</strong><p>{popularityMethod.limitation}</p></div><a href={popularityMethod.sourceUrl} target="_blank" rel="noopener noreferrer">公式ランキングを確認 <ArrowUpRightIcon /></a><small>最終確認 {popularityMethod.checkedAt}</small></section>
    <PopularityRanking entries={popularityRanking} />
  </div>;
}

function ArrowUpRightIcon() { return <span aria-hidden="true">↗</span>; }
