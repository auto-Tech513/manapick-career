# manapick career QAレポート

確認日: 2026-07-20（JST）

## 判定

現リリース候補はローカル作業ツリーにあり、commit、GitHubへのpush、Cloudflare Pagesへのデプロイは未実施である。既存本番の確認事実と現候補のローカル検査を混同しない。

新規ガイド30本は機械検査対象だが、人手レビューと承認記録は未確認である。このため全件を `draft` とし、公開済み4本だけを一覧、個別ページ、sitemap、llms.txt、JSON-LD、公開OG画像へ出す。30本を公開済みとは報告しない。

商品画像の権利未確認による以前の公開停止条件は解消済みである。許諾証跡を確認できなかった商品写真6点を2026-07-18に削除し、メーカーのロゴ・商品写真・固有外観を複製しない編集部作成の抽象SVG6点へ差し替えた。

## 現候補のコンテンツ構成

- 職業名録: 556件 / 15カテゴリ
- 人手確認済み詳細職業: 12件
- ニュース: 30件
- ガイド: 全34件のうち公開済み4件、未承認draft 30件
- 新規ガイド30件: 各1,000字以上、4セクション以上、記事単位の出典に加えて重要主張ごとのsourceId・確認日・鮮度期限を保持
- 姉妹サイト導線: `content/network-map.json` のitemIdを正本にし、build時に絶対URLへ解決。新規ガイドは記事文脈に合う学習・AI・資格の個別ページを参照
- 出典レジストリ: 49件
- 競合・参照サイト台帳: 100件（`deep` 25件 / `surface` 75件）
- manapi商店: 6商品、編集部作成SVG6件、メーカー公式仕様リンク6件、Amazon PRリンク6件
- 不存在のJobPosting、rating、reviewCount、salary、employmentTypeは生成しない

## 自動検査

2026-07-20、Node.js v24.16.0のクリーン作業用cloneで、最終コード状態の `npm run qa` を完走した。

- OG生成、lint、content、catalog、editorial、backlog、monetization、shop、competitive、source、similarity、build、内部リンク検査: すべて成功
- 静的生成: 633 / 633ページ
- 内部リンク検査: HTML 629件、欠落0件
- `npm run editorial:check`: ガイド全34件 / 公開4件 / draft 30件、ニュース30件、重要主張35件、最大ガイド本文類似度11.13%、network-map SSOT・OG禁則検査合格
- draft混入検査: `out/guide` は公開4件のみ。代表draft slugは静的ルート、sitemap、llms.txt、HTML / XML / TXTから不検出
- `npm run monetization:check`: 成功（`ca-pub-4108900975353940` / `8041327454`、記事内手動枠限定）
- `npm run source:check`: 成功（49件、鮮度期限内）
- `npm run similarity:check`: 成功（詳細職業12件、警告0件）

ネットワーク検査と `npm audit` は `npm run qa` に含まれないため、別の実行日を記録する。

## 保存済みの外部リンク検査

- `npm run links:network`: 姉妹サイトnetwork-map 26件すべて正常（2026-07-20）
- `npm run competitive:network`: 正常92件 / bot制限6件 / 通信未確認2件 / 404・410は0件（2026-07-14の記録。現候補では未再実行）
- `npm run source:network`: 正常47件 / bot制限2件 / 通信未確認0件 / 404・410は0件（2026-07-20、現候補で再実行）
- `npm audit --omit=dev`: 0 vulnerabilities（2026-07-20、現候補で再実行）

bot制限や通信未確認を404と同一扱いにしない。新規ガイド30本の公開前には、使用する一次資料と深い姉妹サイトリンクを人がブラウザで再確認する。

## ブラウザ・AdSense

- ローカル静的出力をChromiumで検査し、トップ、ガイド一覧、ニュース一覧、ガイド詳細、ニュース詳細、入口案内、manapi商店の7経路 × 375 / 390 / 768 / 1024 / 1280 / 1440 / 1920pxの49ケースで横あふれ0、console error 0を確認した
- ガイド一覧は画面幅に応じて1 / 2 / 3列へ変化することを確認した
- 実機SafariとAndroid Chromeは未確認
- AdSense publisher `pub-4108900975353940`、手動slot `8041327454`、`ads.txt` の一致を確認
- AdSenseの `manapick.app` は準備完了、ads.txt承認済み、ポリシーセンターは問題なし
- `career.manapick.app` の自動広告除外は管理画面で有効
- 本番の手動枠は未充填を確認した後、同日に758×90枠の充填済みクリエイティブを1回確認した

充填はGoogle側の判断と広告需要に依存し、サイト側から保証できない。代表URLの本番通信で意図しないページレベル自動広告が0件であることと、充填済み実広告を伴う全指定幅の横あふれ・CSP・hydration・console確認は未確認である。

## SEO・AEO・AI検索対応

- 各独自ページは自己canonical。姉妹サイトとのcanonical共有なし
- 職業・ガイドは `published` だけを公開面へ出し、draft/reviewedを除外
- robots、sitemap、llms.txt、Article / NewsArticle / BreadcrumbListを表示内容と一致させる
- 更新日をビルド日で上書きせず、人が確認した日を使用
- AI検索専用の特別なschemaや掲載保証は存在すると断定しない

既存本番の代表ニュースHTTP 200、自己canonical、記事固有OG画像、NewsArticle、BreadcrumbListと、robots.txtのsitemap通知は2026-07-20に確認した。現候補のデプロイ後URL、Rich Results Test、Search ConsoleのURL検査・モバイル描画・インデックス、GA4受信は未確認である。

## ニュース自動監査

自動化 `manapick-career` は毎日08:00 / 18:00（Asia/Tokyo）、ACTIVE、review-onlyのDraft PR作成までとして2026-07-20に確認した。初回の定刻実行、実際のDraft PR、外部サイト応答は未確認である。

## 公開前に残る確認

- 新規ガイド30本を人が確認し、承認記録を付けるまでdraftを維持する
- 現候補をcommit・push・デプロイした後、本番スモークテストを行う
- 充填済み実広告ありの全指定幅と、意図しない自動広告が0件であることを確認する
- 初回ニュース自動監査の実行結果とDraft PRを確認する
- 商標の専門確認、承認済み問い合わせフォーム、現候補のSearch Console・GA4確認を行う

未確認事項が解消するまで、30本の新規ガイド公開、広告の継続充填、検索掲載、自動監査の初回成功を報告しない。
