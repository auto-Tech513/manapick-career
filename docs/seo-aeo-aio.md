# SEO・AEO・AIO実装記録

確認日: 2026-07-23

## 結論

Googleは、AIによる概要やAIモードに表示されるための追加マークアップや特別な「AEO/GEO」対策は不要と案内している。したがって、本サイトでは名称だけの特殊対策を作らず、クロール可能性、内部リンク、表示本文と一致する構造化データ、固有の一次情報整理、ページ体験を共通基盤にする。検索・AI回答・利用者のいずれにも、掲載や引用を保証しない。

## 実装したこと

- 各独自ページに自己canonicalを設定し、姉妹サイト間でcanonicalを共有しない。
- 職業、ガイド、ニュースは `status === "published"` のデータだけを公開一覧、個別ページ、sitemap、RSSフィード、llms.txt、JSON-LD、Open Graph / Xメタデータ、公開OG画像へ出し、draft/reviewedを除外する。
- ニュースの公開状態は本文データと分離した `content/news-publication.json` を正本にする。対応レコードがない、または公開日・記名レビュー・レビュー日・追跡可能なGit承認証跡が不足する記事はfail-closedで公開しない。
- 追加ニュースは、共通定型文を文字数へ算入せず、記事固有本文だけで1,000字以上を必須にする。
- robots.txtで公開ページのクロールを許可し、sitemapを明示する。
- robots.txtはGoogleがサポートする`User-agent`、`Allow`、`Sitemap`だけで構成し、非標準の`Host`ディレクティブを出力しない。
- ニュースは`NewsArticle`、ガイドは`Article`、パンくずは`BreadcrumbList`を表示本文と一致させる。
- 記事には公開日、実際の人による確認日、執筆者、編集者、確認方法、一次出典、訂正窓口を表示する。
- 記事固有の1200×630画像を生成し、Open Graph、Xカード、Articleの`image`へ同じURLを指定する。
- OG画像の日本語は、BIZ UDPGothic Regular / BoldのTTFをResvgの`fontFiles`へ直接渡し、`loadSystemFonts: false`でOS依存のCJKフォールバックを禁止する。package versionと2ファイルのSHA-256を固定し、全67候補画像で使う文字が両TTFのcmapに収録されていることもビルド時に検査する。現公開対象はガイド4件・ニュース0件で、4件とも1200×630pxを検査する。旧Noto・versionless公開ディレクトリは削除し、再出現した場合は検査を失敗させる。
- draft/reviewedニュースのOG画像は公開ディレクトリへ生成せず、確認用に必要な場合だけ明示した一時出力先へ生成する。
- 先に結論、要点、目次、本文、限界、次の確認をテキストとしてHTMLへ出す。重要情報を画像内だけに置かない。
- `/all/` は556職業の名称・別名・分類を検索する単一名録とし、確認済み職業は `/career/` の独自解説へ、それ以外はjob tag公式ページへ通常リンクする。未確認の556件を個別URLへ展開しない。
- `llms.txt`はサイトの公開範囲を説明する補助ファイルとして提供するが、GoogleのAI機能への掲載要件とは扱わない。
- 存在しない求人、給与、レビュー、評価を作らず、実在する単一求人でないページに`JobPosting`を付けない。
- 個別 `/occupation/` は `content/occupation-publication.json` を公開状態の正本とし、レコード欠落をdraftとして扱う。独自本文1,000字以上、公式出典、確認日、動画・資格・AI、編集者の人手確認、承認証跡、公開日が揃ったpublishedだけを静的パス、sitemap、JSON-LDへ出す。現時点の公開数は0件。

## 日付の扱い

記事の`datePublished`は一次資料の公表日ではなく、記事を初めて公開した日を使う。一次資料の公表日は本文で説明する。`dateModified`と画面上の確認日は、人が本文とリンクを実際に再確認した日だけ更新し、ビルド日では上書きしない。

## 外部運用の確認状態

1. Search Consoleの独立URL-prefixプロパティの所有権とsitemap送信は2026-07-12に確認済み。現リリース候補で追加・変更するURLのURL検査、インデックス状態、モバイル描画は未確認。
2. Rich Results Testで現リリース候補の公開ガイドのJSON-LDと画像取得を確認する項目は未確認。ニュースは公開0件なので、ニュース詳細・`NewsArticle`・記事OG画像を検査対象として存在させない。
3. Search Consoleの検索パフォーマンスで表示回数、CTR、クエリ、ページを継続観測する。AI機能からの表示を別の順位保証指標にはしない。
4. 現リリース候補のデプロイ後、実URLでcanonical、robots、sitemap、OG画像、HTTPステータスを再検査する項目は未確認。

## 2026-07-20の本番・ビルド技術確認

- 代表ニュース詳細はHTTP 200で、自己canonical、記事固有OG画像、`NewsArticle`、`BreadcrumbList`を返した。
- 本番robots.txtは公開ページを許可し、絶対URLのsitemapを通知していた。修正後の静的ビルドでは、非標準`Host`を除いた`User-agent`、`Allow`、`Sitemap`だけを出力することを確認した。
- sitemapは公開対象だけを列挙し、ニュース・公開ガイド・職業詳細の`lastModified`へビルド日ではなく確認日を使用している。新規ガイド30本は人手レビュー前のdraftであり、公開面へ出さない。
- AdSenseが未充填だった事象と検索クロール可否は別問題であり、広告の未充填をSEO障害とは判定しない。

## 2026-07-23のニュース公開境界確認

- ニュース原稿は33件あり、最短本文1,084字、追加記事の最短固有本文1,197字である。ただし、現在の表示内容全体を人が確認した追跡可能な証跡が揃わないため、公開0件・draft 33件とした。件数や文字数だけで公開条件を満たしたとは扱わない。
- `publishedNews` は `content/news-publication.json` の公開条件を満たす記事だけから構築し、ニュース一覧・詳細の静的パス、sitemap、RSSフィード、llms.txtが同じ公開配列を参照する。詳細ページが生成されない記事には、その記事のJSON-LD、Open Graph / Xメタデータも生成されない。
- 品質検査は全ニュースに公開状態レコードを要求し、status値、一次資料の`sourceId`、日付、人のレビュー証跡、確認対象の本文・出典・連携実装を固定する`contentSha256`を検査する。追加ニュースでは、共通定型文を除いた記事固有本文が1,000字未満なら失敗し、draft/reviewedの画像や旧フォント画像が公開OGディレクトリにあっても失敗する。
- 08:00 / 18:00（JST）の自動監査は候補をdraftで作るだけで、status昇格、`main` へのmerge、本番公開を行わない。2026-07-23のfresh `/private/tmp` clone実行はブランチ `automation/career-news-20260723-080053` のcommit `b7efe3360a78d6da2cc8d7e7a9f83e29d14328b0` まで到達したが、Draft PR作成はHTTP 403で失敗した。`main` は変更されず、PRも公開も成立していない。
- 上記commitは現行公開ゲート導入前の履歴である。同日、自動化プロンプトへニュース公開レジストリの追加、候補の常時draft、draft OG画像を公開ディレクトリへ置かない要件を反映した。最新資料からの候補は、人による確認と承認証跡が揃うまで公開面へ出さない。

## 参照した公式資料

- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Influence your byline dates](https://developers.google.com/search/docs/appearance/publication-dates)
- [Sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

構造化データ、sitemap、canonicalは検索結果やAI回答への掲載を保証しない。公式資料もこの点を明示している。
