# SEO・AEO・AIO実装記録

確認日: 2026-07-20

## 結論

Googleは、AIによる概要やAIモードに表示されるための追加マークアップや特別な「AEO/GEO」対策は不要と案内している。したがって、本サイトでは名称だけの特殊対策を作らず、クロール可能性、内部リンク、表示本文と一致する構造化データ、固有の一次情報整理、ページ体験を共通基盤にする。検索・AI回答・利用者のいずれにも、掲載や引用を保証しない。

## 実装したこと

- 各独自ページに自己canonicalを設定し、姉妹サイト間でcanonicalを共有しない。
- 職業とガイドは `status === "published"` のデータだけを一覧、個別ページ、sitemap、llms.txt、JSON-LD、公開OG画像へ出し、draft/reviewedを除外する。
- ニュースは現行データに同じstatusフィールドがないため、review-onlyのDraft PRと人によるmerge承認を公開ゲートにする。
- robots.txtで公開ページのクロールを許可し、sitemapを明示する。
- robots.txtはGoogleがサポートする`User-agent`、`Allow`、`Sitemap`だけで構成し、非標準の`Host`ディレクティブを出力しない。
- ニュースは`NewsArticle`、ガイドは`Article`、パンくずは`BreadcrumbList`を表示本文と一致させる。
- 記事には公開日、実際の人による確認日、執筆者、編集者、確認方法、一次出典、訂正窓口を表示する。
- 記事固有の1200×630画像を生成し、Open Graph、Xカード、Articleの`image`へ同じURLを指定する。
- 先に結論、要点、目次、本文、限界、次の確認をテキストとしてHTMLへ出す。重要情報を画像内だけに置かない。
- 556職業名録、公開済み詳細記事、ニュース、ガイド、キャリアデータ室を通常リンクで接続する。
- `llms.txt`はサイトの公開範囲を説明する補助ファイルとして提供するが、GoogleのAI機能への掲載要件とは扱わない。
- 存在しない求人、給与、レビュー、評価を作らず、実在する単一求人でないページに`JobPosting`を付けない。

## 日付の扱い

記事の`datePublished`は一次資料の公表日ではなく、記事を初めて公開した日を使う。一次資料の公表日は本文で説明する。`dateModified`と画面上の確認日は、人が本文とリンクを実際に再確認した日だけ更新し、ビルド日では上書きしない。

## 外部運用の確認状態

1. Search Consoleの独立URL-prefixプロパティの所有権とsitemap送信は2026-07-12に確認済み。現リリース候補で追加・変更するURLのURL検査、インデックス状態、モバイル描画は未確認。
2. Rich Results Testで現リリース候補の代表ニュース・公開ガイドのJSON-LDと画像取得を確認する項目は未確認。
3. Search Consoleの検索パフォーマンスで表示回数、CTR、クエリ、ページを継続観測する。AI機能からの表示を別の順位保証指標にはしない。
4. 現リリース候補のデプロイ後、実URLでcanonical、robots、sitemap、OG画像、HTTPステータスを再検査する項目は未確認。

## 2026-07-20の本番・ビルド技術確認

- 代表ニュース詳細はHTTP 200で、自己canonical、記事固有OG画像、`NewsArticle`、`BreadcrumbList`を返した。
- 本番robots.txtは公開ページを許可し、絶対URLのsitemapを通知していた。修正後の静的ビルドでは、非標準`Host`を除いた`User-agent`、`Allow`、`Sitemap`だけを出力することを確認した。
- sitemapは公開対象だけを列挙し、ニュース・公開ガイド・職業詳細の`lastModified`へビルド日ではなく確認日を使用している。新規ガイド30本は人手レビュー前のdraftであり、公開面へ出さない。
- AdSenseが未充填だった事象と検索クロール可否は別問題であり、広告の未充填をSEO障害とは判定しない。

## 参照した公式資料

- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Influence your byline dates](https://developers.google.com/search/docs/appearance/publication-dates)
- [Sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

構造化データ、sitemap、canonicalは検索結果やAI回答への掲載を保証しない。公式資料もこの点を明示している。
