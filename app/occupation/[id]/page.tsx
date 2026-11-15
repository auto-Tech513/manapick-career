import "./occupation.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/AdSlot";
import { AdSenseScript } from "@/components/AdSenseScript";
import { IsoBuilding } from "@/components/IsoBuilding";
import { TransferCards, type TransferCard } from "@/components/TransferCards";
import {
  catalogCategory,
  helloworkSearchUrl,
  occupationAptitude,
  occupationAptitudeDisclosure,
  occupationDossierSlug,
  occupationEmployers,
  occupationJobTagUrl,
  publishedCatalogOccupation,
  publishedOccupationCatalog,
  publishedOccupationRecord,
} from "@/content/catalog";
import sourceRegistry from "@/content/source-registry.json";
import companyLinks from "@/content/company-links.json";
import industryLinks from "@/content/company-industry-links.json";
import licenseLinks from "@/content/license-links.json";
import { ageBandsByCode, ageIncomeNote, formatManYen1dp, incomeMetadata, incomeOccupationByCatalogId, incomeStatisticByCode } from "@/lib/occupation-income";
import { networkUrl } from "@/lib/network";
import { absoluteUrl, metaDescription, occupationOgUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedOccupationCatalog.map((occupation) => ({ id: occupation.catalogId }));
}

const networkLabels: Record<string, string> = {
  "learning:home": "動画で学びを探す",
  "learning:ai": "AIの学びを見る",
  "learning:prog": "プログラミングの学びを見る",
  "learning:data": "データ分析の学びを見る",
  "learning:marketing": "Webマーケティングの学びを見る",
  "learning:video": "動画編集の学びを見る",
  "learning:office": "事務スキルの学びを見る",
  "learning:english": "英語の学びを見る",
  "learning:qualification": "資格の学びを見る",
  "license:home": "資格情報を調べる",
  "license:it-passport": "ITパスポートを調べる",
  "license:fe": "基本情報技術者を調べる",
  "license:g-kentei": "G検定を調べる",
  "license:boki-3": "簿記3級を調べる",
  "license:toeic-lr": "TOEICを調べる",
  "license:mos": "MOSを調べる",
  "license:webdesign-3": "ウェブデザイン技能検定を調べる",
  "license:touroku-hanbai": "登録販売者を調べる",
  "license:kaigo-fukushi": "介護福祉士を調べる",
  "ai:home": "AIツールを調べる",
  "ai:chatgpt": "ChatGPTの使い方を見る",
  "ai:copilot": "Copilotの使い方を見る",
  "ai:github-copilot": "GitHub Copilotの使い方を見る",
  "ai:notebooklm": "NotebookLMの使い方を見る",
  "ai:canva": "Canvaの使い方を見る",
  "ai:deepl": "DeepLの使い方を見る",
};

function paragraphs(text: string) {
  return text
    .split(/\n+/)
    .map((part) => part.replace(/^\s+|\s+$/g, ""))
    .filter(Boolean);
}

function manYen(yen: number) {
  return `${formatManYen1dp(yen)}万円`;
}

