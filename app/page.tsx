import "./home.css";
import { careerCard } from "@/lib/career-card";
import Link from "next/link";
import { categories, publishedJobs } from "@/content/jobs";
import { CareerExplorer } from "@/components/CareerExplorer";
import { CareerBriefing } from "@/components/CareerBriefing";
import { DailyCareerLoop } from "@/components/DailyCareerLoop";
import { EditorialPreview } from "@/components/EditorialPreview";
import { guides, publishedNews } from "@/content/editorial";
import { humanReviewedSlugByOccupation, occupationCatalog, occupationCatalogCategories, occupationDirectory, publishedOccupationCatalog } from "@/content/catalog";
import { HomeSearch, type HomeSearchItem } from "@/components/HomeSearch";
import profiles from "@/content/professional-careers.json";

import { ProfessionalEntries } from "@/components/ProfessionalEntries";
import { TownMap, TownScene } from "@/components/TownMap";
import { TransferCards } from "@/components/TransferCards";

const sideNav = [
  { label: "トップ", href: "/", current: true },
  { label: "職業を探す", href: "/all/" },
  { label: "入口案内", href: "/route/" },
  { label: "比較", href: "/compare/" },
  { label: "スキル", href: "/skills/" },
  { label: "ガイド", href: "/guide/" },
  { label: "ニュース", href: "/news/" },
  { label: "データ室", href: "/research/" },
  { label: "人気アクセス", href: "/ranking/" },
  { label: "手取りシミュレーター", href: "/tools/net-income/" },
  { label: "manapi商店", href: "/shop/" },
];

const pins = [
  { mark: "士", label: "税理士・弁護士", href: "/all/?q=税理士", style: { left: "22%", top: "300px" } },
  { mark: "医", label: "看護師・薬剤師", href: "/all/?q=看護師", style: { left: "47%", top: "200px" } },
  { mark: "IT", label: "エンジニア・データ", href: "/all/?q=エンジニア", style: { left: "52%", top: "410px" } },
  { mark: "育", label: "保育士・教員", href: "/all/?q=保育士", style: { left: "13%", top: "500px" }, spHide: true },
  { mark: "創", label: "デザイン・編集", href: "/all/?q=デザイン", style: { left: "64%", top: "300px" }, spHide: true },
];

