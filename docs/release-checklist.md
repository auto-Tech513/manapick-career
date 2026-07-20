# 公開手順と未確認項目

確認日: 2026-07-20（JST）

このチェックリストは、公開リリースと外部サービスの確認事実を分けて記録する。`[x]` は記載日の確認事実であり、将来の広告充填、検索掲載、外部サービスの状態を保証しない。

## 公開リリース

- [x] Node.js v24.16.0のクリーン作業用cloneで最終状態の `npm run qa` を完走する（2026-07-20、静的生成633 / 633ページ、HTML 629件、内部リンク欠落0件）
- [x] ローカル静的出力を7経路 × 7幅の49ケースで確認し、横あふれ0・console error 0を確認する（2026-07-20）
- [x] 新規ガイド30本を `draft` にし、一覧、個別ページ、sitemap、llms.txt、JSON-LD、公開OG画像から除外する（`out/guide` は公開4件のみ、代表draft slugの公開出力混入0件）
- [ ] 新規ガイド30本の一次資料、重要主張、深い姉妹サイトリンク、OG画像を人が確認し、承認記録を付ける
- [x] 権利証跡を確認できなかった商品写真6点を削除し、編集部作成の抽象SVG6点へ差し替える（2026-07-18）
- [x] Pull Request [#3](https://github.com/auto-Tech513/manapick-career/pull/3)を `main` へマージし、merge commit `78f36cdb11bc5268e9b2f26e85eef29a9abdb346` をCloudflare Pagesの本番deployment `29eaf1a9` として公開する（2026-07-20）
- [x] 運用記録と生成物除外を整えたPull Request [#4](https://github.com/auto-Tech513/manapick-career/pull/4)をマージし、現在の `main` commit `5b9f5358e61db4f2cdbcb1908aba6ec508fd7871` を本番deployment `f498f00b` として公開する（2026-07-20）
- [x] 公開後にトップ、ガイド一覧、代表ニュース、sitemap.xml、llms.txtのHTTP 200、代表draft URLの404、sitemap / llms.txtの代表draft参照0件、公開ガイド個別リンク4件を確認する（2026-07-20）

## AdSense

- [x] publisher `pub-4108900975353940` と手動slot `8041327454`、`ads.txt` の一致を確認する
- [x] AdSenseの `manapick.app` が準備完了、ads.txt承認済み、ポリシーセンターが問題なしであることを確認する（2026-07-20）
- [x] `career.manapick.app` の自動広告除外が有効であることを管理画面で確認する（2026-07-20）
- [x] コード上、ニュース・ガイドの2番目の本文セクション後だけに手動レスポンシブ枠を置く
- [x] 本番で手動枠の充填済みクリエイティブを1回確認する（2026-07-20、継続充填の保証ではない）
- [ ] 代表URLの本番通信で意図しないページレベル自動広告が0件であることを確認する
- [ ] 充填済み実広告を伴う375 / 390 / 768 / 1024 / 1280 / 1440 / 1920pxの横あふれ、CSP、hydration、consoleを確認する
- [ ] 広告配信の制限と、広告ユニット別のリクエスト数・カバレッジ・未充填率を管理画面で確認する

## ニュース自動監査

- [x] 自動化 `manapick-career` を毎日08:00 / 18:00（Asia/Tokyo）、ACTIVEとして確認する（2026-07-20）
- [x] 専用ブランチへのcommitとreview-onlyのDraft PRまでに制限し、自動merge・自動公開を行わない
- [ ] 初回の定刻実行、採用0/1本、検査結果、Draft PR URLを確認する

## 既存本番・外部サービス

- [x] ユーザーからGitHub／Cloudflareへの公開指示を受ける（2026-07-12）
- [x] GitHub `auto-Tech513/manapick-career` の `main` とCloudflare Pages `manapick-career` のGit連携、自動デプロイを確認する（2026-07-12）
- [x] `career.manapick.app` のCNAME、TLS、Pages domain status=activeを確認する（2026-07-12）
- [x] Cloudflare Configuration Ruleでcareerの未承認RUM自動挿入を無効化する（2026-07-12）
- [x] career専用GA4 ID、Search Console URL-prefixプロパティ、sitemap送信を確認する（2026-07-12）
- [x] 姉妹サイトnetwork-map 26件のHTTP応答を確認する（26件正常、2026-07-20）
- [x] 出典レジストリ49件のHTTP応答を再検査する（正常47件 / bot制限2件 / 通信未確認0件 / 404・410は0件、2026-07-20）
- [x] 公開URLのHTTP、draft除外、デスクトップ描画、AdSense手動枠を確認する（2026-07-20）
- [ ] 公開URLの実機モバイル描画、Rich Results Test、Search Console URL検査、GA4受信を確認する

## 継続課題

- [ ] 商標の指定役務・類似称呼を含む専門確認を行う
- [ ] 問い合わせ先として承認済みGoogleフォームを設定、または非表示を維持する
- [ ] 週次で `npm run source:check` と `npm run links:network` を実行する
- [ ] 表示回数、CTR、流入クエリ、回遊率を実測し、需要が確認できた職種だけ拡張する
- [ ] 自動検出結果を直接公開せず、人がreviewedを経てpublishedへ昇格する
