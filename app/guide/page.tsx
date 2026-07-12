import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, Clock3 } from "lucide-react";
import { guides } from "@/content/editorial";

export const metadata: Metadata = { title: "職業ガイド", description: "職業情報の読み方、学ぶ順番、AIと仕事の考え方を整理したガイドです。", alternates: { canonical: "/guide/" } };

export default function GuideIndex() { return <div className="page-shell editorial-index guide-index-page">
  <header className="page-heading"><span className="eyebrow">career guide</span><h1>迷いを、確認できる手順に変える。</h1><p>職業名だけで決めず、仕事内容・注意点・出典を読み、次に試す学びへつなげます。すべての記事に先に結論、目次、公式出典、確認日があります。</p></header>
  <div className="editorial-index-grid">{guides.map((guide) => <Link className="editorial-index-card" href={`/guide/${guide.slug}/`} key={guide.slug}>
    <span className="editorial-card-icon"><BookOpenText aria-hidden="true" /></span><small>{guide.category}</small><h2>{guide.title}</h2><p>{guide.answer}</p><ul>{guide.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul><span><Clock3 aria-hidden="true" />{guide.readMinutes}分で読める</span><em>読む <ArrowRight aria-hidden="true" /></em>
  </Link>)}</div>
</div> }
