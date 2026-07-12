# 公開手順と未確認項目

## 公開前（必須）

- [x] ユーザーからGitHub／Cloudflareへの公開指示を受ける（2026-07-12）
- [ ] 商標の指定役務・類似称呼を含む追加確認を行う
- [ ] 問い合わせ先として承認済みGoogleフォームを設定、または非表示を維持する
- [x] 全外部リンクのHTTP確認結果を人が確認する（23件、2026-07-12）
- [x] canonical、sitemap、robotsを本番で確認する
- [x] career専用GA4 ID、Search Console所有権を確認する（2026-07-12）
- [ ] AdSenseを使う場合、手動枠だけで表示を確認し、自動広告を無効のままにする
- [x] 広告スクリプトなし／ありで375/768/1280pxの横あふれとhydrationを確認する（横あふれ0、hydration error 0。localhostのGoogle広告応答403は別記録）
- [x] GitHub `auto-Tech513/manapick-career` の `main` へpushする
- [x] Cloudflare Pages `manapick-career` へデプロイする
- [x] `career.manapick.app` のCNAME、TLS、Pages domain status=activeを確認する
- [x] Cloudflare PagesをGitHub `auto-Tech513/manapick-career` の `main` と連携し、push起点の自動デプロイを確認する（2026-07-12）
- [x] Cloudflare Configuration Ruleで `career.manapick.app` の未承認RUM自動挿入だけを無効化する（2026-07-12）

## 公開後

- [x] career専用Search Consoleプロパティを確認する（URL-prefix property、2026-07-12）
- [ ] 週次で `npm run source:check` と `npm run links:network` を実行する
- [ ] 表示回数、CTR、流入クエリ、回遊率を実測し、需要が確認できた職種だけ拡張する
- [ ] 自動検出結果を直接公開せず、人がreviewedを経てpublishedへ昇格する
