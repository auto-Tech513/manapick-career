# manapick career QAレポート

確認日: 2026-07-12（JST）

## 静的生成・コンテンツ

- Next.js 16.2.6 `output: "export"`: 成功（37 routes）
- 職業: 12件 published / 0件 draft・reviewed
- カテゴリ: 6件
- 出典レジストリ: 15件
- 職業詳細SSG: 12件
- sitemap / llms.txt / JSON-LDのdraft混入: 0件
- JobPosting、架空rating、reviewCount、salary、employmentType: 0件
- 本文類似度警告: 0件
- 内部リンク404: 0件（34 HTML）
- 姉妹サイト個別リンク: 23件 ok / 0件 404 / 0件 bot制限 / 0件未確認

## コマンド

- `npm run lint`: 成功
- `npm run content:check`: 成功
- `npm run source:check`: 成功
- `npm run similarity:check`: 成功
- `npm run build`: 成功
- `npm run links:check`: 成功
- `npm run links:network`: 成功
- `npm audit --omit=dev`: 0 vulnerabilities

## 実ブラウザ

静的出力をローカル配信し、実ブラウザで確認した。

| 幅 | document幅 | 横あふれ |
| ---: | ---: | --- |
| 375 | 360 | なし |
| 390 | 375 | なし |
| 768 | 753 | なし |
| 1024 | 1009 | なし |
| 1280 | 1265 | なし |
| 1440 | 1425 | なし |
| 1920 | 1905 | なし |

- 職業検索: 「経理」で1件表示
- キーボード: Tab移動でカテゴリボタンへフォーカス到達、focus-visible実装済み
- 入口案内: 3問完了、理由付き候補3件、横あふれなし
- 比較: 最大3件。4件目を選んでも3件を維持
- 職業詳細: Article / BreadcrumbList / Occupationを表示本文と対応
- JobPosting: なし
- 外部リンク: `target="_blank" rel="noopener noreferrer"`
- ホーム、入口案内、比較、職業詳細のconsole warn/error: 0件
- GA4・AdSense環境変数なし: 外部スクリプト0件

## Lighthouse（ローカル静的配信・モバイル条件）

| Category | Score |
| --- | ---: |
| Performance | 61 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Performanceは95目安に未達。LCP 8.0秒、FCP 5.6秒で、Next.jsが出力する初期CSSとnext/fontの日本語フォントが主なレンダリング待ち。TBT 0ms、CLS 0。Cloudflare本番のキャッシュ・HTTP/2/3条件では再測定が必要だが、改善を保証しない。詳細は `docs/lighthouse.json`。

## 広告

- 手動広告feature flag: 既定OFF
- AdSense自動広告: 実装・有効化していない
- 広告スクリプトなし: 全指定幅で横あふれなし、hydration/console errorなし
- 広告スクリプトあり: **未確認**。承認済みクライアントIDがなく、公開前に有効化しない要件を優先した
- 管理画面での自動広告OFF確認: **未確認**

## 公開前に残る未確認

- 指定役務・類似称呼を含む専門的な商標確認
- GitHub、Cloudflare Pages、DNS、Search Console、GA4、AdSenseの本番設定
- 承認済み問い合わせフォーム
- 本番配信でのLighthouse再測定
- 広告スクリプトありの375/768/1280px確認

公開承認前のため、push・デプロイ・DNS・既存3サイト変更は実施していない。
