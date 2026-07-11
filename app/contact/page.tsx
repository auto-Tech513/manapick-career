import type { Metadata } from "next";import { InfoPage } from "@/components/InfoPage";
export const metadata:Metadata={title:"訂正・お問い合わせ",alternates:{canonical:"/contact/"}};
export default function Page(){return <InfoPage eyebrow="Contact" title="訂正・お問い合わせ" lead="承認済みの問い合わせフォームが確認できるまで、入力フォームは公開しません。"><h2>現在の受付状況</h2><p>問い合わせ先は公開前確認中です。未承認のフォームや個人情報を受け取る独自フォームは設置していません。</p><h2>訂正対応</h2><p>訂正依頼を受けた場合は、対象ページを確認中または一時非公開へ切り替え、公式情報を再確認します。自動更新結果を直接公開せず、人のレビュー後だけ再公開します。</p></InfoPage>}
