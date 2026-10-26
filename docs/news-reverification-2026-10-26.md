# ニュース・ガイド根拠の再確認（2026-10-26）

## 背景
- 雇用統計・賃金系ニュース11本が鮮度期限（45日）を超え、`main` を再ビルドすると公開中の11ページが出力から消える状態だった（sitemap 70→59）。
- 残りの公開ニュースも2026-11-09〜11の120日期限が近い。

## 一次資料で確認した結果（公開30本）
| 記事 | 確認した一次資料 | 結果 |
|---|---|---|
| job-openings-may-2026 | 厚労省 一般職業紹介状況（令和8年5月分、6/30） | 1.17倍・前月比0.01pt低下 一致 |
| labor-force-may-2026 / labor-market-three-indicators-2026 | 統計局 統計メールニュースNo.1877（6/30）、8月分結果概要の前月差表 | 就業者6,890万人(+52)、完全失業者185万人(+2)、2.5%前月同率 一致。出典URLを最新月ページから固定の公表記録へ変更 |
| monthly-earnings / nominal-real / working-hours | 毎月勤労統計 5月分速報（7/7）・確報（7/24） | 一致。確報公表を追記 |
| wage-structure-2025 / wages-by-employment-type-2025 | 令和7年賃金構造基本統計調査（6月分賃金、3/24公表は社労士サイトの公表記録で確認） | 一致 |
| long-working-hours-2025 | リクルートワークス研究所 働き方の定点観測2025（6/4） | 5.1%一致。指標名を出典どおり「法定外労働時間45時間以上の割合（雇用者・12月時点）」へ修正 |
| workplace-learning-ojt-offjt-2025 / job-change-hope-reality-gap-2025 | 同上 | 22.0%・24.8%・11.8%・2.7pt一致。「経験率」を出典の「実施割合」へ修正 |
| japan-labor-chartbook-june-2026 | Indeed Hiring Lab（6/25） | 一致。「通常賃金」を出典の「所定内給与（毎月勤労統計）」へ修正 |
| overwork-compensation-2025 | 厚労省 令和7年度過労死等の労災補償状況（7/15） | 約25の数値すべて一致 |
| manufacturing-midcareer-hiring-2026 | JILPT 2026-05-27 プレスリリースPDF | 数値（69.0/50.5/36.2/19.5）は一致。**対象の誤りを修正**：有効回答4,342社のうち人材不足と答えた3,092社への「人手不足への対応方法」の質問で、「製造業3,092社」「今後強化する人材確保策」ではない |
| telework-2016-2024 | 日本労働研究雑誌2026年5月号 No.790（久米・萩原） | 比較内容一致。**出所の誤りを修正**（JILPT独自調査ではなく、JPSEDはリクルートワークス研究所）。旧URLが404のため論文PDFへ変更 |
| ai-explanation-survey-2000-2026 | IPA 2026-06-01 報告書PDF | 2,000人・2026年3月13〜24日・4区分一致。回答者定義を「AIを業務で利用する従業員・経営者・自営業者」へ修正 |
| dx-indicator-2026-revision / dx-self-assessment-1164-2026 | IPA 2026-02-13・2026-05-15プレス、DX推進指標ページ | 一致。公式名称でない「2026年版」を「2026年2月の改訂」へ修正。2026-09-18からWebフォーム提出へ移行を追記 |
| ipa-dx-trends-2026 | IPA 2026-07-16 ポイントPDF、DX動向2026ページ | 全数値一致。報告書が7/30に公開済みである旨へ更新 |
| future-of-work-whitepaper-2026 | コンソーシアム白書ページ（3/30、41社・団体） | 一致。出典表記「2周目の壁」へ統一 |
| care-worker-exam-39 | 厚労省 7/21公告概要、試験センター 9/3お知らせ | 一致。受付終了を追記 |
| digital-skills-standard-v2-2026 | IPA 2026-04-16プレス | 一致。公表主体を「経済産業省とIPA」へ修正 |
| その他（dx-award, digital-talent-ai-era, human-investment-panel, employment-whitepaper, digital-skills-across-occupations, labor-data-before-career-decision, ai-explanation-at-work） | 各一次資料ページ | 一致 |

## 未再確認（確認日を据え置き）
- graduate-recruiting-process-2026：就職白書2026データ集PDFが取得できず（リダイレクト先がメンテナンス／503）。66.4%・61.2%は未再確認。
- job tag を根拠とするガイド主張15件：job tag がシステムメンテナンス中。
- registered-salesperson/registered-scope：厚労省ページに分類一覧はあるが、販売できる区分の現行規定を本文で確認できなかった。
- 競合レジストリ：jp-jobtag（メンテナンス）、jp-polytech（接続不可）、shushoku-mirai（メンテナンス）。
