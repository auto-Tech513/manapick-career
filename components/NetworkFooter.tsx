import Link from "next/link";
import { stations, stationHref } from "../lib/stations";
import { menuSections } from "../lib/menu";
import { NewsletterForm } from "./NewsletterForm";

/**
 * manapick 7サイト共通のフッター骨格（FOOTER_SPEC 2026-11-18）。1枚の墨色の帯に、上から
 *   1. メルマガ（Kit フォーム）
 *   2. サイトの案内（ロゴ＋1行の説明／リンクのまとまり3つ・各6件まで）
 *   3. ネットワーク帯「学びは、6つの駅でつながっています。」（駅の説明文は全サイト共通の文）
 *   4. 注記＋最下段の小さなリンク
 * を並べる。駅のデータは lib/stations（content/network-site.json）から。
 */

// フッターの駅の説明文は7サイトで同じ文にそろえる（FOOTER_SPEC）。
// 上部の路線帯・SP の乗り換えシートは従来どおり network-site.json の文を使う。
const FOOTER_STATION_TEXT: Record<string, string> = {
  manapick: "学ぶ — 無料の学習動画",
  ai: "道具を選ぶ — AIの比較と使い方",
  license: "証明する — 資格・検定の比較",
  career: "仕事につなぐ — 職業と学ぶ順番",
  company: "企業を読む — 企業の物語と数字",
  politics: "政治と法律 — コミカルに易しく",
};

// サイトの案内に出すまとまり（メニューと同じ区分・名前）。「このサイトについて」は最下段の小さなリンクへ。
const GUIDE_SECTIONS = menuSections.filter((section) => section.key !== "about").map((section) => ({
  ...section,
  items: section.items.slice(0, 6),
}));

export default function NetworkFooter() {
  return (
    <footer className="route foot" aria-label="manapick career のフッター">
      <div className="foot-inner">
        <section className="foot-news" aria-label="manapick メルマガ登録">
          <NewsletterForm context="footer" />
        </section>

        <nav className="foot-guide" aria-label="サイトの案内">
          <div className="foot-brand">
            <Link href="/" className="foot-logo" aria-label="manapick career トップ"><span className="wm"><span className="wm-m">manapick</span><span className="wm-sub">career</span></span></Link>
            <p>職業の仕事内容と、学びの入口を公式情報から。</p>
          </div>
          {GUIDE_SECTIONS.map((section) => (
            <div className="foot-col" key={section.key}>
              <p className="foot-col-title">{section.title}</p>
              <ul>
                {section.items.map((item) => (
                  <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="foot-net" aria-label="manapick公式6サイト">
          <p className="route-kick">MANAPICK NETWORK</p>
          <p className="route-lead">
            <span className="nw">学びは、</span>
            <span className="nw">6つの駅でつながっています。</span>
          </p>
          <div className="route-map">
            {stations.map((station) => (
              <a
                key={station.id}
                className={`route-st${station.current ? " on" : ""}`}
                style={{ "--c": station.color } as React.CSSProperties}
                href={stationHref(station, "footer")}
                aria-current={station.current ? "page" : undefined}
              >
                <i aria-hidden="true" />
                <em>{station.code}</em>
                <b>{station.name}</b>
                <span>{FOOTER_STATION_TEXT[station.id] ?? `${station.role} — ${station.description}`}</span>
              </a>
            ))}
          </div>
        </div>

        <p className="foot-note">職業理解と学びの入口のための一般的な情報です。適性・採用可能性・収入・合格は保証せず、求人や職業紹介は行いません。一部に広告・PRを含みます。</p>
        <div className="route-legal">
          <Link href="/about-method/">作成方法</Link>
          <Link href="/operator/">運営者</Link>
          <Link href="/privacy/">プライバシー</Link>
          <Link href="/affiliate/">広告・PR</Link>
          <Link href="/disclaimer/">免責事項</Link>
          <Link href="/contact/">お問い合わせ</Link>
          <span>© manapick career</span>
        </div>
      </div>
    </footer>
  );
}
