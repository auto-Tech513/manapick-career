import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { EmployerList } from "@/components/EmployerList";
import { NetworkSites } from "@/components/NetworkSites";
import { employerCategories, occupationById } from "@/lib/employers";
import { absoluteUrl } from "@/lib/site";
import "../employers.css";

export const dynamicParams = false;
export function generateStaticParams() { return employerCategories.map(category => ({ key: category.key })); }

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  const category = employerCategories.find(item => item.key === key);
  if (!category) return {};
  const title = `${category.label}の企業・法人・公的機関の例がある職業`;
  const examples = category.items.slice(0, 3).map(item => occupationById.get(item.catalogId)?.name).filter(Boolean).join("・");
  const description = `${category.description}。${examples}など${category.items.length}職業について、公式ページで確認した企業・法人・公的機関の例を出典付きで載せています。各職業の個別ページでは、職場の例とあわせて仕事内容、就くには、関連資格も確認できます。募集の継続や採用可能性を示すものではありません。`;
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
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "企業例のある職業", item: absoluteUrl("/employers/") }, { "@type": "ListItem", position: 3, name: category.label, item: url }] },
  ] };
  const siblings = employerCategories.filter(item => item.key !== key);
  return <><JsonLd data={graph} /><div className="page-shell employers-page">
    <nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span>/</span><Link href="/employers/">企業例のある職業</Link><span>/</span><span aria-current="page">{category.label}</span></nav>
    <header className="page-heading"><span className="eyebrow">公式ページで確認した職場の例</span><h1>{category.label}の企業例がある職業</h1>
      <p>{category.description}。この分野では{category.items.length}職業について、その仕事を行っている具体的な企業・法人・公的機関を各組織の公式ページで確認し、出典付きで載せています。この一覧は職場の例の提示であり、募集の継続・採用可能性・推薦を示すものではありません。</p></header>
    <section aria-label={`${category.label}の企業例`} className="employers-group">
      <EmployerList items={category.items} />
    </section>
    <p className="employers-note">企業例の確認方法：各組織の公式ページ（採用・職種紹介・業務紹介など）を開き、職種名と業務内容が本文にあることを確認しています。確認日は各職業の解説内に記載しています。</p>
    <nav aria-label="他の分野の企業例" className="employers-siblings">
      <h2>他の分野の企業例</h2>
      <ul>{siblings.map(item => <li key={item.key}><Link href={`/employers/${item.key}/`}>{item.label}<small>{item.items.length}職業</small></Link></li>)}</ul>
    </nav>
    <p><Link className="text-link" href="/employers/"><ArrowLeft aria-hidden="true" /> 企業例のある職業の一覧へ戻る</Link></p>
    <NetworkSites />
  </div></>;
}
