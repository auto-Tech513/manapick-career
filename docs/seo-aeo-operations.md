# SEO / AEO 運用方針（2026-07-12確認）

## 基本方針

GoogleのAI検索機能にも、通常の検索と同じくクロール可能性、インデックス可能性、スニペット表示可否、役立つ独自コンテンツが基盤になる。特別な「AEO専用タグ」や、表示本文にない回答・評価・求人情報は生成しない。

- 職業、ガイド、ニュースはそれぞれ独自の検索意図へ答え、自己canonicalとする。
- ニュースは一次情報の数字、意味、限界、行動を独自に整理する。
- 長文記事は冒頭に簡潔な回答、要点、目次を表示し、本文と構造化データを一致させる。
- Article / NewsArticle、BreadcrumbListは可視本文と一致する場合だけ出力する。
- FAQは可視本文として維持するが、2026年5月にGoogleがFAQリッチリザルトを廃止したため、FAQPageでの検索表示を前提にしない。
- 更新日はビルド日で上書きせず、人が主張とリンクを確認した日だけ変更する。
- RSS、sitemap、llms.txtには公開済みデータだけを含める。

## 公開後の確認

1. `career.manapick.app`を独立したSearch Consoleプロパティとして確認する。
2. `/sitemap.xml`を送信し、インデックス状況とクロールエラーを確認する。
3. 表示回数、CTR、検索クエリ、記事から職業ページへの回遊を実測する。
4. 検索需要だけで薄いページを量産せず、一次情報と独自説明を用意できるテーマだけを追加する。
5. 構造化データの警告は表示本文と照合し、存在しない給与、評価、求人条件を補わない。

## 公式参照

- Google Search Central: AI features and your website
- Google Search Central: Creating helpful, reliable, people-first content
- Google Search Central: Structured data general guidelines / Breadcrumb
- Google Search ranking updates: FAQ rich results deprecation (2026-05-07)
