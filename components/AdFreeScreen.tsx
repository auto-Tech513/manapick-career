/**
 * 広告を読み込まない画面の目印（2026-11-26、404 画面。AdSense のポリシー上、中身の無い画面に広告を出さないため。ai と同じ考え方）。
 * layout の自動広告の読み込み部品は、この目印（data-ad-free-screen）がある文書では adsbygoogle.js を読み込まない。
 * （scripts/check-monetization.mjs は広告の部品名を含むファイルを広告の混入として数えるため、ここでは部品名を書かない）
 * クライアントの部品にしない（全ページの JS を増やさないため）。存在しない URL への画面の切り替えは、
 * 静的書き出しでは文書の読み込み直しになる（2026-11-26 にローカルのビルドで確認）ので、目印だけで足りる。
 */
export function AdFreeScreen() {
  return <span hidden data-ad-free-screen="" />;
}
