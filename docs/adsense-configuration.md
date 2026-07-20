# AdSense設定記録

確認日: 2026-07-20（JST）

## 実装

- クライアント: `ca-pub-4108900975353940`
- 手動レスポンシブ広告ユニット: `manapick-career-inline`
- スロット: `8041327454`
- 配置: ニュース・ガイドの長文本文で、2番目のセクション後だけ
- ホーム、manapi商店、一覧、入口案内、比較、主要CTA付近には広告スクリプトも広告枠も配置しない
- Googleが推奨するレスポンシブ `data-ad-format="auto"` と `data-full-width-responsive="true"` を使い、画面幅ごとに広告候補を横長だけへ制限しない
- 未充填の広告要素を独自CSSで隠さず、Googleが `data-ad-status="unfilled"` を付けた場合は別要素として自社のmanapi商店案内を表示する
- CSPは姉妹サイトの実運用設定を基に、承認済みGA4・AdSenseに必要なGoogle配信先だけを許可する
- `scripts/check-monetization.mjs` でpublisher ID、slot ID、ads.txt、CSP、記事内配置、承認外ページへの混入をビルド前に検査する

## 管理画面

- 親ドメイン `manapick.app` はAdSenseサイトとして準備完了、ads.txt承認済み
- 2026-07-20確認時点でポリシーセンターは問題なし
- 親ドメインの自動広告は、既存姉妹サイトの設定としてオンのまま維持
- `career.manapick.app` を「セクションに属するすべてのページ」のページ除外へ追加
- 2026-07-14に「今すぐ適用」で保存し、管理画面の一覧でページ除外 `1` と保存成功メッセージを確認
- 2026-07-20にcareerの自動広告除外が有効であることを再確認

## 本番で確認した事実（2026-07-20）

- ニュース詳細ページでAdSense本体スクリプトはHTTP 200で読み込まれ、ブラウザコンソールエラーは0件だった
- 手動枠 `8041327454` は表示幅758px・リクエスト面90pxの有効な広告リクエストをGoogleへ送り、Googleのレスポンス自体はHTTP 200だった
- 最初の確認ではGoogleが同じ手動枠へ `data-ad-status="unfilled"` を付与し、実クリエイティブではなくmanapi商店の自社案内が表示された
- その後の同日本番確認では同じpublisher・slotが `data-ad-status="filled"` となり、広告クリエイティブの配信を1回確認した。確認時の外側の広告要素は758×280pxで、ブラウザログは0件だった
- `https://career.manapick.app/ads.txt` はpublisher `pub-4108900975353940` を返し、CSPは当該広告リクエストを遮断していなかった

このため、2026-07-20の「広告が見えない」確認回は、スクリプト未設置、CSP違反、ads.txt欠落、広告枠のゼロ幅ではなく、当該リクエストが未充填だった。一方、別の確認回では同じ枠が充填されたため、サイト実装が配信を妨げ続けている状態でもない。充填はリクエストごとに変わり、サイト側から広告需要やGoogleの配信判断を強制できない。

## レスポンシブ表示検証

2026-07-20の静的ビルドを実ブラウザで確認し、`document.documentElement.scrollWidth` は375 / 390 / 768 / 1280pxの全幅でviewportと一致した。広告枠による横あふれは0pxだった。ただし、これは全幅で充填済みクリエイティブを表示した試験ではない。充填を確認できたのは1回だけであり、充填済み実広告を伴う375 / 390 / 768 / 1024 / 1280 / 1440 / 1920pxの全幅確認は未確認である。

## 未確認・継続確認

- 広告配信の制限が発生していないこと
- 広告ユニット別レポートで `manapick-career-inline` のリクエスト数、カバレッジ、未充填率を確認すること
- careerのページ除外設定は確認済みだが、代表URLの本番通信で意図しないページレベル自動広告が0件であること
- 充填された実広告ありの本番375 / 390 / 768 / 1024 / 1280 / 1440 / 1920px表示

実広告が表示されることはサイト実装だけでは保証できない。審査、広告需要、同意、地域、ブロッカー、Google側配信判断を「実装不良」と混同しない。

## Google公式資料

- [Create a display ad unit](https://support.google.com/adsense/answer/9274025)
- [Ad unit code requirements](https://support.google.com/adsense/answer/9183363)
- [How to personalize your page based on the status of the ad unit](https://support.google.com/adsense/answer/10762946)
- [Factors that affect ad serving](https://support.google.com/adsense/answer/10196)
- [Ad serving limits](https://support.google.com/adsense/answer/9437976)
- [Guide to ads.txt](https://support.google.com/adsense/answer/7679060)
