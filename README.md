# manapick career

「学ぶ・AIを選ぶ・資格で証明する」を仕事につなぐ、manapick公式の職業・キャリアパス情報サイトです。

- 公開予定URL: `https://career.manapick.app`
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
- `source:check`: 出典レジストリと主張の鮮度を検査
- `similarity:check`: 職業本文間の高い類似度を警告
- `links:check`: 静的出力の内部リンク404を検査
- `links:network`: 姉妹サイトのHTTP状態を確認し、404とbot制限を区別

## コンテンツ公開

職業は `draft` → `reviewed` → `published` の順に人が承認します。独自本文、公式出典、確認日、関連動画、関連資格、関連AI、編集者確認が揃わないデータは `published` にしません。

`published` 以外は職業ページ、sitemap、llms.txt、JSON-LDに出力されません。更新日にはビルド日ではなく、実際に人が確認した日を記録します。

## デプロイ

GitHubの正本は `auto-Tech513/manapick-career` の `main` です。Cloudflare Pagesプロジェクトは `manapick-career`、公開先は `https://career.manapick.app` です。現在はQA済みの `out` をWrangler Direct Uploadで公開します。Node.js 22.13.0以上を使います。GitHub／Cloudflare／DNS／Search Console／GA4／AdSenseの実施状況は `docs/release-checklist.md` と `docs/qa-report.md` に記録します。

既存3サイトからcareerへの復路リンクは、career本番公開とHTTP確認の完了後に、関連ページだけへ文脈リンクとして追加します。一律相互リンクや職業本文の複製は行いません。
