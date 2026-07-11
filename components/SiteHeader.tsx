import Link from "next/link";
import { Brand } from "./Brand";

const network = [
  {href:"https://manapick.app/",label:"学ぶ",tone:"blue"},
  {href:"https://ai.manapick.app/",label:"AIを選ぶ",tone:"red"},
  {href:"https://license.manapick.app/",label:"資格で証明",tone:"green"},
];

export function SiteHeader() {
  return <header className="site-header">
    <div className="header-inner">
      <Brand />
      <nav className="primary-nav" aria-label="主要ナビゲーション">
        <Link href="/all/">職業を探す</Link><Link href="/route/">入口案内</Link><Link href="/compare/">比較</Link><Link href="/about-method/">編集方針</Link>
      </nav>
      <nav className="network-nav" aria-label="manapick姉妹サイト">
        {network.map((item)=><a key={item.href} className={`network-pill ${item.tone}`} href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>)}
      </nav>
    </div>
  </header>;
}
