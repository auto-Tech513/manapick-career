# キャリアニュース朝夕監査

## 登録内容

- 自動化ID: `manapick-career`
- 表示名: `manapick career 公式ニュース朝夕監査`
- 実行時刻: 毎日 08:00 / 18:00（Asia/Tokyo）
- 対象: `manapick-career` リポジトリのニュース、出典レジストリ、日本語OG画像
- 状態: ACTIVE
- 出力: review-onlyのDraft PR。自動merge・自動公開はしない

## 採用条件

1. 厚生労働省、総務省統計局、JILPT、経済産業省、IPA、内閣府等の一次資料を優先する。
2. 既存記事と同じ発表、同じ検索意図、高類似本文を採用しない。
3. 定型メタ情報を除く本文を1,000字以上、目次を4項目以上にする。
4. 対象範囲、数字の読み方、断定できないこと、次の確認行動を明記する。
5. 重要主張を `content/source-registry.json` の `sourceId` へ結び付ける。
6. 公表日と、人が一次資料を確認した `checkedAt` を混同しない。
7. 文脈がある場合だけ、manapick、manapick AI、manapick license の独自ページへ通常リンクする。
8. 日本語OG画像は同梱の Noto Sans JP TTF を明示して生成する。
9. `lint`、`content:check`、`editorial:check`、`source:check`、`similarity:check`、`build`、`links:check` の全検査に合格させる。

品質条件を満たす一次情報がない実行では、件数を埋めるための記事を作らず0本で終了する。

## 公開境界

自動処理は専用ブランチへのcommitとreview-onlyのDraft PR作成までとし、`main` へのmergeや本番公開は行わない。現行のニュースデータには職業・ガイドと同じ `status` 公開ゲートがないため、`main` へのmergeが静的公開対象への追加になる。したがって、編集者が一次資料、全主張、リンク、OG画像を確認し、Draftを解除してmergeを承認する工程そのものを公開ゲートとする。これは `content/editorial-policy.json` と `docs/release-checklist.md` の人手確認要件を優先した運用である。

## 確認状態

自動化ID、08:00 / 18:00（JST）の登録値、ACTIVE状態、review-onlyのDraft PR方針は2026-07-20に確認した。初回の定刻実行、実際のDraft PR作成、外部サイト側の応答は未確認である。初回実行後に、採用0/1本、一次資料URL、本文文字数、検査結果、PR URLをこの運用記録またはQAレポートへ追記する。
