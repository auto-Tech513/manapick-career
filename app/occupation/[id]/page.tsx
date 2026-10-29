import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import {
  catalogCategory,
  occupationDossierSlug,
  occupationEmployers,
  occupationJobTagUrl,
  publishedCatalogOccupation,
  publishedOccupationCatalog,
  publishedOccupationRecord,
} from "@/content/catalog";
import sourceRegistry from "@/content/source-registry.json";
import { incomeMetadata, incomeOccupationByCatalogId, incomeStatisticByCode } from "@/lib/occupation-income";
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
  return `${(yen / 10000).toFixed(1)}万円`;
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
  const description = metaDescription(
    statistic
      ? `${occupation.summary} 年収は${incomeMetadata.surveyYear}年賃金構造基本統計調査の対応分類「${statistic.classificationName}」による平均年収換算で${manYen(statistic.annualizedMeanYen)}。仕事内容、就くには、労働条件、関連資格、公式確認済みの企業例を出典とともに整理します。`
      : `${occupation.summary} 仕事内容、就くには、労働条件、関連資格、公式確認済みの企業例を出典とともに整理します。`,
  );
  const image = occupationOgUrl(id, `${occupation.name}|${record.publishedAt}`);
  return {
    title,
    description,
    alternates: { canonical: `/occupation/${id}/` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/occupation/${id}/`),
      type: "article",
      locale: "ja_JP",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
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
  const dossierSlug = occupationDossierSlug(id);
  const sources = record.officialSourceIds.flatMap((sourceId) => {
    const entry = sourceRegistry.find((item) => item.sourceId === sourceId);
    return entry ? [{ sourceId, title: entry.notes?.split("。")[0] ?? sourceId, url: entry.url, provider: entry.provider }] : [];
  });
  const networkIds = [...record.relatedVideoIds, ...record.relatedQualificationIds, ...record.relatedAiIds];
  const related = publishedOccupationCatalog.filter(
    (item) => item.categoryKey === occupation.categoryKey && item.catalogId !== id,
  );
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
  ];
  const pageUrl = absoluteUrl(`/occupation/${id}/`);
  return (
    <main className="editorial-article">
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
            { "@type": "ListItem", position: 2, name: category?.label ?? "職業", item: absoluteUrl(`/category/${occupation.categoryKey}/`) },
            { "@type": "ListItem", position: 3, name: occupation.name, item: pageUrl },
          ],
        }}
      />
      <Breadcrumbs
        trail={[
          { name: "ホーム", path: "/" },
          { name: category?.label ?? "職業", path: `/category/${occupation.categoryKey}/` },
          { name: occupation.name, path: `/occupation/${id}/` },
        ]}
      />
      <h1>
        {occupation.name}の仕事内容・年収・なり方
      </h1>
      <p className="article-checked">
        出典確認日：{record.checkedAt}／公開日：{record.publishedAt}／分野：{category?.label}
        {occupation.aliases.length ? `／別名：${occupation.aliases.join("、")}` : ""}
      </p>
      <div className="article-answer">
        <p>{occupation.summary}</p>
        {statistic ? (
          <p>
            年収の目安は、{incomeMetadata.surveyYear}年賃金構造基本統計調査の対応分類「{statistic.classificationName}」による平均年収換算で
            <strong>{manYen(statistic.annualizedMeanYen)}</strong>です（この職業単独の統計ではありません）。
          </p>
        ) : (
          <p>この職業には、本サイトの賃金統計に対応する分類がないため、年収換算は示していません。</p>
        )}
      </div>

      <section className="article-section" id="income">
        <h2>収入データの読み方</h2>
        {statistic ? (
          <>
            <p>
              対応分類「{statistic.classificationName}」：平均年収換算 {manYen(statistic.annualizedMeanYen)}／月の現金給与額{" "}
              {statistic.monthlyCashThousandYen}千円／年間賞与その他特別給与額 {statistic.annualBonusThousandYen}千円／平均年齢 {statistic.meanAge}歳。
              計算方法は「{incomeMetadata.formula}」です。
            </p>
            <ul>
              {incomeMetadata.limitations.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>
            {incomeMetadata.surveyYear}年賃金構造基本統計調査には、この職業に対応づけられる分類がありません。公務員など調査の対象外の働き方を含むため、
            本サイトでは年収換算を示さず、金額を推測で補いません。給与水準は、志望先の公式な給与表や募集要項で確認してください。
          </p>
        )}
      </section>

      <section className="article-section" id="work">
        <h2>仕事内容</h2>
        {paragraphs(occupation.work).map((part, index) => (
          <p key={index}>{part}</p>
        ))}
      </section>

      <section className="article-section" id="entry">
        <h2>就くには</h2>
        {paragraphs(occupation.entry).map((part, index) => (
          <p key={index}>{part}</p>
        ))}
      </section>

      <section className="article-section" id="conditions">
        <h2>労働条件の特徴</h2>
        {paragraphs(occupation.conditions).map((part, index) => (
          <p key={index}>{part}</p>
        ))}
      </section>

      {occupation.qualifications.length ? (
        <section className="article-section" id="qualifications">
          <h2>関連資格</h2>
          <ul>
            {occupation.qualifications.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <p>資格の要否と取得経路は、「就くには」の記述と、資格制度の公式情報で確認してください。</p>
        </section>
      ) : null}

      {employers.length ? (
        <section className="article-section" id="employers">
          <h2>企業例・働く場の例（公式確認済み）</h2>
          <p>次の組織は、公式ページで{occupation.name}に関わる職種や採用の案内を確認した例です。募集の有無は時期で変わるため、公式ページで最新を確認してください。</p>
          <ul className="source-list">
            {employers.map((employer) => (
              <li key={`${employer.name}-${employer.role}`}>
                <strong>{employer.name}</strong>（{employer.role}）
                <p>{employer.description}</p>
                <a href={employer.source.url} target="_blank" rel="noopener noreferrer">
                  公式ページ：{employer.source.title}（確認日 {employer.source.checkedAt}） <ArrowUpRight aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="article-section" id="editorial">
        <h2>manapick編集部による確認のポイント</h2>
        {paragraphs(record.uniqueEditorialBody ?? "").map((part, index) => (
          <p key={index}>{part}</p>
        ))}
      </section>

      <section className="article-section" id="faq">
        <h2>よくある確認</h2>
        {faq.map((item) => (
          <div key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </section>

      <section className="article-section" id="network">
        <h2>学びにつなぐ</h2>
        <ul>
          {networkIds.map((itemId) => (
            <li key={itemId}>
              <a href={networkUrl(itemId)} target="_blank" rel="noopener noreferrer">
                {networkLabels[itemId] ?? itemId} <ArrowUpRight aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        {dossierSlug ? (
          <p>
            <Link href={`/career/${dossierSlug}/`}>
              {occupation.name}の詳細解説（career解説）を読む <ArrowRight aria-hidden="true" />
            </Link>
          </p>
        ) : null}
        {related.length ? (
          <>
            <h3>同じ分野の職業ページ</h3>
            <ul>
              {related.map((item) => (
                <li key={item.catalogId}>
                  <Link href={`/occupation/${item.catalogId}/`}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p>
          <Link href="/employers/">企業例のある職業の一覧</Link>／<Link href="/all/">556職業の名録で探す</Link>
        </p>
      </section>

      <section className="article-section" id="sources">
        <h2>出典</h2>
        <ul className="source-list">
          {sources.map((source) => (
            <li key={source.sourceId}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.provider}：{source.title} <ArrowUpRight aria-hidden="true" />
              </a>
            </li>
          ))}
          <li>
            <a href={occupationJobTagUrl(occupation.recordNumber)} target="_blank" rel="noopener noreferrer">
              厚生労働省 job tag：{occupation.name}の職業詳細 <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
        </ul>
        <p className="article-review">
          仕事内容・就くには・労働条件・関連資格の本文は、職業情報提供サイト（job tag）解説系ダウンロードデータ ver.7.01（独立行政法人労働政策研究・研修機構）に基づきます。
          収入は{incomeMetadata.surveyYear}年賃金構造基本統計調査の対応分類による換算で、この職業単独の統計とは限りません。適性や採用可能性は判定しません。
        </p>
      </section>
    </main>
  );
}
