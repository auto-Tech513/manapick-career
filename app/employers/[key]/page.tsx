import type { Metadata } from "next";
import { PhraseChildren } from "@/components/PhraseChildren";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { EmployerList } from "@/components/EmployerList";
import { TransferCards } from "@/components/TransferCards";
import { employerCategories, occupationById } from "@/lib/employers";
import { absoluteUrl } from "@/lib/site";
import { sentencesWithin } from "@/lib/meta-description";
import "../employers.css";
import { PhraseText } from "@/components/PhraseTitle";

export const dynamicParams = false;
export function generateStaticParams() { return employerCategories.map(category => ({ key: category.key })); }

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  const category = employerCategories.find(item => item.key === key);
  if (!category) return {};
  const title = `${category.label}の企業・法人・公的機関の例がある職業`;
  const examples = category.items.slice(0, 3).map(item => occupationById.get(item.catalogId)?.name).filter(Boolean).join("・");
  const description = sentencesWithin([`${category.description}。`, `${examples}など${category.items.length}職業について、公式ページで確認した企業・法人・公的機関の例を出典付きで載せています。`, "各職業の個別ページでは、職場の例とあわせて仕事内容、就くには、関連資格も確認できます。", "募集の継続や採用可能性を示すものではありません。"]);
  return {
    title, description,
    alternates: { canonical: `/employers/${key}/`, types: { "application/rss+xml": "/feed.xml" } },
    openGraph: { title: `${title} | manapick career`, description, url: absoluteUrl(`/employers/${key}/`), images: [{ url: absoluteUrl("/og.png"), width: 1200, height: 675 }] },
  };
}

export default async function EmployerCategoryPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const category = employerCategories.find(item => item.key === key);
  if (!category) notFound();
  const url = absoluteUrl(`/employers/${key}/`);
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": `${url}#page`, url, name: `${category.label}の企業・法人・公的機関の例がある職業`, inLanguage: "ja-JP", isPartOf: { "@id": absoluteUrl("/#website") }, mainEntity: { "@type": "ItemList", numberOfItems: category.items.length, itemListElement: category.items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: occupationById.get(item.catalogId)?.name, url: absoluteUrl(`/occupation/${item.catalogId}/`) })) } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "トップ", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "企業例のある職業", item: absoluteUrl("/employers/") }, { "@type": "ListItem", position: 3, name: category.label, item: url }] },
  ] };
  const siblings = employerCategories.filter(item => item.key !== key);
  return <><JsonLd data={graph} /><div className="page-shell employers-page">
    <nav className="crumb" aria-label="パンくずリスト"><Link href="/">トップ</Link><span aria-hidden="true">／</span><Link href="/employers/">企業例のある職業</Link><span aria-hidden="true">／</span><span aria-current="page">{category.label}</span></nav>
    <header className="phead"><p className="phead-eyebrow"><span className="stn lg" aria-hidden="true">CA</span> CA-LIST · 企業例のある職業</p><h1 className="phrase-breaks"><PhraseText text={`${category.label}の企業例がある職業`} /></h1>
      <p className="phead-lead phrase-breaks"><PhraseChildren>{category.description}。この分野では{category.items.length}職業について、その仕事を行っている具体的な企業・法人・公的機関を各組織の公式ページで確認し、出典付きで載せています。この一覧は職場の例の提示であり、募集の継続・採用可能性・推薦を示すものではありません。</PhraseChildren></p>
      <div className="phead-meta"><span><b>公式ページで確認した職場の例</b>{category.items.length}職業</span></div></header>
    <section aria-label={`${category.label}の企業例`} className="employers-group">
      <EmployerList items={category.items} />
    </section>
    <p className="employers-note">企業例の確認方法：各組織の公式ページ（採用・職種紹介・業務紹介など）を開き、職種名と業務内容が本文にあることを確認しています。確認日は各職業の解説内に記載しています。</p>
    <nav aria-label="他の分野の企業例" className="employers-siblings">
      <div className="sh"><div><p className="sh-k">FIELDS — 分野</p><h2 className="phrase-breaks"><PhraseText text="他の分野の企業例" /></h2></div></div>
      <ul>{siblings.map(item => <li key={item.key}><Link href={`/employers/${item.key}/`}>{item.label}<small>{item.items.length}職業</small></Link></li>)}</ul>
    </nav>
    <p><Link className="text-link" href="/employers/"><ArrowLeft aria-hidden="true" /> 企業例のある職業の一覧へ戻る</Link></p>
    <section className="transfer-sec" aria-label="ほかの駅へ">
      <div className="sh"><div><p className="sh-k">TRANSFER — 乗り換え</p><h2 className="phrase-breaks"><PhraseText text="ほかの駅へ進む" /></h2></div></div>
      <TransferCards cards={[
        { siteId: "license", title: "ITパスポート", description: "仕事につながる資格", href: "https://license.manapick.app/license/it-passport/" },
        { siteId: "manapick", title: "資格の学び方ガイド", description: "無料動画で学ぶ", href: "https://manapick.app/guide/certification/" },
        { siteId: "ai", title: "ChatGPT", description: "仕事で使うAI", href: "https://ai.manapick.app/tool/chatgpt/" },
        { siteId: "company", title: "上場企業ランキング", description: "業界の企業を読む", href: "https://company.manapick.app/ranking/" },
      ]} />
    </section>
  </div></>;
}
