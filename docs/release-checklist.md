# 公開手順と未確認項目

確認日: 2026-07-23（JST）

`[x]` は記載日時点の確認事実、`[ ]` は未確認または外部作業待ちである。検索掲載、広告充填、将来の外部サービス状態を保証しない。

## 現リリース候補

- [x] 556職業を `/all/` の名称・別名・分類ディレクトリに限定し、未確認の個別 `/occupation/` を静的パス、sitemap、llms.txt、JSON-LDから除外する。
- [x] ニュース公開状態を `content/news-publication.json` のfail-closedとし、33件すべてを人手確認前のdraftとして公開ページ、sitemap、RSS、llms.txt、JSON-LD、公開OG画像から除外する。
- [x] 公開ニュース0件でもトップ、ニュース一覧、データ室、RSS、llms.txt、静的exportを成立させる。
- [x] 追加ガイド30件をdraftのまま公開面から除外し、公開ガイドを確認済み4件に限定する。
- [x] `npm run qa` を完走する（Node.js v24.16.0、静的生成48 / 48、postbuild後HTML 43件、sitemap 40 URL、内部リンク欠落0件）。
- [x] 公開ニュース0件時のビルド専用予約slugをpostbuildで削除し、公開ニュース1件fixtureでも記事HTML生成と予約slug不在を確認する。
- [x] `npm audit` と `npm audit --omit=dev` で0 vulnerabilitiesを確認する。
- [x] 7ページ × 7幅の49ケースでHTTP 200、横あふれ0、アプリ由来console/hydration/runtime error 0を確認する。
- [x] draft代表ニュース4URLがHTTP 404で、記事本文を返さないことを確認する。
- [x] BIZ UDPGothic Regular / BoldのversionとSHA-256を固定し、Resvgのシステムフォントを無効化し、全OG候補の使用文字がTTFに収録されていることを検査する。
- [x] 旧OG公開ディレクトリを削除し、draft画像を `public/og` へ置かない。
- [ ] GitHub `main` へpushし、Cloudflare Pagesの本番deployment成功と公開commitを照合する。
- [ ] 本番URLでトップ、ニュース、ガイド、名録、sitemap、llms.txt、robots、OG画像、代表draft 404を再確認する。

## 添付SEOレポート

- [x] 添付HTMLのSHA-256、対象期間、GSC / GA4 / AdSense値、解釈上の限界を `docs/seo-report-2026-07-22-review.md` へ記録する。
- [x] careerのGSC 0クリック・0表示と「検出 - インデックス未登録」を、検索評価や今後の登録時期へ過大解釈しない。
- [x] GA4参照元行の単純合計が全体セッションと不一致であることを記録し、行合算から流入比率を作らない。
- [ ] Search Console管理画面で2026-07-23現在のトップと代表ページのURL検査、Google選択canonical、モバイル描画、sitemap読込を再確認する。
- [ ] GA4管理画面で本番反映後の受信を確認する。

## ニュース自動監査

- [x] 自動化 `manapick-career` を毎日08:00 / 18:00（Asia/Tokyo）、ACTIVEとして登録する。
- [x] fresh clone、一次資料優先、最大1候補、常時draft、全検査、専用ブランチへのcommit、review-only Draft PR作成試行までに制限する。
- [x] 自動status昇格、`main` への自動merge、自動公開を禁止する。
- [x] 自動化が `contentSha256`、`reviewedAt`、`reviewedBy`、`reviewedByHumanAt`、`reviewEvidence` を設定・更新・削除しないようにする。
- [x] 2026-07-23の08:00枠でfresh cloneから専用ブランチとcommit作成まで到達したことを確認する。
- [x] HTTP 403時だけ認証済みGitHub CLIの絶対パスを使うDraft PRフォールバックを設定し、CLI実体・アカウント・`repo` scopeを確認する。
- [ ] 更新後設定による実際のDraft PR URLとdraft除外を次回実行で確認する。

## AdSense

- [x] publisher `ca-pub-4108900975353940`、手動slot `8041327454`、`ads.txt` の一致をコードで確認する。
- [x] 自動広告をコードで有効化せず、主要CTA・比較操作・診断付近を避け、記事中だけに手動レスポンシブ枠を置く。
- [ ] 本番の公開ガイドで広告リクエスト、配信状態、意図しないページレベル広告0件を確認する。
- [ ] 充填済み実広告ありの375 / 390 / 768 / 1024 / 1280 / 1440 / 1920pxで横あふれ、CSP、hydration、consoleを確認する。
- [ ] AdSense管理画面でサイト状態、ポリシー、配信制限、カバレッジ、未充填率を再確認する。

## 外部確認と継続運用

- [x] 姉妹サイトnetwork-map 26件をHTTP確認し、26件正常、404・未確認0件とする。
- [x] 出典52件をHTTP確認し、50件正常、bot制限2件、404・未確認0件とする。
- [ ] 公開ガイドをRich Results Testで確認する。
- [ ] 実機Safari、Android Chrome、支援技術による読み上げを確認する。
- [ ] 商標の指定役務・類似称呼を含む専門確認を行う。
- [ ] 承認済み問い合わせフォームを設定するか、非表示を維持する。
- [ ] 週次で出典、リンク、内容鮮度を監査し、自動検出結果を人のreviewed承認なしにpublishedへ昇格しない。
- [ ] 表示回数、CTR、流入クエリ、回遊率を実測し、需要が確認できた領域だけを拡張する。
