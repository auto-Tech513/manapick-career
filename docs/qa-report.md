# manapick career QAレポート

確認日: 2026-07-23（JST）

## 現リリース候補の結論

現リリースは、未確認データを公開しないfail-closed構成へ変更し、ローカルの全品質ゲートと本番実ブラウザ検査に合格した。アプリケーション変更commit `3a12f14bb5b1364dcb326912ce4fa74bd466956a` はGitHub `main` と一致し、Cloudflare Pages Production deployment `c18b761f-53f6-44fb-8c47-5296bad94212`（source `3a12f14`）がActiveであることを確認した。

- 556職業は名称・別名・分類を検索できる `/all/` の名録として維持する。独自本文と人の承認証跡がない個別 `/occupation/` は公開0件で、静的ルート、sitemap、llms.txt、JSON-LDにも出さない。
- 独自の詳細職業は既存の確認済み12件だけを `/career/` で公開する。
- ニュース原稿は33件あるが、現在表示する本文全体を人が確認した追跡可能な証跡がないため33件すべてdraft、公開0件とする。記事数や文字数だけで公開条件を満たしたとは扱わない。
- ガイドは34件中4件を公開し、未承認30件をdraftとして全公開面から除外する。
- 公開ニュース0件でもトップ・ニュース一覧・データ室・RSS・llms.txt・JSON-LDが壊れず、公開準備中の事実と代替導線を表示する。

## 2026-07-22日次SEOレポートの反映

添付HTMLのSHA-256、期間、表示値、解釈上の限界は `docs/seo-report-2026-07-22-review.md` に分離して記録した。HTMLから確認できるcareerの値は次のとおりである。

- Search Console: 2026-07-11〜07-19のグラフでクリック0、表示0。2026-07-22取得時のトップURL検査は「検出 - インデックス未登録」、前回クロールは「該当なし」。
- GA4: 2026-06-24〜07-21、Japan完全一致で58セッション、エンゲージのあったセッション33、エンゲージ率56.9%、HTML表記の平均滞在1分38秒、557イベント。
- GA4の参照元/メディア表示行は単純合計61で、全体58と一致しないため、行の単純合算から流入比率を作らない。

インデックス登録が近いこと、内部リンクが検出の原因だったこと、SNS投稿や広告が指標変化の原因だったことは、添付HTMLだけでは証明できない。そこでサイト側では、公開日・一次資料公表日・人の確認日を分離し、公開URLだけをsitemapへ載せ、関連ページへの通常リンクを維持した。Search Consoleの現在値とインデックス状態は管理画面で再確認するまで未確認とする。

## コンテンツ・公開境界

- `content/news-publication.json`: ニュース公開状態の正本。未登録または承認項目不足は公開しない。
- `content/occupation-publication.json`: 個別職業詳細の公開状態の正本。未登録はdraft扱い。
- ニュースの `published` 条件は、一次資料、公表日、サイト公開日、記名レビュー、レビュー日、Git承認証跡、確認対象を固定する `contentSha256` を含む。
- 自動化は `contentSha256` と人のレビュー項目を設定・更新・削除できない。
- 33ニュースの最短本文は1,084字、追加ニュースの最短記事固有本文は1,197字。34ガイドの最短本文は1,036字、最大本文類似度は11.13%。
- 最新候補は厚生労働省2026-07-15、IPA 2026-07-16、厚生労働省2026-07-21の一次資料に基づく3件で、すべてdraft。2026-07-23（JST）の厚生労働省報道発表一覧・雇用トピックス、IPAプレスリリース、総務省統計局の対象を絞った再確認では、7月22日・23日公表でcareerの編集基準を満たす新たな一次資料を確認できなかった。これは対象公式ソースの確認結果であり、ウェブ全体の網羅を意味しない。2026-07-23までの公開記事があるとは報告しない。

## 日本語OG画像

- フォント: OFL-1.1のBIZ UDPGothic Regular / Bold、package `0.4.2`。
- Regular SHA-256: `22f41ce68f1ce62477ca4ec1e2c0c400cc545ddff31d713e8edf87808614aeb2`
- Bold SHA-256: `1a995936e0f9de8a7c142c97cdb679e7087e89c13e663f946cd047f4283cedf8`
- ResvgへTTFを直接渡し、`loadSystemFonts: false` としてOSのCJKフォールバックを禁止する。
- ビルド時にフォントversion、SHA-256、全67候補画像で使う文字のcmap収録を検査する。
- 日本語禁則と数字・単位の分割禁止を検査し、1200×630pxで生成する。
- 公開対象はガイド4件・ニュース0件。draft確認用に33ニュース・34ガイドの67枚を非公開の `output/` へ生成し、代表ニュースと代表ガイドを原寸で目視確認した。
- 旧 `public/og/guide`、`public/og/news`、`public/og/jp-v2` は削除し、再出現した場合は品質ゲートを失敗させる。

BIZ UDPゴシックは日本語UI・文書向けの自然なゴシック体であり、今回の画像はメイリオそのものではない。メイリオを同梱しているとは表示せず、実際に固定したフォント名とハッシュで説明する。

## 自動検査

Node.js v24.16.0、npm 11.13.0で次を確認した。