function occupationIncome(catalogId: string) {
  const entry = incomeOccupationByCatalogId.get(catalogId);
  if (!entry || entry.status !== "available" || !entry.classificationCode) return null;
  return incomeStatisticByCode.get(entry.classificationCode) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const occupation = publishedCatalogOccupation(id);
  const record = publishedOccupationRecord(id);
  if (!occupation || !record) return {};
  const statistic = occupationIncome(id);
  const title = statistic
    ? `${occupation.name}の仕事内容・年収・なり方｜企業例と資格を公式出典で確認`
    : `${occupation.name}の仕事内容・なり方・資格｜企業例と公式出典`;
  const workText = occupation.work.replace(/\s+/g, " ").trim();
  const summaryText = occupation.summary.replace(/\s+/g, " ").trim();
  const entryText = occupation.entry.replace(/\s+/g, " ").trim();
  const bodySource = `${workText.startsWith(summaryText) ? workText : `${summaryText}${workText}`}${entryText}`;
  const description = metaDescription(
    statistic
      ? `${occupation.name}の年収は、${incomeMetadata.surveyYear}年賃金構造基本統計調査の対応分類「${statistic.classificationName}」による平均年収換算で${manYen(statistic.annualizedMeanYen)}。同調査での平均年齢は${statistic.meanAge}歳です。仕事内容、就くには、労働条件、関連資格、公式確認済みの企業例を出典つきで掲載します。${bodySource}`
      : `${occupation.name}の仕事内容、就くには、労働条件、関連資格、公式確認済みの企業例を出典つきで掲載します。${bodySource}`,
  );
  const image = occupationOgUrl(id, `${occupation.name}|${record.publishedAt}`);
  return {
    title,
    description,
    alternates: { canonical: `/occupation/${id}/`, types: { "application/rss+xml": "/feed.xml" } },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/occupation/${id}/`),
      type: "article",
      locale: "ja_JP",
      images: [{ url: image, width: 1200, height: 675, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function OccupationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const occupation = publishedCatalogOccupation(id);
  const record = publishedOccupationRecord(id);
  if (!occupation || !record) notFound();
  const category = catalogCategory(occupation.categoryKey);
  const statistic = occupationIncome(id);
  const employers = occupationEmployers(id);
  const aptitude = occupationAptitude(id);
  const dossierSlug = occupationDossierSlug(id);
  const sources = record.officialSourceIds.flatMap((sourceId) => {
    const entry = sourceRegistry.find((item) => item.sourceId === sourceId);
    return entry ? [{ sourceId, title: entry.notes?.split("。")[0] ?? sourceId, url: entry.url, provider: entry.provider }] : [];
  });
  const networkIds = [...record.relatedVideoIds, ...record.relatedQualificationIds, ...record.relatedAiIds];
  const related = publishedOccupationCatalog.filter(
    (item) => item.categoryKey === occupation.categoryKey && item.catalogId !== id,
  );
  const industryEntry = (industryLinks.occupations as unknown as Record<string, { industries: Array<{ name: string; total: number; directoryUrl?: string }>; companies: Array<{ name: string; code: string; slug: string }> }>)[id];
  const licenseEntries = ((licenseLinks.occupations as unknown as Record<string, Array<{ name: string; slug: string }>>)[id] ?? []);
  const faq = [
    {
      question: `${occupation.name}の年収はどのくらいですか`,
      answer: statistic
        ? `${incomeMetadata.surveyYear}年賃金構造基本統計調査で${occupation.name}に対応する分類「${statistic.classificationName}」の平均年収換算は${manYen(statistic.annualizedMeanYen)}です。${incomeMetadata.limitations[0]}`
        : `本サイトの賃金統計（${incomeMetadata.surveyYear}年賃金構造基本統計調査）には${occupation.name}に対応する分類がないため、年収換算は示していません。金額を推測で補うことはしません。`,
    },
    {
      question: `${occupation.name}はどんな仕事ですか`,
      answer: occupation.summary,
    },
    {
      question: `${occupation.name}になるにはどうすればよいですか`,
      answer: paragraphs(occupation.entry)[0] ?? occupation.entry,
    },
    {
      question: `${occupation.name}に必要な資格はありますか`,
      answer: occupation.qualifications.length
        ? `関連資格として ${occupation.qualifications.join("、")} が挙げられます。要否と取得経路は、このページの「就くには」と公式情報で確認してください。`
        : `この職業の解説では、入職に必須の資格は示されていません。学歴や資格の要否は、このページの「就くには」と公式情報で確認してください。`,
    },
    ...(statistic
      ? [
          {
            question: `${occupation.name}の平均年齢はどのくらいですか`,
            answer: `${incomeMetadata.surveyYear}年賃金構造基本統計調査で${occupation.name}に対応する分類「${statistic.classificationName}」の平均年齢は${statistic.meanAge}歳です。`,
          },
          {
            question: `示されている年収は中央値ですか`,
            answer: `いいえ。本サイトの金額は「${incomeMetadata.formula}」で計算した平均年収換算であり、年収の中央値ではありません。平均は高収入層の影響を受けるため、典型的な一人分の収入と一致するとは限りません。`,
          },
        ]
      : []),
  ];
  const pageUrl = absoluteUrl(`/occupation/${id}/`);
  const tocSections = [
    { id: "work", label: "仕事内容" },
    { id: "income", label: "年収の目安" },
    ...(aptitude ? [{ id: "aptitude", label: "向いている作業" }] : []),
    { id: "entry", label: "就くには" },
    { id: "conditions", label: "労働条件の特徴" },
    ...(occupation.qualifications.length ? [{ id: "qualifications", label: "関連資格" }] : []),
    { id: "employers", label: "企業例" },
    ...(industryEntry ? [{ id: "industry-companies", label: "関連業種の上場企業" }] : []),
    { id: "editorial", label: "編集部の確認ポイント" },
    { id: "faq", label: "よくある確認" },
    { id: "sources", label: "出典" },
  ];
  const num = (sectionId: string) => String(tocSections.findIndex((s) => s.id === sectionId) + 1).padStart(2, "0");
  const firstVideo = networkIds.find((itemId) => itemId.startsWith("learning:"));
  const firstAi = networkIds.find((itemId) => itemId.startsWith("ai:"));
  const transferCards: TransferCard[] = [
    {
      siteId: "license",
      title: licenseEntries.length ? licenseEntries[0].name : "ITパスポート",
      description: "この仕事につながる資格",
      href: licenseEntries.length
        ? `https://license.manapick.app/license/${licenseEntries[0].slug}/`
        : "https://license.manapick.app/license/it-passport/",
    },
    {
      siteId: "manapick",
      title: firstVideo ? (networkLabels[firstVideo] ?? "関連する学びの動画") : "資格の学び方を動画で",
      description: "見る順番つき",
      href: firstVideo ? networkUrl(firstVideo) : "https://manapick.app/guide/certification/",
    },
    {
      siteId: "ai",
      title: firstAi ? (networkLabels[firstAi] ?? "AIツールを調べる") : "ChatGPTの使い方を見る",
      description: "この職種で使うAI",
      href: firstAi ? networkUrl(firstAi) : "https://ai.manapick.app/tool/chatgpt/",
    },
    {
      siteId: "company",
      title: industryEntry?.industries[0] ? `${industryEntry.industries[0].name}の企業` : "上場企業のランキング",
      description: "業界の企業を読む",
      href: industryEntry?.industries.find((industry) => industry.directoryUrl)?.directoryUrl ?? "https://company.manapick.app/ranking/",
    },
  ];
  return (
    <div className="occupation-article">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${occupation.name}の仕事内容・年収・なり方`,
          description: occupation.summary,
          datePublished: record.publishedAt,
          dateModified: record.checkedAt,
          author: { "@type": "Organization", name: record.author },
          mainEntityOfPage: pageUrl,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "トップ", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "職業を探す", item: absoluteUrl("/all/") },
            { "@type": "ListItem", position: 3, name: occupation.name, item: pageUrl },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Occupation",
          name: occupation.name,
          description: occupation.summary,
          mainEntityOfPage: pageUrl,
          ...(category?.label ? { occupationalCategory: category.label } : {}),
          ...(occupation.qualifications.length ? { skills: occupation.qualifications.join("、") } : {}),
        }}
      />
      <AdSenseScript />
      <div className="occ-wrap">
        <nav className="occ-crumb" aria-label="パンくず">
          <Link href="/">トップ</Link>
          <span aria-hidden="true">／</span>
          <Link href="/all/">職業を探す</Link>
          <span aria-hidden="true">／</span>
          <span aria-current="page">{occupation.name}</span>
        </nav>
        <header className="occ-jh">
          <div>
            <p className="occ-eyebrow">
              <span className="stn lg" aria-hidden="true">CA</span>
              <span>CA-JOB · {category?.label}</span>
            </p>
            <h1>
              <mark>{occupation.name}</mark>の仕事
            </h1>
            <p className="occ-lead">{occupation.summary}</p>
            <p className="occ-meta">
              出典確認日：{record.checkedAt}／公開日：{record.publishedAt}
              {occupation.aliases.length ? `／別名：${occupation.aliases.join("、")}` : ""}
            </p>
            <div className="occ-chips">
              <a href="#work">仕事内容</a>
              {occupation.qualifications.length ? <a href="#qualifications">必要な資格</a> : null}
              <a href="#income">年収の目安</a>
              {aptitude ? <a href="#aptitude">向いている作業</a> : null}
              <a href="#employers">企業例</a>
            </div>
          </div>
          <div className="occ-ill" aria-hidden="true">
            <IsoBuilding categoryKey={occupation.categoryKey} />
          </div>
        </header>
        <div className="occ-lay">
          <nav className="occ-toc" aria-label="このページの目次">
            <p className="occ-toc-h">CONTENTS</p>
            {tocSections.map((section, index) => (
              <a key={section.id} href={`#${section.id}`} className={index >= 4 ? "sp-x" : undefined}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                {section.label}
              </a>
            ))}
          </nav>
          <div className="occ-prose">
            <section className="occ-sec" id="work">
              <h2><i>{num("work")}</i>仕事内容</h2>
              {paragraphs(occupation.work).map((part, index) => (
                <p key={index}>{part}</p>
              ))}
            </section>

            <AdSlot unit="career" placement="occupation-after-work" />

            <section className="occ-sec" id="income">
              <h2><i>{num("income")}</i>年収の目安</h2>
              {statistic ? (
                <>
                  <div className="occ-wage">
                    <div className="occ-wage-amt">
                      <b>{formatManYen1dp(statistic.annualizedMeanYen)}</b>
                      <small>万円</small>
                    </div>
                    <p>
                      {incomeMetadata.surveyYear}年の賃金構造基本統計調査。対応分類「{statistic.classificationName}」の平均年収換算で、
                      {occupation.name}だけの値ではありません。税・社会保険料控除前。対象範囲と出典は下に表示。
                    </p>
                  </div>
                  <table className="occ-table">
                    <tbody>
                      <tr>
                        <th scope="row">月の現金給与額</th>
                        <td className="n">{statistic.monthlyCashThousandYen}千円</td>
                      </tr>
                      <tr>
                        <th scope="row">年間賞与・特別給与</th>
                        <td className="n">{statistic.annualBonusThousandYen}千円</td>
                      </tr>
                      <tr>
                        <th scope="row">平均年齢</th>
                        <td className="n">{statistic.meanAge}歳</td>
                      </tr>
                      <tr>
                        <th scope="row">推計労働者数</th>
                        <td className="n">{statistic.estimatedWorkers.toLocaleString("ja-JP")}人</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="occ-note">
                    平均年齢と労働者数は、年収と同じ賃金統計の対応分類の値です。職業そのものの値とは限りません。
                    統計の対象は{incomeMetadata.population}の集計です。
                  </p>
                  <p>
                    <a href={`/tools/net-income/?yen=${statistic.annualizedMeanYen}`}>この年収の手取りを試算する</a>
                    （社会保険料・所得税・住民税を引いた目安。計算の前提はリンク先に明示しています）
                  </p>
                  <details className="occ-method">
                    <summary>計算方法と統計の対象</summary>
                    <p>計算方法は「{incomeMetadata.formula}」です。</p>
                    {incomeMetadata.limitations.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </details>
                  {(ageBandsByCode.get(statistic.classificationCode) ?? []).length >= 3 ? (
                    <div className="occ-agebands">
                      <h3>年代別の平均年収換算（対応分類「{statistic.classificationName}」）</h3>
                      <table className="occ-table">
                        <thead>
                          <tr>
                            <th scope="col">年齢階級</th>
                            <th scope="col">平均年収換算</th>
                            <th scope="col">推計労働者数</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(ageBandsByCode.get(statistic.classificationCode) ?? []).map((band) => (
                            <tr key={band.band}>
                              <th scope="row">{band.band}</th>
                              <td className="n">{formatManYen1dp(band.annualizedMeanYen)}万円</td>
                              <td className="n">{band.estimatedWorkers != null ? `${band.estimatedWorkers.toLocaleString("ja-JP")}人` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="occ-note">
                        {ageIncomeNote}出典は同じ調査の第5表（年齢階級別）です。労働者数が少ない階級は、少数の人の値に左右されます。
                      </p>
                    </div>
                  ) : null}
                </>
              ) : (
                <p>
                  {incomeMetadata.surveyYear}年賃金構造基本統計調査には、この職業に対応づけられる分類がありません。公務員など調査の対象外の働き方を含む職業です。
                  給与水準は、志望先の公式な給与表や募集要項に載っています。金額を推測で補うことはしません。
                </p>
              )}
            </section>

            {aptitude ? (
              <section className="occ-sec" id="aptitude">
                <h2><i>{num("aptitude")}</i>向いている作業</h2>
                {aptitude.paragraphs.map((part, index) => (
                  <p key={index}>{part}</p>
                ))}
                <p className="occ-note">{occupationAptitudeDisclosure}</p>
              </section>
            ) : null}

            <section className="occ-sec" id="entry">
              <h2><i>{num("entry")}</i>就くには</h2>
              {paragraphs(occupation.entry).map((part, index) => (
                <p key={index}>{part}</p>
              ))}
              <p className="occ-action">
                実際の求人・募集の状況は、厚生労働省の職業情報サイトで確認できます：
                <a href={occupationJobTagUrl(occupation.recordNumber)} target="_blank" rel="noopener noreferrer">
                  job tagで{occupation.name}の職業詳細を見る <ArrowUpRight aria-hidden="true" />
                </a>
              </p>
              <p className="occ-action">
                現在募集中の求人は、ハローワークの求人検索でも確認できます。リンク先は検索の入口です（ハローワークの検索は条件をURLで共有できないため、開いた先でフリーワードに「{occupation.name}」と入力して検索してください）：
                <a href={helloworkSearchUrl} target="_blank" rel="noopener noreferrer">
                  ハローワーク求人検索を開く <ArrowUpRight aria-hidden="true" />
                </a>
              </p>
            </section>

            <section className="occ-sec" id="conditions">
              <h2><i>{num("conditions")}</i>労働条件の特徴</h2>
              {paragraphs(occupation.conditions).map((part, index) => (
                <p key={index}>{part}</p>
              ))}
            </section>

            {occupation.qualifications.length ? (
              <section className="occ-sec" id="qualifications">
                <h2><i>{num("qualifications")}</i>関連資格</h2>
                <ul className="occ-qlist">
                  {occupation.qualifications.map((name) => {
                    const slug = licenseEntries.find((entry) => entry.name === name)?.slug;
                    return (
                      <li key={name}>
                        {slug ? (
                          <a href={`https://license.manapick.app/license/${slug}/`} target="_blank" rel="noopener noreferrer">
                            {name} <ArrowUpRight aria-hidden="true" />
                          </a>
                        ) : (
                          name
                        )}
                      </li>
                    );
                  })}
                </ul>
                {licenseEntries.length ? (
                  <p>リンクのある資格は、manapick license の資格ページで合格率・受験料・学習範囲を確認できます。</p>
                ) : null}
                <p>資格の要否と取得経路は、「就くには」の記述と、資格制度の公式情報で確認してください。</p>
              </section>
            ) : null}

            <section className="occ-sec" id="employers">
              <h2><i>{num("employers")}</i>企業例</h2>
              {employers.length ? (
                <>
                  <p>次の組織は、公式ページで{occupation.name}に関わる職種や採用の案内を確認した例です。最新の募集状況は各公式ページに載っています。</p>
                  <div className="occ-co2">
                    {employers.map((employer) => {
                      const company = (companyLinks.links as unknown as Record<string, { companyName: string; code: string; url: string }>)[employer.name];
                      return (
                        <div className="occ-co" key={`${employer.name}-${employer.role}`}>
                          <b>{employer.name}（{employer.role}）</b>
                          <p>{employer.description}</p>
                          <span className="occ-co-links">
                            <a href={employer.source.url} target="_blank" rel="noopener noreferrer">
                              公式ページ：{employer.source.title}（確認日 {employer.source.checkedAt}） <ArrowUpRight aria-hidden="true" />
                            </a>
                            {company ? (
                              <a href={company.url} target="_blank" rel="noopener noreferrer">
                                企業情報：{company.companyName}（証券コード {company.code}） <ArrowUpRight aria-hidden="true" />
                              </a>
                            ) : null}
                          </span>
                          <span className="occ-co-note">業務説明の例であり、順位や採用可能性を示すものではない</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p>この職業については、公式ページで職種名と仕事内容を確認できた企業例がまだ見つかっていないため、掲載していません。企業例は、各組織の公式ページ（採用・職種紹介・業務紹介など）で確認できたものだけを、出典と確認日つきで載せています。確認できたものから追加します。</p>
                  <p>企業例がないのは、この職業で働く場が存在しないという意味ではありません。</p>
                </>
              )}
              <p className="occ-more-links">
                <Link href="/employers/">企業例のある職業の一覧</Link>
                <Link href="/all/">職業の名録で探す</Link>
              </p>
            </section>

            {industryEntry ? (
              <section className="occ-sec" id="industry-companies">
                <h2><i>{num("industry-companies")}</i>関連業種の上場企業</h2>
                <p>
                  以下は、この職業と関連する業種（{industryEntry.industries.map((industry) => industry.name).join("、")}）に分類される上場企業の一部です。各社の直近決算の売上高が確認できる範囲で、大きい順に{industryEntry.companies.length}社まで表示しています。各社の事業内容は manapick company の企業ページで確認できます。
                </p>
                <p>
                  この一覧は、日本取引所グループの業種分類（東証上場銘柄一覧・2026年9月30日時点）に基づく関連表示で、各社がこの職業の採用を行っていることを示すものではありません。{employers.length ? "採用・募集の確認済みの例は、上の「企業例」をご覧ください。" : null}
                </p>
                <ul className="occ-colist">
                  {industryEntry.companies.map((company) => (
                    <li key={company.code}>
                      <a href={`https://company.manapick.app/company/${company.slug}/`} target="_blank" rel="noopener noreferrer">
                        {company.name}（証券コード {company.code}） <ArrowUpRight aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
                {industryEntry.industries.filter((industry) => industry.directoryUrl).map((industry) => (
                  <p key={industry.name}>
                    <a href={industry.directoryUrl} target="_blank" rel="noopener noreferrer">
                      {industry.name}の上場企業（全{industry.total}社）を manapick company で見る <ArrowUpRight aria-hidden="true" />
                    </a>
                  </p>
                ))}
              </section>
            ) : null}

            <section className="occ-sec" id="editorial">
              <h2><i>{num("editorial")}</i>編集部の確認ポイント</h2>
              {paragraphs(record.uniqueEditorialBody ?? "").map((part, index) => (
                <p key={index}>{part}</p>
              ))}
            </section>

            <section className="occ-sec" id="faq">
              <h2><i>{num("faq")}</i>よくある確認</h2>
              <div className="occ-faq">
                {faq.map((item, index) => (
                  <details key={item.question}>
                    <summary>
                      <span className="occ-faq-q">
                        <i>Q{index + 1}</i>
                        {item.question}
                      </span>
                      <span className="occ-faq-tg" aria-hidden="true" />
                    </summary>
                    <div className="occ-faq-a">
                      <i aria-hidden="true">A</i>
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <section className="occ-sec" id="sources">
              <h2><i>{num("sources")}</i>出典</h2>
              <div className="occ-src">
                <ul>
                  {sources.map((source) => (
                    <li key={source.sourceId}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.provider}：{source.title}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a href={occupationJobTagUrl(occupation.recordNumber)} target="_blank" rel="noopener noreferrer">
                      厚生労働省 job tag：{occupation.name}の職業詳細
                    </a>
                  </li>
                </ul>
              </div>
              <p className="occ-note">
                仕事内容・就くには・労働条件・関連資格の本文は、職業情報提供サイト（job tag）解説系ダウンロードデータ ver.7.01（独立行政法人労働政策研究・研修機構）に基づきます。
                収入は{incomeMetadata.surveyYear}年賃金構造基本統計調査の対応分類による平均年収換算です。
              </p>
            </section>
          </div>
          <aside className="occ-side">
            <div className="occ-box2 occ-box2-y">
              <h3>近い仕事と比べる</h3>
              <p>{related.length ? `${related.slice(0, 2).map((item) => item.name).join("・")}と並べて読む` : "職業を並べて比べる"}</p>
              <Link className="occ-pill" href="/compare/">比較を始める →</Link>
            </div>
            <div className="occ-box2">
              <h3>手取りを試算</h3>
              <Link className="occ-simrow" href={statistic ? `/tools/net-income/?yen=${statistic.annualizedMeanYen}` : "/tools/net-income/"}>
                <span className="occ-yen" aria-hidden="true">¥</span>
                手取りシミュレーター
              </Link>
            </div>
            {dossierSlug ? (
              <div className="occ-box2">
                <h3>深掘り解説</h3>
                <p>{occupation.name}の向いている人・企業例まで読む</p>
                <Link className="occ-pill occ-pill-w" href={`/career/${dossierSlug}/`}>解説を読む →</Link>
              </div>
            ) : null}
            {related.length ? (
              <div className="occ-box2">
                <h3>同じ分野の職業</h3>
                {related.slice(0, 6).map((item) => (
                  <Link key={item.catalogId} className="occ-row" href={`/occupation/${item.catalogId}/`}>
                    {item.name}
                  </Link>
                ))}
                <Link className="occ-row" href="/all/">職業一覧で探す</Link>
              </div>
            ) : null}
          </aside>
        </div>
        <section className="occ-transfer" aria-labelledby="occ-transfer-title">
          <div className="occ-sh">
            <div>
              <span className="occ-sh-k">TRANSFER</span>
              <h2 id="occ-transfer-title">乗り換えて、次へ。</h2>
            </div>
          </div>
          <TransferCards cards={transferCards} />
        </section>
      </div>
    </div>
  );
}
