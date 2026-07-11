import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="manapick career ホーム">
      <span className="brand-mark" aria-hidden="true"><span>✓</span></span>
      <span className="brand-copy"><strong>manapick <em>career</em></strong>{compact ? null : <small>なりたい仕事まで、迷わせない。</small>}</span>
    </Link>
  );
}
