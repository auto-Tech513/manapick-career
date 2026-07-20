# SEO・AEO・AIO実装記録

確認日: 2026-07-14

## 結論

Googleは、AIによる概要やAIモードに表示されるための追加マークアップや特別な「AEO/GEO」対策は不要と案内している。したがって、本サイトでは名称だけの特殊対策を作らず、クロール可能性、内部リンク、表示本文と一致する構造化データ、固有の一次情報整理、ページ体験を共通基盤にする。検索・AI回答・利用者のいずれにも、掲載や引用を保証しない。

## 実装したこと

- 各独自ページに自己canonicalを設定し、姉妹サイト間でcanonicalを共有しない。
- 公開ページだけを絶対URLでsitemapへ出し、draft/reviewedデータを除外する。
- robots.txtで公開ページのクロールを許可し、sitemapを明示する。
- ニュースは`NewsArticle`、ガイドは`Article`、パンくずは`BreadcrumbList`を表示本文と一致させる。
- 記事には公開日、実際の人による確認日、執筆者、編集者、確認方法、一次出典、訂正窓口を表示する。
- 記事固有の1200×630画像を生成し、Open Graph、Xカード、Articleの`image`へ同じURLを指定する。
- 先に結論、要点、目次、本文、限界、次の確認をテキストとしてHTMLへ出す。重要情報を画像内だけに置かない。
- 556職業名録、公開済み詳細記事、ニュース、ガイド、キャリアデータ室を通常リンクで接続する。
- `llms.txt`はサイトの公開範囲を説明する補助ファイルとして提供するが、GoogleのAI機能への掲載要件とは扱わない。
- 存在しない求人、給与、レビュー、評価を作らず、実在する単一求人でないページに`JobPosting`を付けない。

## 日付の扱い

記事の`datePublished`は一次資料の公表日ではなく、記事を初めて公開した日を使う。一次資料の公表日は本文で説明する。`dateModified`と画面上の確認日は、人が本文とリンクを実際に再確認した日だけ更新し、ビルド日では上書きしない。

## 公開後に必要な外部確認

1. Search Consoleの独立プロパティで所有権、sitemap、URL検査、モバイル描画を確認する。
2. Rich Results Testで代表ニュース・ガイドのJSON-LDと画像取得を確認する。
3. Search Consoleの検索パフォーマンスで表示回数、CTR、クエリ、ページを観測する。AI機能からの表示を別の順位保証指標にはしない。
4. 公開後の実URLでcanonical、robots、sitemap、OG画像、HTTPステータスを再検査する。

## 参照した公式資料

- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Influence your byline dates](https://developers.google.com/search/docs/appearance/publication-dates)
- [Sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

構造化データ、sitemap、canonicalは検索結果やAI回答への掲載を保証しない。公式資料もこの点を明示している。
