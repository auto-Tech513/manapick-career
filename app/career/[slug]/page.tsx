import { WorkDepth, FitDepth, QualificationDepth, EmployerDepth } from '@/components/CareerDepth';
import { careerDossierBySlug, careerEvidenceById } from '@/lib/career-dossiers';
import claimComparisons from "@/content/claim-verification.json";
import Breadcrumbs from "@/components/Breadcrumbs";
import networkMap from "@/content/network-map-shared.json";
import { NetworkRelations } from "@/components/NetworkRelations";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, CircleAlert, Newspaper } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { PageEvent, TrackedExternalLink } from "@/components/Tracking";
import { publishedNews } from "@/content/editorial";
import { categories, publishedJobs } from "@/content/jobs";
import sourceRegistry from "@/content/source-registry.json";
import { careerInsightBySlug } from "@/lib/career-insights";
import { networkUrl } from "@/lib/network";
import { AiDeepLinks } from "@/components/AiDeepLinks";
import { absoluteUrl, articleOgUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedJobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = publishedJobs.find((item) => item.slug === slug);
  if (!job) return {};
  const title = `${job.name}の仕事内容・向いている人・資格・日本企業の例`;
  const description = `${job.name}は何をする仕事か。具体的な業務と成果物、作業から考える相性、資格の位置づけ、日本企業の公式職種例を、出典とともにcareer内で読めます。`;
  const image = articleOgUrl("career", job.slug, `${job.name}|${job.checkedAt}|career-depth-v2`);
  return {
    title,
    description,
    alternates: { canonical: `/career/${job.slug}/` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/career/${job.slug}/`),
      type: "article",
      siteName: "manapick career",
      locale: "ja_JP",
      modifiedTime: careerDossierBySlug.get(slug)?.researchedAt ?? job.checkedAt,
      images: [{ url: image, width: 1200, height: 630, alt: `${job.name}の仕事内容・違い・転職準備` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CareerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = publishedJobs.find((item) => item.slug === slug);
  const insight = careerInsightBySlug.get(slug);
  const dossier = careerDossierBySlug.get(slug);
  if (!job || !insight || !dossier) notFound();

  const relation = networkMap.relations.find(group => group.id === `career-${job.slug}`);
  const exactVideos = relation?.nodes.filter(node => node.kind === "video") ?? [];
  const category = categories.find((item) => item.key === job.category);
  const sources = sourceRegistry.filter((source) => job.sourceIds.includes(source.sourceId));
  const relatedNews = publishedNews.filter((item) => item.relatedCareerSlugs.includes(job.slug)).slice(0, 3);
  const adjacentJobs = insight.adjacentJobs.map((item) => ({
    ...item,
    job: publishedJobs.find((candidate) => candidate.slug === item.slug),
  })).filter((item) => item.job);
  const url = absoluteUrl(`/career/${job.slug}/`);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: `${job.name}になるには`,
        description: job.conclusion.join(" "),
        url,
        image: articleOgUrl("career", job.slug, `${job.name}|${job.checkedAt}|career-depth-v2`),
        dateModified: dossier.researchedAt,
        inLanguage: "ja-JP",
        author: { "@type": "Organization", name: job.author, url: absoluteUrl("/operator/") },
        editor: { "@type": "Organization", name: job.editor, url: absoluteUrl("/operator/") },
        publisher: { "@id": absoluteUrl("/#organization") },
        mainEntityOfPage: url,
        citation: [...sources.map(source => source.url), ...dossier.sourceIds.flatMap(id => { const source = careerEvidenceById.get(id); return source ? [source.url] : []; })],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: category?.label, item: absoluteUrl(`/category/${job.category}/`) },
          { "@type": "ListItem", position: 3, name: job.name, item: url },
        ],
      },
      {
        "@type": "Occupation",
        name: job.name,
        description: job.conclusion.join(" "),
        mainEntityOfPage: url,
        skills: job.skills.join("、"),
        responsibilities: job.tasks.join("、"),
      },
    ],
  };

  return <>
    <JsonLd data={graph} />
    <PageEvent name="career_open" params={{ career_slug: job.slug }} />
    <div className="detail-shell">
      <Breadcrumbs trail={[{name:"ホーム",path:"/"},{name:category?.label ?? job.category,path:`/category/${job.category}/`},{name:job.name,path:`/career/${job.slug}/`}]} />
      <Link className="back-link" href="/all/"><ArrowLeft aria-hidden="true" /> 職業一覧へ</Link>
      {claimComparisons.filter(record=>record.careerSlug===job.slug).map(record=><aside className="claim-comparison-notice" key={record.id}><h2>制度説明の一部を一次資料と照合</h2><p>AIによる照合記録：{record.verifiedAt}。{record.scope} 人による確認や視聴確認の記録ではありません。</p><ul>{record.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.supportingSummary}</a></li>)}</ul></aside>)}

      <header className="job-hero" id="summary">
        <div className="job-hero-main">
          <span className="category-label"><i className={`category-dot cat-${job.category}`} />{category?.label}</span>
          <h1>{job.name}<small>仕事内容・向いている人・資格・企業例</small></h1>
          <div className="conclusion"><strong>先に結論</strong><p>{job.conclusion[0]}</p><p>{job.conclusion[1]}</p></div>
        </div>
        <aside className="quick-view"><span>入口の見取り図</span><dl><div><dt>学び方</dt><dd>{job.learningLoad}</dd></div><div><dt>入口スキル</dt><dd>{job.entrySkills[0]}</dd></div><div><dt>追加解説の出典照合</dt><dd>{dossier.researchedAt}（AI）</dd></div></dl></aside>
      </header>

      <details className="detail-mobile-toc"><summary>このページの目次</summary><CareerToc /></details>
      <div className="detail-layout">
        <article className="detail-content">
          <section id="work">
            <span className="section-num">01 / WORK & DELIVERABLES</span><h2>どういう仕事？ 実際の業務と成果物</h2>
            <WorkDepth dossier={dossier} />
          </section>
          <FitDepth dossier={dossier} />
          <QualificationDepth dossier={dossier} />
          <EmployerDepth dossier={dossier} />
          <section id="industry">
            <span className="section-num">INDUSTRY / CONTEXT</span><h2>業界で担う役割と、いま確認する変化</h2>
            <div className="insight-lead"><strong>業界での役割</strong><p>{insight.industryRole}</p></div>
            <div className="current-signal"><strong>変化の中で確認すること</strong><p>{insight.currentSignal}</p></div>
          </section>

          <section id="differences">
            <span className="section-num">03 / DIFFERENCES</span><h2>似た職業との違い</h2>
            <p className="section-lead">職業名ではなく、主に担う成果物と責任範囲を比べます。会社によって担当範囲は変わるため、応募先の求人票でも再確認してください。</p>
            <div className="adjacent-grid">{adjacentJobs.map(({ job: adjacent, difference }) => adjacent && <Link key={adjacent.slug} href={`/career/${adjacent.slug}/`}><span>{job.name} と比較</span><strong>{adjacent.name}</strong><p>{difference}</p><em>詳細を見る <ArrowRight aria-hidden="true" /></em></Link>)}</div>
          </section>

          <section id="transition">
            <span className="section-num">04 / TRANSITION</span><h2>転職難易度を左右する条件</h2>
            <p>{insight.transitionSummary}</p>
            <div className="decision-grid"><div><strong>準備を左右する条件</strong><ul>{insight.transitionFactors.map((item) => <li key={item}>{item}</li>)}</ul></div><div><strong>応募前に作る証拠</strong><ul>{insight.evidenceToPrepare.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
            <div className="caution-box"><CircleAlert aria-hidden="true" /><div><strong>先に知っておきたい注意点</strong>{job.cautions.map((item) => <p key={item}>{item}</p>)}</div></div>
          </section>

          <section id="application">
            <span className="section-num">05 / APPLICATION</span><h2>転職と社内での活かし方</h2>
            <div className="application-grid"><div><span>転職活動で</span><ul>{insight.jobChangeUse.map((item) => <li key={item}>{item}</li>)}</ul></div><div><span>いまの職場で</span><ul>{insight.internalUse.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
          </section>

          <section id="learning">
            <span className="section-num">06 / LEARNING</span><h2>必要スキルと学ぶ順番</h2>
            <div className="chips large">{job.skills.map((item) => <span key={item}>{item}</span>)}</div>
            <ol className="learning-steps">{job.learningSteps.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
            <div className="time-note"><strong>学習期間の考え方</strong><p>{job.learningTime}</p></div>
          </section>

          <NetworkRelations site="career" path={`/career/${job.slug}/`} /><section id="next-steps">
            <span className="section-num">07 / NETWORK</span><h2>動画・AI・資格を、仕事へつなぐ</h2>
            <p className="section-lead">動画で作業を学び、AIは確認責任を持って補助に使い、資格は知識の範囲を示す材料として使います。採用や実務能力を保証するものではありません。</p>
            <div className="resource-groups">
              <Resource title="無料動画で学ぶ" tone="blue" items={exactVideos.length ? exactVideos.map(node => ({ label: node.label, href: node.url, description: "対応表で結んだ個別の学習動画" })) : job.videos.map((item) => ({ ...item, href: networkUrl(item.networkId), description: "個別動画の一致がないため学習分野へ" }))} />
              <Resource title="仕事で使うAI" tone="red" items={job.ai.map((item) => ({ label: item.label, href: networkUrl(item.networkId), description: item.use }))} />
              <Resource title="関連資格を確認" tone="green" items={job.qualifications.map((item) => ({ ...item, href: networkUrl(item.networkId), description: "公式要件と試験範囲を確認" }))} empty="必須と断定できる関連資格は設定していません。成果物と仕事の確認手順を優先します。" />
            </div>
            <AiDeepLinks path={`/career/${job.slug}/`} />
            {insight.qualificationUses.length ? <div className="qualification-uses"><h3>licenseをどう活かす？</h3>{insight.qualificationUses.map((item) => { const qualification = job.qualifications.find((candidate) => candidate.networkId === item.networkId); return qualification ? <div key={item.networkId}><Link href={networkUrl(item.networkId)} target="_blank" rel="noopener noreferrer">{qualification.label}<ArrowUpRight aria-hidden="true" /></Link><dl><div><dt>転職で</dt><dd>{item.jobChangeUse}</dd></div><div><dt>社内で</dt><dd>{item.internalUse}</dd></div></dl></div> : null; })}</div> : null}
          </section>

          <section id="news">
            <span className="section-num">08 / RELATED NEWS</span><h2>この職業に関連する公開済みニュース</h2>
            <p className="section-lead">市場全体の数字を個人の採用可能性へ置き換えず、一次資料の範囲と確認日を読んで、次に確かめる条件を決めます。</p>
            {relatedNews.length ? <div className="career-news-grid">{relatedNews.map((item) => <Link key={item.slug} href={`/news/${item.slug}/`}><span><Newspaper aria-hidden="true" />{item.kind}</span><strong>{item.title}</strong><p>{item.summary}</p><small>公開 {item.publishedAt}／確認 {item.checkedAt}</small></Link>)}</div> : <div className="news-empty"><p>この職業へ直接結び付けた公開済みニュースは現在ありません。下書きの記事は表示しません。</p><Link className="button secondary" href="/news/">公開済みニュースを見る</Link></div>}
          </section>

          <section className="editorial-block" id="sources">
            <span className="section-num">09 / SOURCES</span><h2>出典と作成記録</h2><p>仕事内容の追加解説、作業から考える相性、資格の位置づけ、企業例は、公式資料をAIが照合・整理したものです。下記の既存本文の編集記録と、今回の追加解説の照合日は別の記録です。</p><p>追加解説の照合日：{dossier.researchedAt}。現場取材、就業体験、視聴確認の記録は追加していません。</p>
            <dl><div><dt>執筆</dt><dd>{job.author}</dd></div><div><dt>既存本文の編集記録</dt><dd>{job.editor}</dd></div><div><dt>既存本文の記録日</dt><dd>{job.checkedAt}</dd></div><div><dt>作成方法</dt><dd>{job.editorNote}</dd></div></dl>
            <h3>追加解説の根拠</h3><ul className="source-list">{dossier.sourceIds.map(id => {const source=careerEvidenceById.get(id);return source ? <li key={id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.provider}「{source.title}」<ArrowUpRight aria-hidden="true" /></a><small>AI出典照合 {source.accessedAt}／{source.support}</small></li> : null;})}</ul><h3>既存本文の出典</h3><ul className="source-list">{sources.map((source) => <li key={source.sourceId}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.provider}<ArrowUpRight aria-hidden="true" /></a><small>確認日 {source.checkedAt}／{source.notes}</small></li>)}</ul>
            <p>出典URLと記録された確認日を表示しています。自動取得による変化検知は、人による内容確認や視聴確認を意味しません。誤りにお気づきの場合は<Link href="/contact/">訂正窓口</Link>をご利用ください。</p>
          </section>
        </article>

        <aside className="detail-aside"><CareerToc /><div className="daily-action-card"><span>TODAY / 15 MIN</span><strong>今日、一つだけ進める</strong><ol>{insight.dailyActions.map((item) => <li key={item}>{item}</li>)}</ol><Link href="/compare/">ほかの仕事と比較する <ArrowRight aria-hidden="true" /></Link></div></aside>
      </div>
    </div>
  </>;
}

function CareerToc() {
  return <nav aria-label="このページの目次"><strong>このページで分かること</strong><a href="#summary">先に結論</a><a href="#work">仕事内容と成果物</a><a href="#fit">向いている人・相性</a><a href="#qualifications">資格と必要な条件</a><a href="#employers">日本企業の例</a><a href="#industry">業界と変化</a><a href="#differences">似た職業との違い</a><a href="#transition">転職準備の条件</a><a href="#application">転職・社内活用</a><a href="#learning">スキルと学ぶ順番</a><a href="#next-steps">動画・AI・資格</a><a href="#news">関連ニュース</a><a href="#sources">出典と確認方法</a></nav>;
}

function Resource({ title, tone, items, empty }: { title: string; tone: string; items: { label: string; href: string; description: string }[]; empty?: string }) {
  return <div className={`resource-card ${tone}`}><strong>{title}</strong>{items.length ? items.map((item) => <TrackedExternalLink key={item.href} href={item.href} eventLabel={item.label}><span>{item.label}</span><small>{item.description}</small><ArrowUpRight aria-hidden="true" /></TrackedExternalLink>) : <p>{empty}</p>}</div>;
}
