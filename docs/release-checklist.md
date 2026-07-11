# 公開手順と未確認項目

## 公開前（必須）

- [x] ユーザーからGitHub／Cloudflareへの公開指示を受ける（2026-07-12）
- [ ] 商標の指定役務・類似称呼を含む追加確認を行う
- [ ] 問い合わせ先として承認済みGoogleフォームを設定、または非表示を維持する
- [x] 全外部リンクのHTTP確認結果を人が確認する（23件、2026-07-12）
- [x] canonical、sitemap、robotsを本番で確認する
- [ ] career専用GA4 ID、Search Console所有権を確認する
- [ ] AdSenseを使う場合、手動枠だけで表示を確認し、自動広告を無効のままにする
- [ ] 広告スクリプトなし／ありで375/768/1280pxの横あふれとコンソールを確認する
- [x] GitHub `auto-Tech513/manapick-career` の `main` へpushする
- [x] Cloudflare Pages `manapick-career` へデプロイする
- [x] `career.manapick.app` のCNAME、TLS、Pages domain status=activeを確認する
- [ ] Cloudflare PagesのGit自動デプロイを有効化する（現在はDirect Upload。GitHub Appへのリポジトリ権限は追加済み）

## 公開後

- [ ] career専用Search Consoleプロパティを確認する
- [ ] 週次で `npm run source:check` と `npm run links:network` を実行する
- [ ] 表示回数、CTR、流入クエリ、回遊率を実測し、需要が確認できた職種だけ拡張する
- [ ] 自動検出結果を直接公開せず、人がreviewedを経てpublishedへ昇格する
