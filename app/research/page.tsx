import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, Building2, CircleAlert, Database, SearchCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import sites from "@/content/competitive-landscape.json";
import { newsItems } from "@/content/editorial";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "キャリアデータ室",
  description: "雇用、賃金、学び、AI・DXの一次資料を、示すこと・示さないこと・次に確認することへ分けて読むためのデータ案内です。",
  alternates: { canonical: "/research/" },
  openGraph: { title: "キャリアデータ室 | manapick career", description: "労働市場の数字を、職業順位や転職成功率へ変換せずに読む。", url: absoluteUrl("/research/"), images: [{ url: absoluteUrl("/og.png"), width: 1200, height: 630 }] },
};

const selectedSlugs = ["labor-force-may-2026", "monthly-earnings-may-2026", "wage-structure-2025", "dx-self-assessment-1164-2026", "workplace-learning-ojt-offjt-2025", "employment-whitepaper-2026"];
const method = [
  { icon: Database, title: "示すこと", copy: "誰を、いつ、どの方法で調べた数字か。分子・分母、調査対象、単位を一次資料で確認します。" },
  { icon: CircleAlert, title: "示さないこと", copy: "個人の適性、採用可能性、将来年収、特定企業の働きやすさへ置き換えられない範囲を明記します。" },
  { icon: SearchCheck, title: "次に確認すること", copy: "職種、地域、雇用形態、仕事内容、応募条件へ絞り、行動できる一つの確認へつなげます。" },
];

export default function ResearchPage() {
  const picked = selectedSlugs.map((slug) => newsItems.find((item) => item.slug === slug)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const deepCount = sites.filter((site) => site.reviewDepth === "deep").length;
  const hasPublishedBriefings = picked.length > 0;
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": absoluteUrl("/research/#page"), url: absoluteUrl("/research/"), name: "キャリアデータ室", description: metadata.description, inLanguage: "ja-JP", isPartOf: { "@id": absoluteUrl("/#website") } },
    ...(hasPublishedBriefings ? [{ "@type": "ItemList", itemListElement: picked.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, url: absoluteUrl(`/news/${item.slug}/`) })) }] : []),
  ] };
  return <><JsonLd data={graph} /><div className="page-shell research-page">
    <header className="page-heading research-hero"><span className="eyebrow">career evidence room</span><h1>数字を、焦らせる材料にしない。</h1><p>雇用、賃金、学び、AI・DXの一次資料を、意味・限界・次の確認へ分けます。市場の数字を職業順位やあなたの成功確率には変換しません。</p><div className="research-stats"><span>{newsItems.length ? <><strong>{newsItems.length}</strong>公開中の出典付き解説</> : <><strong>確認中</strong>出典付き解説</>}</span><span><strong>{sites.length}</strong>参照サイト比較</span><span><strong>{deepCount}</strong>主要画面まで確認</span></div></header>
    <section className="research-method" aria-labelledby="research-method-title"><div className="section-heading"><span className="eyebrow">reading protocol</span><h2 id="research-method-title">一つの数字を、三つに分ける</h2></div><div className="research-method-grid">{method.map(({ icon: Icon, title, copy }) => <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="research-latest" aria-labelledby="research-latest-title"><div className="section-heading"><span className="eyebrow">primary-source briefings</span><h2 id="research-latest-title">{hasPublishedBriefings ? `一次資料から読む${picked.length}つの入口` : "一次資料解説は公開前確認中です"}</h2><p>{hasPublishedBriefings ? "公表日の新しさではなく、いま確認したい質問から選べます。" : "自動取得した候補は公開せず、一次資料と全主張を人が確認した記事だけを掲載します。"}</p></div><div className="research-card-grid">{hasPublishedBriefings
      ? picked.map((item) => <Link href={`/news/${item.slug}/`} key={item.slug}><small>{item.kind}・確認 {item.checkedAt}</small><h3>{item.title}</h3><p>{item.answer}</p><span>意味と限界を読む <ArrowRight aria-hidden="true" /></span></Link>)
      : <Link href="/news/"><small>公開準備状況</small><h3>人の確認が完了した記事から公開します。</h3><p>出典、数字の対象範囲、示さないこと、関連リンクまで確認してから公開へ進めます。</p><span>ニュースの公開基準を見る <ArrowRight aria-hidden="true" /></span></Link>}</div><Link className="text-link" href={hasPublishedBriefings ? "/news/" : "/guide/"}>{hasPublishedBriefings ? "公開中のキャリアニュースを見る" : "先に読み方ガイドを見る"} <ArrowRight aria-hidden="true" /></Link></section>
    <section className="research-difference" aria-labelledby="research-difference-title"><div><span className="eyebrow">100-site review</span><h2 id="research-difference-title">100サイトを見て、追加しなかったものもあります。</h2><p>求人応募、個別マッチング、根拠のない年収・将来性順位、診断による適性断定は実装していません。広い職業名録と、人が確認した詳細記事を分け、一次情報から小さな試作へつなぐことを差別化の中心にしました。</p></div><div className="research-principles"><span><Building2 aria-hidden="true" /><strong>求人サービスではない</strong><small>応募・職業紹介・求職者情報の送信なし</small></span><span><BookOpenCheck aria-hidden="true" /><strong>編集と広告を分離</strong><small>報酬額で職業や記事の順番を変えない</small></span><span><BarChart3 aria-hidden="true" /><strong>平均を個人へ直結しない</strong><small>職種・地域・条件へ分けて確認</small></span></div></section>
    <section className="research-next"><div><span className="eyebrow">from evidence to action</span><h2>読んだら、職業の作業を一つ試す。</h2><p>統計を集め続けず、気になる仕事を三候補へ絞り、30〜90分で終わる成果物を作ります。</p></div><div><Link className="button primary" href="/all/">556職業名録へ <ArrowRight aria-hidden="true" /></Link><Link className="button secondary" href="/guide/">読み方ガイドへ</Link></div></section>
  </div></>;
}
