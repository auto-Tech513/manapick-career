import type { Metadata } from "next";
import Link from "next/link";
import { NetIncomeSimulator } from "@/components/NetIncomeSimulator";

export const metadata: Metadata = {
  title: "手取りシミュレーター｜年収から手取りの目安を試算",
  description:
    "額面年収から、社会保険料・所得税・住民税を差し引いた手取りの目安を試算します。計算の前提と根拠（国税庁の控除表など）をすべて明示した簡易試算です。",
  alternates: { canonical: "/tools/net-income/" },
};

export default function NetIncomePage() {
  return (
    <div className="page-shell narrow">
      <div className="page-heading">
        <span className="eyebrow">ツール</span>
        <h1>手取りシミュレーター</h1>
        <p>
          職業ページの平均年収は、税金と社会保険料を差し引く前の「額面」です。このページでは、額面年収を入れると
          手取りの目安を試算できます。あくまで前提条件つきの簡易試算で、実際の手取りは勤務先の保険制度や
          控除の状況で変わります。
        </p>
      </div>

      <NetIncomeSimulator />

      <section className="editorial-block">
        <h2>計算の前提</h2>
        <ul>
          <li>給与所得控除は国税庁 No.1410 の令和8年分の表、基礎控除は No.1199 の令和8年分の額（合計所得金額に応じて最大104万円）を使います。</li>
          <li>所得税は速算表の税率で計算し、復興特別所得税（2.1%）を加えます。扶養控除は一般扶養親族1人につき38万円として計算します（特定扶養・配偶者控除・生命保険料控除などは含みません）。</li>
          <li>住民税は基礎控除43万円、扶養控除1人33万円、税率10%、均等割5,000円として計算します。調整控除など細かい控除は含みません。</li>
          <li>社会保険料は年収総額に料率を掛ける簡易計算です。標準報酬月額の等級・上限、賞与の扱いは考慮しません。厚生年金は18.3%（本人半分）、健康保険・介護保険は本人半分、雇用保険は本人負担分のみです。</li>
          <li>65歳以上の介護保険料は給与から引かれる前提ではないため0円にしています（実際は年金などから納付します）。</li>
        </ul>
        <h2>根拠の確認先</h2>
        <ul className="source-list">
          <li><a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm" target="_blank" rel="noopener noreferrer">国税庁 No.1410 給与所得控除</a></li>
          <li><a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm" target="_blank" rel="noopener noreferrer">国税庁 No.1199 基礎控除</a></li>
          <li><a href="https://www.kyoukaikenpo.or.jp/" target="_blank" rel="noopener noreferrer">全国健康保険協会（協会けんぽ）</a></li>
          <li><a href="https://www.nenkin.go.jp/" target="_blank" rel="noopener noreferrer">日本年金機構（厚生年金保険料率）</a></li>
        </ul>
        <p>
          職業ごとの平均年収は<Link href="/ranking/">年収ランキング</Link>や各職業ページで確認できます。
          各職業ページの年収欄からは、その金額を入れた状態でこのシミュレーターを開けます。
        </p>
      </section>
    </div>
  );
}
