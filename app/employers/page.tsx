import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NetworkSites } from "@/components/NetworkSites";
import { employerCategories, employerDossiers, employerTotal, occupationById } from "@/lib/employers";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import "./employers.css";

export const metadata: Metadata = {
  title: "企業・法人・公的機関の例がある職業一覧",
  description: "各職業について、その仕事を行っている具体的な企業・法人・公的機関の例を公式ページで確認し、出典付きで載せた職業の一覧。分野別のページから職業ごとの個別ページへ進み、職場の例とあわせて仕事内容や出典を確認できます。募集の継続や採用可能性を示すものではありません。全14分野のカテゴリページから、職業ごとの例へ進めます。",
  alternates: { canonical: "/employers/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { title: "企業・法人・公的機関の例がある職業一覧 | manapick career", description: "公式ページで確認した職場の例を、分野別に職業ごとへ整理した一覧。", url: absoluteUrl("/employers/"), images: [{ url: absoluteUrl("/og.png"), width: 1200, height: 675 }] },
};

export default function EmployersPage() {
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": absoluteUrl("/employers/#page"), url: absoluteUrl("/employers/"), name: "企業・法人・公的機関の例がある職業一覧", inLanguage: "ja-JP", isPartOf: { "@id": absoluteUrl("/#website") }, mainEntity: { "@type": "ItemList", numberOfItems: employerCategories.length, itemListElement: employerCategories.map((category, index) => ({ "@type": "ListItem", position: index + 1, name: `${category.label}の企業例`, url: absoluteUrl(`/employers/${category.key}/`) })) } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "企業例のある職業", item: absoluteUrl("/employers/") }] },
  ] };
  return <><JsonLd data={graph} /><div className="page-shell employers-page">
    <nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span>/</span><span aria-current="page">企業例のある職業</span></nav>
    <header className="page-heading"><span className="eyebrow">公式ページで確認した職場の例</span><h1>企業・法人・公的機関の例がある職業</h1>
      <p>556職業のうち、現在 {employerTotal} 職業について「その仕事を行っている具体的な企業・法人・公的機関」を各組織の公式ページで確認し、出典付きで職業解説に載せています。この一覧は職場の例の提示であり、募集の継続・採用可能性・推薦を示すものではありません。確認が取れていない職業は載せていません。載せていない職業は、公式ページで確認できた例がまだ見つかっていないためで、その職業で働く場が存在しないという意味ではありません。</p></header>
    <section aria-labelledby="employers-howto-title" className="employers-howto">
      <h2 id="employers-howto-title">探し方</h2>
      <ol>
        <li><strong>分野から開く</strong><span>働く対象や作業のイメージに近い分野を、下の一覧から選びます。分野ごとに、その分野の職業と職場の例だけをまとめたページへ進みます。</span></li>
        <li><strong>職業と職場の例を見る</strong><span>各職業には、公式ページで確認した企業・法人・公的機関の例を載せています。企業名からは、その組織の公式情報へ進めます。</span></li>
        <li><strong>職業ページで確かめる</strong><span>個別ページがある職業は、仕事内容・年収の目安・なり方まで出典付きで読めます。職場の例は「その仕事がある場所」の手がかりで、募集の有無は各組織の公式ページで確認してください。</span></li>
      </ol>
    </section>
    <section aria-label="分野別の企業例" className="employers-group">
      <h2>分野から探す<small>{employerCategories.length}分野・{employerCategories.reduce((sum, category) => sum + category.items.length, 0)}職業</small></h2>
      <ul className="employers-list">{employerCategories.map(category => {
        const examples = category.items.slice(0, 3).map(item => occupationById.get(item.catalogId)?.name).filter(Boolean).join("・");
        return <li key={category.key}>
          <div><h3>{category.label}</h3><p>{category.description}。例：{examples}など</p></div>
          <Link href={`/employers/${category.key}/`}>{category.items.length}職業の例を見る <ArrowUpRight aria-hidden="true" /></Link>
        </li>;
      })}</ul>
    </section>
    <section aria-label="詳しい企業例ページがある職業" className="employers-group">
      <h2>詳しい企業例ページがある職業<small>{employerDossiers.length}職業</small></h2>
      <ul className="employers-list">{employerDossiers.map(({ entry, profile }) => <li key={entry.catalogId}>
        <div><h3>{profile!.name}</h3><p>仕事内容・資格・年収・企業例を出典付きで整理した専用ページ</p></div>
        <Link href={`/career/${entry.slug}/`}>詳しく読む <ArrowUpRight aria-hidden="true" /></Link>
      </li>)}</ul>
    </section>
    <p className="employers-note">企業例の確認方法：各組織の公式ページ（採用・職種紹介・業務紹介など）を開き、職種名と業務内容が本文にあることを確認しています。確認日は各職業の解説内に記載しています。</p>
    <NetworkSites />
  </div></>;
}
