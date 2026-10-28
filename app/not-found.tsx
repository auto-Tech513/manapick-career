import Link from "next/link";

export default function NotFound() {
  return <div className="page-shell">
    <header className="page-heading"><span className="eyebrow">404</span><h1>ページが見つかりません</h1>
      <p>指定されたページは、移動または削除された可能性があります。職業を探す場合は職業名録へ、迷った場合は入口案内をご利用ください。</p></header>
    <p style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      <Link className="button primary" href="/all/">職業を探す</Link>
      <Link className="button secondary" href="/route/">入口案内へ</Link>
      <Link className="button secondary" href="/">トップへ戻る</Link>
    </p>
  </div>;
}
