# manapick career QAレポート

確認日: 2026-07-14（JST）

## 判定

ローカル実装と静的出力の品質検査は合格した。ただし、次の公開条件が残るため、今回の差分はGitHubへpushせず、本番へ自動デプロイしていない。

1. `public/shop/` の6商品画像について、メーカーからの転載・公衆送信許諾を示す証跡が未確認。詳細は `docs/product-image-clearance.md` に記録した。
2. `career.manapick.app` の自動広告除外は保存済みだが、管理画面が案内する最長1時間の反映後に、本番通信でページレベル自動広告が0件になることは未確認。

現行本番はこの差分を含まない。以下は、権利・広告設定の解消後に公開できる候補版の検査結果である。

## 静的生成・コンテンツ

- Next.js 16.2.10 / Node.js 22.13.0 / `output: "export"`: クリーンな一時ディレクトリで成功
- 生成ルート: 633ページ
- 内部リンク検査: 629 HTML、リンク先欠落0件
- 人手確認済み詳細職業: 12件
- 職業名録: 556件 / 15カテゴリ
- ニュース: 30件。各記事1,000字以上、結論、目次、一次出典、確認日、執筆・編集情報を検査
- ガイド: 4件。各記事1,000字以上、目次、出典、確認日、執筆・編集情報を検査
- OGP: ニュース30画像 / ガイド4画像。1200×630 PNGをビルド前に生成
- 出典レジストリ: 49件
- 競合・参照サイト台帳: 100件。主要画面まで確認した `deep` 25件、公開画面から用途を確認した `surface` 75件
- manapi商店: 6商品。商品画像6件、メーカー公式仕様リンク6件、Amazon PRリンク6件
- sitemap / llms.txt / JSON-LD / 公開HTMLのdraft混入: 0件
- JobPosting、存在しないrating・reviewCount・salary・employmentType: 0件
- ニュース・ガイドのcanonical、OG URL、Article JSON-LD image: 表示URLと一致

## 自動検査

- `npm run lint`: 成功
- `npm run content:check`: 成功
- `npm run catalog:check`: 成功
- `npm run editorial:check`: 成功
- `npm run backlog:check`: 成功
- `npm run monetization:check`: 成功
- `npm run shop:check`: 成功
- `npm run competitive:check`: 成功（100件、deep 25 / surface 75）
- `npm run competitive:network`: 正常92件 / 404・410は0件 / bot制限6件 / 通信未確認2件
- `npm run links:network`: 正常26件 / 欠落0件 / bot制限0件 / 未確認0件
- `npm run source:check`: 成功
- `npm run source:network`: 正常46件 / 404・410は0件 / bot制限2件 / 通信未確認1件
- `npm run similarity:check`: 成功
- `npm run build`: 成功（クリーンな一時ディレクトリ）
- `npm run links:check`: 成功
- `npm audit`: 0 vulnerabilities

元のiCloud配下リポジトリでは、コンパイル・型検査・633ページ生成後の最終コピーがファイルI/O待ちで停止した。同一ソースを `/tmp` のクリーン環境へ複製したビルドは完了しており、コード不良とストレージI/Oを区別した。

## 実ブラウザ

ローカル静的出力を実ブラウザで確認した。対象はホーム、manapi商店、ニュース一覧、ニュース詳細、ガイド詳細、キャリアデータ室、職業名録の7ルートで、375 / 390 / 768 / 1024 / 1280 / 1440 / 1920pxの49条件。

| 項目 | 結果 |
| --- | --- |
| `document.scrollWidth <= viewport` | 49/49 |
| 壊れた画像 | 0件 |
| manapi商店の商品画像 | 6/6をeager読込、各900px幅を確認 |
| hydration / page error | 0件 |
| アプリ由来console error | 0件 |
| モバイルメニュー横あふれ | 0件 |
| モバイルメニュー中のbody scroll | ロック済み |
| ホームのAdSenseスクリプト | なし |
| 長文記事の手動広告スロット | あり |
| ニュース詳細OG / canonical | 一致 |

localhostではGoogle広告リクエストがHTTP 403となった。除外保存前の検査では、手動スロット `8041327454` へのリクエストと、親ドメインの自動広告によるページレベルリクエストの両方を確認した。その後、管理画面で `career.manapick.app` を自動広告から除外し、「今すぐ適用」の保存成功とページ除外1件を確認した。実広告の充填と反映後の本番通信は未確認であり、403をアプリの404やレイアウト不良とは区別して記録する。未充填枠をCSSで隠していない。詳細は `docs/adsense-configuration.md` に記録した。

## SEO・AEO・AI検索対応

- 各独自ページは自己canonical。姉妹サイトとのcanonical共有なし
- robots、sitemap、llms.txt、Article / CollectionPage / BreadcrumbList等の表示一致JSON-LDを生成
- `/research/` に数値の「示すこと・示さないこと・次に確認すること」を整理
- AI検索専用の特別なschemaや掲載保証は存在すると断定せず、Google公式の通常SEO要件、クロール可能性、一次出典、明確な著者・確認日を基準化
- 実装根拠は `docs/seo-aeo-aio.md`、競合比較の範囲と限界は `docs/competitive-analysis-100.md` に記録

## 公開前に必須の確認

- 商品画像6件の利用許諾証跡、または権利処理済み画像への差し替え
- 保存済みのAdSense自動広告除外が反映した後、手動広告だけになることをcareer本番通信で確認
- 本番で手動広告枠の実充填、横あふれ、CSP、hydration errorを全指定幅で再確認
- 競合台帳のうち `surface` 75件は主要画面の精読未実施。100件すべてを深掘りしたとは表記しない
- 競合台帳の通信未確認2件（日本経済新聞の人的資本ページ、Jobs and Skills Australia）を人が再確認
- 出典レジストリの通信未確認1件（Logicool MX Master 3S公式ページ）を人が再確認
- 名称・商標の専門家判断、承認済み問い合わせフォーム、本番Search Console・sitemap・GA4受信

画像権利と広告反映後の本番検証が解消するまで、公開成功とは報告しない。
