import { amazonUrl } from "@/lib/network-shared";
import { PhraseChildren } from "@/components/PhraseChildren";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Check, ExternalLink, ShoppingBag, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { careerShopPolicy, careerShopProducts, careerShopScenes } from "@/content/shop-products";
import { TransferCards } from "@/components/TransferCards";
import { absoluteUrl, pageOgUrl } from "@/lib/site";
import { PhraseText } from "@/components/PhraseTitle";
import "./shop.css";

const title = "manapi商店｜学び直し・面接・仕事準備の道具";
const description = "オンライン面接、学び直し、ポートフォリオ、作業環境に使う実在商品を、向く人・選ぶ理由・購入前の確認点・メーカー公式情報とともに掲載します。場面ごとに商品を分けて掲載し、価格や仕様は販売ページで最新情報を確認できるよう案内しています。迷ったときは、向く人と選ぶ理由から場面に合うものを選べます。";
const url = absoluteUrl("/shop/");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/shop/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { title, description, url, type: "website", images: [{ url: pageOgUrl("shop", title), width: 1200, height: 675, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: [pageOgUrl("shop", title)] },
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
    <nav className="crumb" aria-label="パンくずリスト"><Link href="/">トップ</Link><span aria-hidden="true">／</span><span aria-current="page">manapi商店</span></nav>
    <header className="phead"><p className="phead-eyebrow"><span className="ce-shopmark"><ShoppingBag aria-hidden="true" /></span> CA-SHOP · PR / CAREER WORK TOOLS</p><h1 className="phrase-breaks"><PhraseText text="manapi商店" /></h1><p className="phead-lead phrase-breaks"><PhraseChildren>学び直しと仕事準備の道具を、場面ごとに編集部が選ぶ小さな商店です。掲載は全{careerShopProducts.length}点。すべてメーカー公式仕様とAmazonの商品ページで実在を確認し、「買わなくてよい条件」まで正直に書きます。</PhraseChildren></p><div className="phead-meta"><span><BadgeCheck aria-hidden="true" />全品メーカー公式で確認</span><span><BadgeCheck aria-hidden="true" />{careerShopPolicy.checkedAt} 時点の掲載内容</span><span><BadgeCheck aria-hidden="true" />報酬で掲載順を変えない</span></div></header>

    <section className="ce-prbar" aria-label="広告表示"><b>PR</b><p>{careerShopPolicy.disclosure}</p><Link href="/affiliate/">広告・掲載基準を確認</Link></section>

    <div className="ce-shopbar">
      <span className="cnt"><b className="num">{careerShopProducts.length}</b>点の商品</span>
      <nav className="filt2" aria-label="使う場面">{careerShopScenes.map((scene) => <a href={`#scene-${scene.key}`} key={scene.key}>{scene.title}</a>)}</nav>
    </div>

    {careerShopScenes.map((scene) => {
      const items = careerShopProducts.filter((product) => product.scene === scene.key);
      if (!items.length) return null;
      return <section className="career-shop-scene" id={`scene-${scene.key}`} key={scene.key} aria-label={scene.title}>
        <div className="career-shop-scene-head"><h2 className="phrase-breaks"><PhraseText text={scene.title} /></h2><p>{scene.lead}</p></div>
        <div className="ce-pgrid">
          {items.map((product) => <article className="ce-prod" id={product.id} key={product.id}>
            <a className="im" href={amazonUrl(product.amazonUrl)} target="_blank" rel="sponsored nofollow noopener noreferrer" data-affiliate-network="amazon" data-affiliate-program={product.name} data-affiliate-placement="shop-card-image" aria-label={`${product.name}をAmazonで確認（PR）`}><Image src={product.image} alt={product.imageAlt} width={900} height={560} sizes="(max-width: 760px) 50vw, (max-width: 1200px) 25vw, 300px" loading="lazy"/><span className="pr">PR・Amazon</span><small className="credit">{product.imageCredit}</small></a>
            <div className="bd">
              <div className="cat">{product.category} ・ {product.maker}</div>
              <h3 className="phrase-breaks"><PhraseText text={product.name} /></h3>
              <p className="hook">{product.hook}</p>
              <details className="ce-more">
                <summary>選ぶ理由・購入前の確認</summary>
                <ul className="points">{product.points.map((point) => <li key={point}><Sparkles aria-hidden="true" />{point}</li>)}</ul>
                <div className="fit"><strong>こんな人・場面に</strong><p>{product.fit}</p></div>
                <p className="reason">{product.reason}</p>
                <div className="checks"><strong>購入前に確認</strong><ul>{product.checks.map((check) => <li key={check}><BadgeCheck aria-hidden="true" />{check}</li>)}</ul></div>
                {product.officialUrl ? <a className="official" href={product.officialUrl} target="_blank" rel="noopener noreferrer">メーカー公式仕様 <ArrowUpRight aria-hidden="true" /></a> : null}
              </details>
              <div className="pz"><b className="num">—</b><small>価格・在庫はAmazonで確認（掲載内容確認日 {careerShopPolicy.checkedAt}）</small></div>
              <a className="buy" href={amazonUrl(product.amazonUrl)} target="_blank" rel="sponsored nofollow noopener noreferrer" data-affiliate-network="amazon" data-affiliate-program={product.name} data-affiliate-placement="shop-card-button" aria-label={`${product.name}の価格・在庫をAmazonで見る（PR）`}><span className="buy-long">Amazonで価格・在庫を見る</span><span className="buy-short">Amazonで見る</span><ExternalLink aria-hidden="true" /></a>
              {product.officialUrl ? <a className="official official-sp" href={product.officialUrl} target="_blank" rel="noopener noreferrer">メーカー公式仕様 <ArrowUpRight aria-hidden="true" /></a> : null}
            </div>
          </article>)}
        </div>
      </section>;
    })}

    <section className="career-shop-method"><h2 className="phrase-breaks"><PhraseText text="選定方法と限界" /></h2><p>{careerShopPolicy.independence}</p><p>カードの画像は実際の商品写真で、Amazonの画像配信サーバーから直接表示しています。外観や販売条件、仕様の最新情報はAmazonとメーカー公式ページに載っています。必要な道具は仕事、職場、体格、すでに持っている機器で変わります。</p><div className="career-shop-principles"><span><Check aria-hidden="true" />必要な人だけに勧める</span><span><Check aria-hidden="true" />価格・在庫はAmazonで表示</span><span><Check aria-hidden="true" />メーカー公式仕様も同時に確認</span><span><Check aria-hidden="true" />掲載順は編集部が決定</span></div><div><a href="https://affiliate.amazon.co.jp/help/node/topic/GKT6X2R3NGW5V23K" target="_blank" rel="noopener noreferrer">Amazon画像利用の公式注意事項 <ArrowUpRight aria-hidden="true" /></a><Link href="/affiliate/">本サイトの広告方針</Link><Link href="/contact/">訂正窓口</Link></div><small>掲載内容確認日：{careerShopPolicy.checkedAt}</small></section>
    <section className="transfer-sec" aria-label="ほかの駅へ">
      <div className="sh"><div><p className="sh-k">TRANSFER — 乗り換え</p><h2 className="phrase-breaks"><PhraseText text="ほかの駅へ進む" /></h2></div></div>
      <TransferCards cards={[
        { siteId: "license", title: "ITパスポート", description: "仕事につながる資格", href: "https://license.manapick.app/license/it-passport/" },
        { siteId: "manapick", title: "資格の学び方ガイド", description: "無料動画で学ぶ", href: "https://manapick.app/guide/certification/" },
        { siteId: "ai", title: "ChatGPT", description: "仕事で使うAI", href: "https://ai.manapick.app/tool/chatgpt/" },
        { siteId: "company", title: "上場企業ランキング", description: "業界の企業を読む", href: "https://company.manapick.app/ranking/" },
      ]} />
    </section>
  </div></>;
}
