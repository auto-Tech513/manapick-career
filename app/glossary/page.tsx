import type { Metadata } from "next";import { InfoPage } from "@/components/InfoPage";
export const metadata:Metadata={title:"キャリア用語集",alternates:{canonical:"/glossary/"}};
const terms=[{"t":"DX","d":"デジタル技術を使い、業務やサービス、組織のあり方を変える取り組み。単なるツール導入とは分けて考えます。"},{"t":"SSOT","d":"Single Source of Truth。情報の正本を1か所に決め、重複や食い違いを防ぐ考え方。"},{"t":"ポートフォリオ","d":"制作物と、目的・担当範囲・判断理由・改善過程をまとめた資料。作品数だけを指しません。"},{"t":"一次情報","d":"制度を所管する省庁、資格実施団体、製品提供会社など、情報の当事者が出した情報。"},{"t":"生成AI","d":"文章・画像・コードなどの候補を生成する技術。出力の正確性や権利、安全性は人が確認します。"}];
export default function Page(){return <InfoPage eyebrow="Glossary" title="キャリア用語集" lead="職業情報を読むときに迷いやすい言葉を、短く整理します。"><dl className="glossary-list">{terms.map(x=><div key={x.t}><dt>{x.t}</dt><dd>{x.d}</dd></div>)}</dl></InfoPage>}
