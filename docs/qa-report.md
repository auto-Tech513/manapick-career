# manapick career QAレポート

確認日: 2026-07-12（JST）

## 静的生成・コンテンツ

- Next.js 16.2.10 `output: "export"`: 成功（38 routes、manifestを含む）
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
- `npm audit`: 開発依存を含め0 vulnerabilities

## 実ブラウザ

静的出力をローカル配信し、実ブラウザで確認した。

| 幅 | document幅 | 横あふれ |
| ---: | ---: | --- |
| 375 | 375 | なし |
| 390 | 390 | なし |
| 768 | 768 | なし |
| 1024 | 1024 | なし |
| 1280 | 1280 | なし |
| 1440 | 1440 | なし |
| 1920 | 1920 | なし |

- 職業検索: 「経理」で1件表示
- キーボード: Tab移動でカテゴリボタンへフォーカス到達、focus-visible実装済み
- 入口案内: 3問完了、理由付き候補3件、横あふれなし
- 比較: 最大3件。4件目を選んでも3件を維持
- 職業詳細: Article / BreadcrumbList / Occupationを表示本文と対応
- JobPosting: なし
- 外部リンク: `target="_blank" rel="noopener noreferrer"`
- ホーム、入口案内、比較、職業詳細のconsole warn/error: 0件
- GA4・AdSense環境変数なし: 外部スクリプト0件

## 本番配信

- GitHub: `https://github.com/auto-Tech513/manapick-career`（public / default branch `main`）
- Cloudflare Pages: project `manapick-career` / GitHub source `auto-Tech513/manapick-career` / production branch `main`
- 自動デプロイ: GitHub push `da0d3a1fc1cf66ec5e60d0d216438706d4509153` を検知し、clone / `npm run qa` / deployの全stageが成功
- Cloudflareビルド: `npm run qa` / output `out` / Node.js `22.13.0` / `NEXT_PUBLIC_SITE_URL=https://career.manapick.app`
- 本番: `https://career.manapick.app`（HTTP 200）
- カスタムドメイン: Pages APIのdomain status / verification / validationがすべて `active`
- DNS: `career.manapick.app` → `manapick-career.pages.dev`、Cloudflare proxy有効
- TLS: HTTP/2 200、HSTS / CSP / nosniff / Referrer-Policy / frame制限を応答ヘッダーで確認
- robots / sitemap / llms.txt / manifest / 職業詳細 / カテゴリ: すべてHTTP 200
- sitemap: 31 URL、llms.txtの職業URL: 12件
- 本番HTML・sitemap・llms.txt: draft / reviewed / JobPosting / rating / reviewCountの混入0件
- 本番375 / 390 / 768 / 1024 / 1280 / 1440 / 1920px: 横あふれ0件、console warn/error 0件
- 本番入口案内: 3問完了、理由付き候補3件、順位・適性判定ではない旨を表示
- GA4・AdSense環境変数なし: 本番の該当外部スクリプト0件
- 親ゾーンのCloudflare RUM自動挿入は、Configuration Rule `(http.host eq "career.manapick.app")` でcareerだけ無効化。姉妹サイト設定は変更なし
- 上記ルール反映後の新規ブラウザ: 外部RUMビーコン0件、console warn/error 0件
- 公開方式: Cloudflare Pages Git integration。`main` へのpushが本番デプロイを起動

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
- Search Console、GA4、AdSenseの本番設定
- 承認済み問い合わせフォーム
- 本番配信でのLighthouse再測定
- 広告スクリプトありの375/768/1280px確認

GitHub push、Cloudflare Pages、DNSは2026-07-12に実施した。career公開前の導線を維持する要件に従い、既存3サイトの復路リンク変更はまだ実施していない。
