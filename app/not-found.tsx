import Link from "next/link";
import { PhraseText } from "@/components/PhraseTitle";

export default function NotFound() {
  return <div className="page-shell">
    <div className="e404">
      <p className="e404-code">404</p>
      <h1 className="phrase-breaks"><PhraseText text="この駅には、ページがありません。" /></h1>
      <p className="e404-lead">指定されたページは、移動または削除された可能性があります。職業を探す場合は職業名録へ、迷った場合は入口案内をご利用ください。</p>
      <p className="e404-actions">
        <Link className="button primary" href="/all/">職業を探す</Link>
        <Link className="button secondary" href="/route/">入口案内へ</Link>
        <Link className="button secondary" href="/">トップへ戻る</Link>
      </p>
    </div>
  </div>;
}