export default function Home() {
  const detailedLinks: Record<string, string> = { ...humanReviewedSlugByOccupation, ...Object.fromEntries(profiles.items.map(item => [item.name, item.slug])) };
  const publishedIdSet = new Set(publishedOccupationCatalog.map(item => item.catalogId));
  const homeSearchItems: HomeSearchItem[] = occupationDirectory.map((occupation) => {
    const detail = detailedLinks[occupation.name];
    const hasPage = publishedIdSet.has(occupation.catalogId);
    return {
      name: occupation.name,
      aliases: occupation.aliases,
      category: occupationCatalogCategories.find(item => item.key === occupation.categoryKey)?.label ?? "",
      href: detail ? `/career/${detail}/` : hasPage ? `/occupation/${occupation.catalogId}/` : `/all/?q=${encodeURIComponent(occupation.name)}#catalog-title`,
      note: detail ? "career解説あり" : hasPage ? "個別ページあり" : "職業一覧で見る",
    };
  });
  return (
    <>
      <section className="town-hero">
        <div className="town-txt">
          <div className="town-kick">
            <span className="stn">CA<small>04</small></span>
            職業の仕事内容と、学びの入口を公式情報から。
          </div>
          <h1>
            どんな<mark className="marker">仕事</mark>を<br />
            知りたいですか？
          </h1>
          <p className="town-lead">
            {occupationCatalog.length}職業の名録から、仕事内容・必要な資格・年収の目安まで。地図を歩くように、近い仕事へ寄り道しながら探せます。
          </p>
          <HomeSearch items={homeSearchItems} />
          <nav className="town-quick" aria-label="職業情報の探し方">
            <Link className="k" href="/all/">{occupationCatalog.length}職業から探す</Link>
            <Link href="/career/tax-accountant/">税理士</Link>
            <Link href="/career/lawyer/">弁護士</Link>
            <Link href="/career/nurse/">看護師</Link>
            <Link href="/career/childcare-worker/">保育士</Link>
            <Link href="/compare/">仕事を比べる</Link>
            <Link href="/route/#workstyle">働き方から探す</Link>
          </nav>
        </div>
        <div className="town-map" aria-label="しごとの街の地図">
          <TownMap />
          <div className="town-pic" style={{ width: "170px", height: "140px", left: "30px", top: "70px", transform: "rotate(-4deg)" }}>
            <TownScene variant="office" />
            <span>税理士の仕事場</span>
          </div>
          <div className="town-pic sp-x" style={{ width: "150px", height: "130px", right: "30px", top: "380px", transform: "rotate(5deg)" }}>
            <TownScene variant="care" />
            <span>保育の現場</span>
          </div>
          <div className="town-pic sp-x" style={{ width: "180px", height: "130px", left: "330px", top: "520px", transform: "rotate(3deg)" }}>
            <TownScene variant="it" />
            <span>ITの現場</span>
          </div>
          {pins.map((pin) => (
            <Link
              key={pin.label}
              className={`town-pin${pin.spHide ? " sp-x" : ""}`}
              style={pin.style as React.CSSProperties}
              href={pin.href}
            >
              <i>{pin.mark}</i>
              {pin.label}
            </Link>
          ))}
        </div>
        <aside className="town-side">
          <ul>
            {sideNav.map((item) => (
              <li key={item.label} className={item.current ? "on" : undefined}>
                <Link href={item.href} aria-current={item.current ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="town-side-box">
            <b>3つの質問</b>
            だけで、
            <br />
            キャリア候補の入口へ。
            <br />
            回答は端末内にだけ保存。
          </div>
        </aside>
      </section>

      <div className="town-stats" role="group" aria-label="manapick careerの収録数">
        <div>
          <b>{occupationCatalog.length}<small>職業</small></b>
          <span>職業名録</span>
        </div>
        <div>
          <b>{publishedOccupationCatalog.length}<small>ページ</small></b>
          <span>仕事内容まで読める個別ページ</span>
        </div>
        <div>
          <b>{guides.length}<small>本</small></b>
          <span>職業ガイド</span>
        </div>
        <div>
          <b>{publishedNews.length}<small>本</small></b>
          <span>キャリアニュース</span>
        </div>
      </div>

      <ProfessionalEntries />
      <CareerBriefing />
      <DailyCareerLoop latestNews={publishedNews[0]} />
      <div id="jobs" className="scroll-anchor" />
      <CareerExplorer jobs={publishedJobs.map(careerCard)} categories={categories.map(x => ({ ...x }))} />

      <section className="sec sec-tight" aria-labelledby="entry-title">
        <div className="entry">
          <div className="entry-a">
            <span className="code code-on-dark">CA-04 · ENTRANCE</span>
            <h2 id="entry-title">
              3つの質問だけで、
              <br />
              キャリア候補の入口へ。
            </h2>
            <p>好きなこと・得意なこと・働き方の希望から、最初に読む職業を3つ選びます。</p>
            <Link className="entry-go" href="/route/">
              入口案内を始める →
            </Link>
          </div>
          <div className="entry-b">
            <div className="entry-qn">QUESTION 1 / 3</div>
            <div className="entry-qt">いま気になる方向は？</div>
            <div className="entry-op">
              <Link href="/route/">仕組みや数字</Link>
              <Link href="/route/">表現や届け方</Link>
              <Link href="/route/">人を支える</Link>
            </div>
            <p className="entry-lock">回答は端末内にのみ保存され、外部には送信されません。</p>
          </div>
        </div>
      </section>

      <EditorialPreview />

      <section className="sec sec-tight" aria-labelledby="transfer-title">
        <div className="eh">
          <div>
            <span className="code">TRANSFER</span>
            <h2 id="transfer-title">仕事が見えたら、乗り換える。</h2>
          </div>
        </div>
        <TransferCards
          labelStyle="top"
          cards={[
            { siteId: "manapick", title: "資格の学び方を動画で", description: "学習動画とロードマップ", href: "https://manapick.app/guide/certification/" },
            { siteId: "ai", title: "仕事で使われるAIを見る", description: "代表的なAIツールの使い方と比較", href: "https://ai.manapick.app/tool/chatgpt/" },
            { siteId: "license", title: "まず取りやすい国家資格から", description: "ITパスポートの要件と学習範囲", href: "https://license.manapick.app/license/it-passport/" },
            { siteId: "company", title: "この仕事がある企業を読む", description: "上場企業のランキングと数字", href: "https://company.manapick.app/ranking/" },
          ]}
        />
      </section>
    </>
  );
}
