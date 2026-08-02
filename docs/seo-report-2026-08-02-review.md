# 2026-08-02 日次SEOレポート検証記録

確認日: 2026-08-02（JST）

## 対象と固定値

- 対象HTML: `/Volumes/SSD256GB/My Folder/01_claude/Projects/manapickプロジェクト/02_日次レポート・計測/日次SEOレポート_2026-08-02.html`
- ファイルサイズ: 36,020 bytes
- SHA-256: `63a813c451dc5d4adc4824ab5d07809d9c36dbbc4d5384f978c6813a331475f5`
- レポート記載の取得日: 2026-08-02
- career GA4対象期間: 2026-07-05〜2026-08-01の過去28日、日本完全一致

添付HTMLの表示値、公開HTTP応答、リポジトリの生成物、推論を分離した。Search ConsoleとGA4の画面値だけでは、個々の利用者、クロールされない原因、将来の順位・流入を特定できない。

## 添付HTMLから確認できるcareerの値

- Search Console: クリック0、表示0、登録済み0、未登録600。
- 未登録理由: 「検出 − インデックス未登録」。レポートの記述では未クロール。
- GA4: 81セッション、エンゲージ53、エンゲージ率65.43%、平均滞在1分56秒、924イベント。
- 参照元/メディア: `(direct) / (none)` 72、`x / social` 6、`t.co / referral` 1。

## 事実として確定できない記述

| レポートの記述 | 判定 | 理由 |
|---|---|---|
| direct 72の大半は運営者本人 | 未確認 | GA4の参照元だけでは利用者の本人性を識別できない。内部トラフィック除外の設定・デバッグ端末識別が必要。 |
| t.coは公式Xからの実クリック | 未確認 | t.coはXの短縮URLだが、GA4画面値だけではどのアカウント・投稿かを特定できない。投稿別UTMで検証する。 |
| 28日値の減少は窓ずれが原因 | 未確認 | 日別データと前後期間の寄与が添付HTMLにないため因果を確定できない。 |
| licenseの登録はURL検査リクエストの効果 | 未確認 | 時系列上の前後関係だけで、Googleのクロール・登録判断との因果は証明できない。 |
| careerの600件は現行ページの問題 | 未確認 | Search ConsoleのURL例がなく、現在のsitemap 70 URLとの対応を特定できない。 |
| 今日は変更不要、横ばいは正常 | 根拠不足 | 1日の差と28日窓だけでは施策停止の合理性を決められない。週次のクエリ・ページ別変化が必要。 |

## 公開サイトと生成物の再確認

- `robots.txt` はクロールを許可し、自己sitemapを通知している。
- sitemapは70 URL。固定18、カテゴリ6、確認済み職業12、公開ガイド4、公開ニュース30で構成する。
- 静的出力は73 HTML。未承認の556職業詳細やdraftニュースは生成していない。
- トップ、`/all/`、代表職業、ニュース一覧、代表ニュース、ガイドはHTTP 200で自己canonicalを持つ。
- 旧 `/career/ai-dx-lead/` は現行 `/career/it-consultant/` へ転送される。
- Googlebot相当User-Agentでも認証壁、`noindex`、robots遮断はない。
- HSTS、nosniff、Referrer-Policy、CSP、frame制御を公開応答で確認した。
- 375/390/768/1024/1280/1440/1920pxの検査対象では、document横あふれを許容しない自動検査を維持する。

Googleの公式説明どおり、sitemapはURL発見を補助するがクロール・インデックス登録を保証しない。重要ページを通常の`<a href>`と説明的な文言で文脈リンクする実装を維持する。

## 今回の改善

1. 2026年7月31日公表の総務省「労働力調査 2026年6月分」を出典レジストリへ追加し、3,650文字の記事候補を作成した。
2. 最新候補は`draft`のままにし、公開ニュース、sitemap、RSS、llms.txt、JSON-LD、OG画像へ混入させない。一次資料と全主張を人が確認して証跡を残すまで公開しない。
3. スマホ記事のH1を本文・目次との比率に合わせて縮小し、日付・確認情報を読み分けやすいチップ表示にした。
4. 朝夕ニュース監査の一時クローン・ログ・キャッシュをSSDの`03_AUTOMATION/.cache`へ移す運用へ更新し、旧Documentsや`/private/tmp`へ自動処理データを作らない。
5. 姉妹サイトの旧「AI・DX推進担当」表記と旧URLを、現行の「ITコンサルタント」へ置き換える対象として確認した。汚れた作業ツリーを直接混ぜず、各正本で独立して検証・公開する。

## Search Consoleでのみ確認できる残件

1. 「検出 − インデックス未登録」600件のURL例をエクスポートし、現行70 URL、旧URL、パラメータURL、その他に分類する。
2. sitemapの最終読込日時、検出URL数、エラーを確認する。
3. トップ、`/all/`、代表職業、代表ニュース、代表ガイドのURL検査で、Google選択canonicalと最終クロール日を確認する。
4. 現行URLを少数だけ登録リクエストし、結果を保証せず週次で記録する。
5. GA4の内部トラフィックフィルタとDebugViewを確認し、運営者確認を成果計測から分離する。

## 測る指標

- 検出: sitemap送信70 URLのうち、Googleが検出・クロール・登録したURL。
- 獲得: 非ブランド表示、クリック、CTR、クエリ別平均掲載順位。
- 連携: `network`用UTMを付けた姉妹サイト文脈リンクからのセッションとエンゲージ。
- 外部: 投稿ID別UTMを付けたX流入。t.coだけで公式投稿と断定しない。
- 利用価値: ニュース・ガイドから職業詳細、職業詳細から動画・AI・資格への遷移率。
- 品質: draft露出0、canonical不一致0、公開出典切れ0、横あふれ0、runtime/hydration error 0。

## 参照した一次・公式資料

- [Google: Sitemaps overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google: Make your links crawlable](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [総務省統計局: 労働力調査 月次結果](https://www.stat.go.jp/data/roudou/sokuhou/tsuki/)
- [IPA: デジタルスキル標準](https://www.ipa.go.jp/jinzai/skill-standard/dss/download.html)

構造化データ、sitemap、内部リンク、内容更新はいずれも検索結果への採用や流入増加を保証しない。上の観測値が改善した場合だけ成果として扱う。
