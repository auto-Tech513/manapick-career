import type { Metadata } from "next";import { InfoPage } from "@/components/InfoPage";
export const metadata:Metadata={title:"免責事項",alternates:{canonical:"/disclaimer/"}};
export default function Page(){return <InfoPage eyebrow="Disclaimer" title="免責事項" lead="このサイトは職業理解と学習入口のための一般的な情報を提供します。"><h2>保証しないこと</h2><p>職業適性、採用可能性、転職、収入、試験合格、学習効果を保証しません。古い情報を「最新」と表示しません。</p><h2>求人・職業紹介</h2><p>求人票、応募ボタン、履歴書登録、企業との連絡仲介、個別求人の推薦は行いません。求職者情報を使ったマッチングを始める場合は、職業安定法上の区分を専門家へ確認するまで実装しません。</p><h2>制度・資格</h2><p>受験資格、費用、試験日、医薬品販売制度などは変更される場合があります。手続き前に必ず所管省庁・実施団体の公式情報を確認してください。</p></InfoPage>}
