# manapick career

「学ぶ・AIを選ぶ・資格で証明する」を仕事につなぐ、manapick公式の職業・キャリアパス情報サイトです。

- 公開URL: `https://career.manapick.app`
- ブランドコピー: 「なりたい仕事まで、迷わせない。」
- Next.js App Router / TypeScript / React / Tailwind CSS
- `output: "export"` の完全静的サイト
- 職業情報の正本。姉妹サイトへ本文を複製しない

## 開発

```bash
npm install
npm run dev
```

`NEXT_PUBLIC_SITE_URL` が未設定の場合は `https://career.manapick.app` を使います。

## 品質ゲート

```bash
npm run qa
npm run links:network
npm audit --omit=dev
```

- `content:check`: 公開条件、必須項目、禁止表現、sourceId、network itemを検査
- `editorial:check`: ニュース・ガイドの本文、出典、公開状態、記事固有本文、OG画像を検査
- `monetization:check`: AdSenseのpublisher、手動slot、ads.txt、CSP、記事内配置を検査
- `shop:check`: PR表示、公式出典、権利処理済みの独自イラストを検査
- `source:check`: 出典レジストリと主張の鮮度を検査
- `similarity:check`: 職業本文間の高い類似度を警告
- `links:check`: 静的出力の内部リンク404を検査
- `links:network`: 姉妹サイトのHTTP状態を確認し、404とbot制限を区別

## コンテンツ公開

職業、ガイド、ニュースは `draft` → `reviewed` → `published` の順に人が承認します。ニュースの公開状態は本文データから分離した `content/news-publication.json` を正本とし、レコードがない、または公開日・人によるレビュー・追跡可能な承認証跡が揃わない記事はfail-closedで公開しません。

`published` 以外の職業詳細・ガイド・ニュースは、公開一覧、個別ページ、sitemap、RSSフィード、llms.txt、JSON-LD、公開OG画像に出力されません。追加ニュースは共通定型文を除く記事固有本文を1,000字以上にし、更新日にはビルド日ではなく、実際に人が確認した日を記録します。

毎日08:00 / 18:00（JST）のニュース自動監査は、最新の一次資料から候補を作っても `status: "draft"` のまま専用ブランチへcommitし、Draft PRの作成を試みるだけです。自動処理はstatusを `published` に変更せず、`main` へmergeせず、本番公開もしません。編集者が一次資料、全主張、リンク、本文、OG画像を確認し、レジストリへ人のレビュー証跡を記録した後だけ公開候補にできます。登録内容、実行履歴、未確認事項は `docs/news-automation.md` に記録します。

## デプロイ

GitHubの正本は `auto-Tech513/manapick-career` の `main` です。Cloudflare Pagesプロジェクト `manapick-career` はこのブランチとGit連携し、pushごとに `npm run qa` を実行して、合格した `out` だけを `https://career.manapick.app` へ自動デプロイします。Cloudflareのビルド環境はNode.js 22.13.0に固定しています。GitHub／Cloudflare／DNS／Search Console／GA4／AdSenseの実施状況は `docs/release-checklist.md` と `docs/qa-report.md` に記録します。

既存3サイトからcareerへの復路リンクは、career本番公開とHTTP確認の完了後に、関連ページだけへ文脈リンクとして追加します。一律相互リンクや職業本文の複製は行いません。
