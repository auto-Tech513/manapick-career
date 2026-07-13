# manapick career QAレポート

確認日: 2026-07-13（JST）

## 静的生成・コンテンツ

- Next.js 16.2.10 `output: "export"`: 成功（607静的ページ）
- 職業: 12件 published / 0件 draft・reviewed
- 人手確認済み独自職業記事: 12件
- job tag解説系データから構造化した職業名録詳細: 556件 / 15カテゴリ
- 出典レジストリ: 33件
- 職業詳細SSG: 12件
- 職業名録詳細SSG: 556件
- ガイド: 一覧1件 / 詳細4件
- 更新情報: 一覧1件 / 詳細5件
- career manapi商店: 6商品 / メーカー公式出典6件
- 商店リンク: メーカー公式6件 / Amazonリンク6件をGETでHTTP 200確認。全Amazon URLに`tag=saunastampral-22`
- sitemap / llms.txt / JSON-LDのdraft混入: 0件
- JobPosting、架空rating、reviewCount、salary、employmentType: 0件
- 本文類似度警告: 0件
- 内部リンク404: 0件（603 HTML）
- 姉妹・外部確認対象リンク: 26件 ok / 0件 404 / 0件 bot制限 / 0件未確認

## コマンド

- `npm run lint`: 成功
- `npm run content:check`: 成功
- `npm run source:check`: 成功
- `npm run similarity:check`: 成功
- `npm run catalog:check`: 成功（556件の必須詳細・出典・帰属を確認）
- `npm run shop:check`: 成功（6商品・公式出典・PR表示・独自用途イラスト）
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
- ホーム、職業名録、職業名録詳細、ニュース詳細、ガイド詳細、商店の広告OFF時console warn/error: 0件
- ホームの見出し: 導入行weight 550 / 強調行weight 900。1440pxで45.36px
- ヒーロー後の一覧上余白: 375pxで36px / 1440pxで43.2px
- ハンバーガーメニュー: 2列タイル、375pxで横あふれ0、縦スクロール可能
- ガイド詳細: 執筆者、編集者、確認方法、最終確認日、公式出典2件を表示
- ニュース・ガイド詳細: X / Threads / Bluesky / LINE / はてな / LinkedIn / メール / URLコピー / Web Share API導線を表示
- 職業名録詳細: 仕事内容、就くには、条件、資格、団体、出典、前後職業、姉妹サイト導線を表示
- 商店: PRをページ上部とAmazonリンク付近に表示。Amazonの商品画像・価格・在庫・レビューは保存・転載せず、独自の用途イラストを表示
- 既定ビルド: AdSenseスクリプトなし、全指定幅で横あふれ・hydration errorなし
- 主要6ページ × 7幅 = 42条件: 横あふれ0、hydration error 0、アプリ由来console warn/error 0

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
- この節の本番値は前回デプロイ時点。2026-07-13の556職業名録・共有・商店変更は、Git push後に再確認して更新する
- 本番HTML・sitemap・llms.txt: draft / reviewed / JobPosting / rating / reviewCountの混入0件
- 本番375 / 390 / 768 / 1024 / 1280 / 1440 / 1920px: 横あふれ0件、console warn/error 0件
- 本番入口案内: 3問完了、理由付き候補3件、順位・適性判定ではない旨を表示
- GA4: career専用 `G-WW5XWW0YFE` を設定済み
- 親ゾーンのCloudflare RUM自動挿入は、Configuration Rule `(http.host eq "career.manapick.app")` でcareerだけ無効化。姉妹サイト設定は変更なし
- 上記ルール反映後の新規ブラウザ: 外部RUMビーコン0件、console warn/error 0件
- 公開方式: Cloudflare Pages Git integration。`main` へのpushが本番デプロイを起動

## Lighthouse（ローカル静的配信・モバイル条件）

| Category | Score |
| --- | ---: |
| Performance | 91 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

今回のUI変更後に再計測。FCP 0.9秒、LCP 3.5秒、TBT 10ms、CLS 0。日本語Webフォントの配信をやめて端末標準フォントへ切り替え、表示64px以下のアイコンを907KB版から31KB版へ変更した。Cloudflare本番のキャッシュ・HTTP/2/3条件とは異なるため、本番値を保証しない。詳細は `docs/lighthouse.json`。

## 広告

- 手動広告feature flag: 既定OFF
- AdSense自動広告: 実装・有効化していない
- 広告スクリプトなし: 全指定幅で横あふれなし、hydration/console errorなし
- 広告スクリプトあり: 承認済みクライアントIDでホーム・商店・ニュース詳細を375 / 390 / 768 / 1024 / 1280 / 1440 / 1920pxで確認（21条件）。横あふれ0、hydration error 0
- GoogleスクリプトへNext.js固有の`data-nscript`属性が付かないこと、同属性に関する警告0件を確認
- localhostではGoogle広告リクエストが403となるため、広告クリエイティブの充填表示は**未確認**。403とアプリの404・レイアウト不良を区別して記録
- 管理画面での自動広告OFF確認: **未確認**

## 公開前に残る未確認

- 指定役務・類似称呼を含む専門的な商標確認
- AdSense管理画面でのcareer向け手動枠の実広告充填表示
- Amazon販売ページの現在価格・在庫・型番一致（動的情報のため購入時に利用者が確認）
- 承認済み問い合わせフォーム
- 本番配信でのLighthouse再測定

GitHub push、Cloudflare Pages、DNSは2026-07-12に実施した。career公開前の導線を維持する要件に従い、既存3サイトの復路リンク変更はまだ実施していない。
