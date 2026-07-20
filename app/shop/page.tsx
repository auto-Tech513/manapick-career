import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Check, ExternalLink, ShoppingBag } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { careerShopPolicy, careerShopProducts } from "@/content/shop-products";
import { absoluteUrl } from "@/lib/site";

const title = "manapi商店｜学び直し・面接・仕事準備の道具";
const description = "オンライン面接、学び直し、ポートフォリオ、作業環境に使う実在商品を、向く人・選ぶ理由・購入前の確認点・メーカー公式情報とともに掲載します。";
const url = absoluteUrl("/shop/");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/shop/" },
  openGraph: { title, description, url, type: "website" },
  twitter: { card: "summary", title, description },
};

const graph = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: title,
  description,
  url,
  isPartOf: { "@id": absoluteUrl("/#website") },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: careerShopProducts.length,
    itemListElement: careerShopProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: `${url}#${product.id}`,
    })),
  },
};

export default function ShopPage() {
  return <><JsonLd data={graph}/><div className="page-shell wide career-shop-page">
    <nav className="article-breadcrumbs" aria-label="パンくずリスト"><Link href="/">ホーム</Link><span>/</span><span aria-current="page">manapi商店</span></nav>
    <header className="career-shop-hero"><span className="career-shop-mark"><ShoppingBag aria-hidden="true" /></span><div><span className="eyebrow">PR / CAREER WORK TOOLS</span><h1>manapi商店</h1><p>職業選びを急がせる商品棚ではありません。学び直し、オンライン面接、作品保存、長い調査を支える道具だけを、向く場面と見送る判断まで整理します。</p></div></header>

    <section className="career-shop-pr" aria-label="広告表示"><strong>PR</strong><p>{careerShopPolicy.disclosure}</p><Link href="/affiliate/">広告・掲載基準を確認</Link></section>
    <div className="career-shop-principles"><span><Check aria-hidden="true" />仕事や採用に必須と断定しない</span><span><Check aria-hidden="true" />価格・在庫・レビュー点は転載しない</span><span><Check aria-hidden="true" />メーカー公式仕様も同時に確認</span><span><Check aria-hidden="true" />報酬で掲載順を変えない</span></div>

    <nav className="career-shop-category-nav" aria-label="商品カテゴリ">{careerShopProducts.map((product) => <a href={`#${product.id}`} key={product.id}>{product.category}</a>)}</nav>

    <section className="career-shop-grid" aria-label="掲載商品">
      {careerShopProducts.map((product) => <article className="career-shop-card" id={product.id} key={product.id}>
        <a className="career-shop-image" href={product.amazonUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" aria-label={`${product.name}をAmazonで確認（PR）`}><Image src={product.image} alt={product.imageAlt} width={900} height={560} sizes="(max-width: 760px) 100vw, (max-width: 1200px) 45vw, 430px" loading="eager"/><span>PR・Amazon</span><small>{product.imageCredit}</small></a>
        <div className="career-shop-card-body"><div className="career-shop-meta"><span>{product.category}</span><small>{product.maker}</small></div><h2>{product.name}</h2><div className="career-shop-fit"><strong>こんな人・場面に</strong><p>{product.fit}</p></div><p>{product.reason}</p><div className="career-shop-checks"><strong>購入前に確認</strong><ul>{product.checks.map((check) => <li key={check}><BadgeCheck aria-hidden="true" />{check}</li>)}</ul></div><div className="career-shop-actions"><a className="career-shop-buy" href={product.amazonUrl} target="_blank" rel="sponsored nofollow noopener noreferrer">Amazonで型番・条件を確認 <ExternalLink aria-hidden="true" /></a><a className="career-shop-official" href={product.officialUrl} target="_blank" rel="noopener noreferrer">メーカー公式仕様 <ArrowUpRight aria-hidden="true" /></a></div></div>
      </article>)}
    </section>

    <section className="career-shop-method"><h2>選定方法と限界</h2><p>{careerShopPolicy.independence}</p><p>カードの画像はmanapick編集部が作成した用途別の抽象イラストで、実際の商品写真ではありません。メーカーのロゴ・商品画像、Amazonの商品画像・価格・在庫・レビューは保存・転載していません。外観、販売条件、画像・仕様の更新はAmazonとメーカー公式ページで再確認してください。</p><p>職業ページやガイドの結論は、この商店やPRリンクを外しても変わりません。必要な道具は仕事、職場、体格、すでに持っている機器で変わります。</p><div><a href="https://affiliate.amazon.co.jp/help/node/topic/GKT6X2R3NGW5V23K" target="_blank" rel="noopener noreferrer">Amazon画像利用の公式注意事項 <ArrowUpRight aria-hidden="true" /></a><Link href="/affiliate/">本サイトの広告方針</Link><Link href="/contact/">訂正窓口</Link></div><small>掲載内容確認日：{careerShopPolicy.checkedAt}</small></section>
  </div></>;
}