- `npm run qa`: 成功。
- Next.js 16.2.11静的生成: 48 / 48、postbuild後のHTML 43件、sitemap 40 URL。48件目は公開ニュース0件でもNext.jsの静的exportを成立させるビルド専用予約slugで、postbuild検査後に成果物を削除する。
- 公開ニュース1件を模擬する統合fixtureでも記事HTMLが静的生成され、ビルド専用予約slugが残らないことを確認した。
- 内部リンク: 43 HTML、欠落0件、未承認個別職業0件、未承認ニュース0件。
- `out/news` のニュース詳細HTML: 0件。`out/occupation`: なし。公開ガイド詳細HTML: 4件。
- 出典: 52件、鮮度期限内。詳細職業12件の類似度警告0件。
- 名録: 556件 / 15カテゴリ、個別職業公開0件、実効draft 556件。
- `npm audit` と `npm audit --omit=dev`: いずれも0 vulnerabilities。
- 姉妹サイトリンク: 26件正常、404・未確認0件。
- 出典リンク: 50件正常、bot制限2件、404・未確認0件。bot制限を404と同一扱いにしない。
- 競合・参照サイト: 100件、深掘り25件・表層75件。HTTP再監査は94件正常、bot制限5件、404・410は0件、通信エラー1件。通信エラーだったJobs and Skills Australiaは公開画面を別経路で確認し、HTTP監査の生結果と分けて記録した。

## 本番公開面の検証

- `https://career.manapick.app/`、ニュース、ガイド、名録、データ室、入口案内、商店はHTTP 200。
- `sitemap.xml`、`llms.txt`、`feed.xml`、`robots.txt` はHTTP 200。sitemap 40 URLを巡回し、40 / 40でHTTP 200、canonical不一致0件、draft slug・`JobPosting`混入0件。
- 公開ガイドOG 4枚は1200×630pxで、公開レスポンスとリポジトリ成果物のbyte一致を確認した。draftニュースOGと旧OGパスは公開されない。
- 代表draftニュース・未承認職業・ビルド専用予約slugはHTTP 404で、sitemap、llms.txt、RSSにも混入しない。
- HSTS、`nosniff`、Referrer-Policy、frame制限、Permissions-Policy、CSPの本番応答を確認した。

## 実ブラウザ検査

Playwright CLIのChromiumで `/`、`/news/`、`/guide/`、`/all/`、`/research/`、`/route/`、`/shop/` を375 / 390 / 768 / 1024 / 1280 / 1440 / 1920pxで確認した。

- 49 / 49ケース: HTTP 200。
- 49 / 49ケース: `document.scrollWidth <= window.innerWidth`。最大値でもviewportより15px小さく、横あふれ0件。
- 49 / 49ケース: H1とheaderが可視。navigation error、pageerror、hydration errorは0件。
- 初回の本番検査では、GA4が使う `https://www.googletagmanager.com/a` または `/td` の画像ビーコンをCSPの `img-src` が許可しておらず、成功ページで合計11件のCSP console errorを検出した。許可先を当該exact originだけ追加し、品質ゲートにも必須条件を追加した。
- 修正deployment後の再検査では、成功ページのconsole error、CSP error、hydration error、runtime errorは49 / 49ケースですべて0件。
- 375pxではdrawerの開閉、16リンク、下部ナビ5リンクを確認し、drawer表示中もinner / document / body幅は375 / 375 / 375px。
- ニュース一覧は全幅で「公開中0記事」「公開前確認中」「確認を終えた記事から掲載」を表示。
- draft代表3URLは3 / 3でHTTP 404、H1は404、記事本文の露出と横あふれはない。404応答自体に伴う期待どおりの404 consoleだけを、成功ページの実行時エラーと混同しない。

実機Safari、Android Chrome、支援技術による読み上げは未確認である。

## AdSense

- コード上はpublisher `ca-pub-4108900975353940`、手動slot `8041327454`、`ads.txt` が一致し、記事本文の2番目のセクション後だけにレスポンシブ手動枠を置く。
- 現リリース候補では公開ニュースが0件のため、ニュース記事内広告は表示対象ページ自体がない。公開ガイドでは手動枠のコードを維持する。
- 広告の充填はGoogle側の審査・需要・配信判断に依存する。継続充填、全幅の実広告描画、管理画面の現在状態は本番反映後に再確認するまで未確認であり、サイト側から保証しない。

## ニュース自動監査

自動化 `manapick-career` は毎日08:00 / 18:00（Asia/Tokyo）、ACTIVEである。fresh clone、一次資料優先、最大1候補、常時draft、全検査、専用ブランチへのcommit、review-onlyのDraft PR作成試行までに制限し、自動merge・自動公開を行わない。

2026-07-23の08:00枠は専用ブランチとcommit作成まで成功したが、Draft PR作成はHTTP 403で失敗した。このためPR URLはない。その後、認証済みGitHub CLIの絶対パスを使う403時限定のDraft PRフォールバックを設定したが、更新後設定での実際のDraft PR成功は次回実行まで未確認である。

## 未確認のまま成功扱いにしない項目

- Search Consoleの2026-07-23現在値、代表URLのURL検査、Google選択canonical、モバイル描画、インデックス登録。
- GA4の現リリース受信、AdSense管理画面の現在状態と実広告の継続充填。
- Rich Results Test、実機Safari / Android Chrome、支援技術による読み上げ。
- 33ニュース、30追加ガイド、556個別職業の人手レビューと公開承認。
- 自動化の更新後フォールバックによる実際のDraft PR作成。

これらが未確認の間は、検索掲載、広告表示、ニュース公開、個別職業公開、自動監査の完全成功を報告しない。
