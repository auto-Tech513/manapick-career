# 2026-08-01 日次SEOレポート検証記録

確認日: 2026-08-01（JST）

## 対象と検証可能性

- 対象HTML: `日次SEOレポート_2026-08-01.html`
- ファイルサイズ: 36,115 bytes
- SHA-256: `6bf58f02f1b227329fd1a84f9088405e88e96cc2139257f5d8524dd70521666e`
- レポート記載のSearch Consoleページレポート最終更新: 2026-07-24
- レポート取得日: 2026-08-01

この記録では、添付HTMLに表示された値、2026-08-01時点の公開HTTP応答、リポジトリの公開ゲートを分けて扱う。Search Consoleの集計原因や将来のクロール時期は、表示された集計値だけから断定しない。

## 添付レポートから確認できたcareerの値

- Search Console: クリック0、表示0、登録済み0、未登録600。
- 未登録理由: 「検出 − インデックス未登録」。レポート上は未クロール。
- GA4（Japan完全一致、2026-07-04〜07-31）: 79セッション、エンゲージ51、エンゲージ率64.56%、平均滞在1分59秒、918イベント。
- 参照元/メディア: direct 70、x / social 6、manapick_license / network 2、t.co / referral 1。

directの70件をすべて運営者訪問と断定できる識別情報は添付HTMLにない。一方、レポート自身が動作確認を多く含むと注記しているため、外部獲得の成果値としては扱わない。流入拡大の基準は、Search Consoleの非ゼロ表示・クリック、t.co等の外部参照、姉妹サイト文脈リンクの実測へ分ける。

## 現行公開サイトの実測

2026-08-01に公開HTTP応答と生成物を確認した。

- `robots.txt` は公開ページを許可し、`https://career.manapick.app/sitemap.xml` を通知する。
- sitemapは70 URLで、固定18、カテゴリ6、確認済み職業12、公開ガイド4、公開ニュース30から構成される。
- 556職業名録の未承認個別 `/occupation/` はsitemap、静的出力、公開JSON-LDに0件。
- トップ、職業一覧、職業詳細、ニュース、ガイドはHTTP 200、自己canonical、`index, follow`。
- Googlebot相当User-AgentでもトップはHTTP 200で、`noindex`、認証壁、robots遮断はない。
- HTTPからHTTPSは1回のredirectで正規URLへ到達する。
- sitemapの全URLは同一originの絶対URLで、重複・クエリ・fragmentがない。
- 旧 `/occupation/*` の代表URLはHTTP 404であり、現行sitemapが600 URLを送信している事実はない。

したがって、レポートの未登録600件を「現行sitemap 70 URLの送信不備」とは扱えない。集計に含まれる600 URLの内訳は添付HTMLにないため、過去に検出されたURL群、旧公開URL、他の発見経路のどれかを特定するには、Search Consoleの該当理由詳細からURL例を取得する必要がある。

また、Search Consoleページレポートの最終更新日は7月24日で、30ニュースの公開日は7月26日である。このレポートだけでは、現在の70 URLに対するクロール結果を評価できない。

## 今回の恒久改善

1. sitemapの固定ページ更新日をビルド日で埋めず、職業の確認日、公開ガイド確認日、公開ニュースの公開・確認日、名録データ更新日から導出するようにした。法務・運営ページには実確認日の根拠がないため、虚偽の`lastmod`を出さない。
2. 12職業詳細へ固有の1200×630px OG画像を生成した。BIZ UDPGothicをTTFから直接読み込み、`loadSystemFonts: false`として日本語フォールバックを排除した。
3. 職業詳細のOpen Graphを大型カードに変更し、更新日、言語、執筆・編集主体、画像、引用元を表示本文と一致させた。
4. 職業詳細の目次を全項目の実リンクにし、モバイルでも目次を表示した。
5. 職業一覧、カテゴリ、ガイド一覧に可視パンくずと、表示内容に一致する`BreadcrumbList`、`CollectionPage`、`ItemList`を追加した。
6. ビルド後に、sitemap URL、出力HTML、自己canonical、robots、draft露出、`JobPosting`不在、職業固有OG、職業目次、一覧構造化データを検査する`indexability:check`を追加した。

これらはクロール効率、検索結果の説明可能性、内部回遊、SNSからの入口品質を改善するが、インデックス登録、検索順位、クリック数、AI回答への採用を保証しない。

## 外部管理画面で必要な確認

コードから確認できないため、次を成功扱いにしない。

1. Search Consoleのcareer URL-prefixプロパティで、現在の`/sitemap.xml`の最終読込日時・検出URL数・エラーを再確認する。
2. 「検出 − インデックス未登録」の詳細から、600件に含まれるURL例をエクスポートし、現行70 URL、旧URL、パラメータURLに分類する。
3. URL検査でトップ、`/all/`、代表職業、代表ニュース、代表ガイドのクロール可否、Google選択canonical、最終クロール日を確認する。
4. 必要ならトップと主要な代表URLだけインデックス登録をリクエストする。Googleの案内どおり、リクエストは登録を保証しない。
5. 7月26日公開分が反映される期間を置き、表示回数、クエリ、ページ別クリックを週次で測る。表示が出たページだけタイトル・説明・内部導線をクエリ単位で改善する。

## 評価指標

「100点」や流入増加を自己申告で確定せず、次を継続測定する。

- インデックス: sitemap送信URLに対する登録URL数、理由別未登録URL、最終クロール日。
- 検索獲得: 非ブランド表示、クリック、CTR、クエリ別平均掲載順位。
- 外部獲得: t.co、x / social、姉妹サイトnetworkのセッションとエンゲージ。
- 利用価値: 職業詳細から動画・AI・資格・比較への遷移率、ニュース・ガイドから職業詳細への遷移率。
- 品質: 公開ゲート違反0、canonical不一致0、draft露出0、横あふれ0、hydration/runtime error 0。

## 参照したGoogle公式資料

- [URL Inspection tool](https://support.google.com/webmasters/answer/9012289)
- [Page indexing report](https://support.google.com/webmasters/answer/10264824)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
