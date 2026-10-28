import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import catalog from "@/content/job-catalog.json";
import employersData from "@/content/occupation-employers.json";
import profiles from "@/content/professional-careers.json";
import { NetworkSites } from "@/components/NetworkSites";

export const metadata: Metadata = {
  title: "企業・法人・公的機関の例がある職業一覧",
  description: "各職業について、その仕事を行っている具体的な企業・法人・公的機関の例を公式ページで確認し、出典付きで載せた職業の一覧。募集の継続や採用可能性を示すものではありません。",
  alternates: { canonical: "/employers/" },
};

type EmployerItem = (typeof employersData.items)[number];

export default function EmployersPage() {
  const occupationById = new Map(catalog.occupations.map(item => [item.catalogId, item]));
  const itemsByCategory = new Map<string, EmployerItem[]>();
  for (const item of employersData.items) {
    const occupation = occupationById.get(item.catalogId);
    if (!occupation) continue;
    const list = itemsByCategory.get(occupation.categoryKey) ?? [];
    list.push(item);
    itemsByCategory.set(occupation.categoryKey, list);
  }
  const dossierById = new Map(profiles.items.map(item => [item.recordNumber, item]));
  const dossiers = employersData.existingDossiers
    .map(entry => ({ entry, profile: dossierById.get(entry.catalogId) ?? profiles.items.find(item => item.slug === entry.slug) }))
    .filter(item => item.profile);
  const total = employersData.items.length + dossiers.length;
  return <div className="page-shell employers-page">
    <header className="page-heading"><span className="eyebrow">公式ページで確認した職場の例</span><h1>企業・法人・公的機関の例がある職業</h1>
      <p>556職業のうち、現在 {total} 職業について「その仕事を行っている具体的な企業・法人・公的機関」を各組織の公式ページで確認し、出典付きで職業解説に載せています。この一覧は職場の例の提示であり、募集の継続・採用可能性・推薦を示すものではありません。確認が取れていない職業は載せていません。</p></header>
    {catalog.categories.map(category => {
      const items = itemsByCategory.get(category.key);
      if (!items?.length) return null;
      return <section key={category.key} aria-label={`${category.label}の企業例`} className="employers-group">
        <h2>{category.label}<small>{items.length}職業</small></h2>
        <ul className="employers-list">{items.map(item => {
          const occupation = occupationById.get(item.catalogId);
          if (!occupation) return null;
          return <li key={item.catalogId}>
            <div><h3>{occupation.name}</h3><p>{item.employers.map(employer => employer.name).join("／")}</p></div>
            <Link href="/all/">名録で読む <ArrowUpRight aria-hidden="true" /></Link>
          </li>;
        })}</ul>
      </section>;
    })}
    <section aria-label="詳しい企業例ページがある職業" className="employers-group">
      <h2>詳しい企業例ページがある職業<small>{dossiers.length}職業</small></h2>
      <ul className="employers-list">{dossiers.map(({ entry, profile }) => <li key={entry.catalogId}>
        <div><h3>{profile!.name}</h3><p>仕事内容・資格・年収・企業例を出典付きで整理した専用ページ</p></div>
        <Link href={`/career/${entry.slug}/`}>詳しく読む <ArrowUpRight aria-hidden="true" /></Link>
      </li>)}</ul>
    </section>
    <p className="employers-note">企業例の確認方法：各組織の公式ページ（採用・職種紹介・業務紹介など）を開き、職種名と業務内容が本文にあることを確認しています。確認日は各職業の解説内に記載しています。</p>
    <NetworkSites />
  </div>;
}
