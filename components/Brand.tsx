import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="manapick career ホーム">
      <span className="brand-mark" aria-hidden="true">
        <Image src="/brand/career-icon-192.png" alt="" width={42} height={42} priority />
      </span>
      <span className="brand-copy"><strong>manapick <em>career</em></strong>{compact ? null : <small>なりたい仕事まで、迷わせない。</small>}</span>
    </Link>
  );
}
