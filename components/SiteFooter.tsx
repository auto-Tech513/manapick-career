import Link from "next/link";
import { Brand } from "./Brand";

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-inner">
    <div><Brand compact /><p>職業の仕事内容と学びの入口を、公式情報から整理するmanapick公式サイトです。</p></div>
    <nav aria-label="フッターナビゲーション">
      <div><strong>仕事を知る</strong><Link href="/all/">全職業</Link><Link href="/skills/">スキル</Link><Link href="/glossary/">用語集</Link><Link href="/faq/">FAQ</Link></div>
      <div><strong>サイト情報</strong><Link href="/about-method/">作成方法</Link><Link href="/operator/">運営者</Link><Link href="/privacy/">プライバシー</Link><Link href="/affiliate/">広告・PR</Link></div>
      <div><strong>大切な情報</strong><Link href="/disclaimer/">免責事項</Link><Link href="/contact/">訂正・お問い合わせ</Link><a href="https://x.com/manapick_app" target="_blank" rel="noopener noreferrer">公式X</a></div>
    </nav>
  </div><div className="footer-note">© manapick career　このサイトは求人紹介・職業あっせんを行いません。</div></footer>;
}
