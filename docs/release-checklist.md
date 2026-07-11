# 公開手順と未確認項目

## 公開前（必須）

- [ ] ユーザーから「公開承認」を受ける
- [ ] 商標の指定役務・類似称呼を含む追加確認を行う
- [ ] 問い合わせ先として承認済みGoogleフォームを設定、または非表示を維持する
- [ ] 全外部リンクのHTTP確認結果を人が確認する
- [ ] GA4 ID、Search Console、canonical、sitemap、robotsを本番で確認する
- [ ] AdSenseを使う場合、手動枠だけで表示を確認し、自動広告を無効のままにする
- [ ] 広告スクリプトなし／ありで375/768/1280pxの横あふれとコンソールを確認する
- [ ] Cloudflare Pages、DNS、GitHub pushは承認後に実施する

## 公開後

- [ ] career専用Search Consoleプロパティを確認する
- [ ] 週次で `npm run source:check` と `npm run links:network` を実行する
- [ ] 表示回数、CTR、流入クエリ、回遊率を実測し、需要が確認できた職種だけ拡張する
- [ ] 自動検出結果を直接公開せず、人がreviewedを経てpublishedへ昇格する
