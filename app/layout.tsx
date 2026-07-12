import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/Analytics";
import { AdSenseScript } from "@/components/AdSenseScript";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl, SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";
import "./globals.css";

const description="仕事内容、必要スキル、学ぶ順番、資格、AI活用を公式情報から整理。職業を順位付けせず、次に調べる入口を見つけるサイトです。";

export const metadata: Metadata={
  metadataBase:new URL(SITE_URL), title:{default:`${SITE_NAME} | ${TAGLINE}`,template:`%s | ${SITE_NAME}`},description,
  alternates:{canonical:"/",types:{"application/rss+xml":"/feed.xml"}},
  robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}},
  openGraph:{title:SITE_NAME,description,url:SITE_URL,siteName:SITE_NAME,locale:"ja_JP",type:"website",images:[{url:absoluteUrl("/og.png"),width:1200,height:630,alt:`${SITE_NAME} - ${TAGLINE}`}]},
  twitter:{card:"summary_large_image",title:SITE_NAME,description,images:[absoluteUrl("/og.png")]},
  icons:{
    icon:[
      {url:"/brand/career-icon-32.png",type:"image/png",sizes:"32x32"},
      {url:"/brand/career-icon-192.png",type:"image/png",sizes:"192x192"},
    ],
    shortcut:{url:"/favicon.ico",type:"image/x-icon"},
    apple:{url:"/brand/career-icon-180.png",type:"image/png",sizes:"180x180"},
  },
  verification:process.env.NEXT_PUBLIC_GSC_VERIFICATION?{google:process.env.NEXT_PUBLIC_GSC_VERIFICATION}:undefined,
  other:{"google-adsense-account":"ca-pub-4108900975353940"},
};
export const viewport:Viewport={themeColor:"#ffd700",width:"device-width",initialScale:1,viewportFit:"cover"};

const graph={"@context":"https://schema.org","@graph":[
  {"@type":"Organization","@id":absoluteUrl("/#organization"),name:"manapick",url:"https://manapick.app/",sameAs:["https://x.com/manapick_app"]},
  {"@type":"WebSite","@id":absoluteUrl("/#website"),name:SITE_NAME,url:SITE_URL,inLanguage:"ja-JP",publisher:{"@id":absoluteUrl("/#organization")},isPartOf:{"@type":"WebSite",name:"manapick",url:"https://manapick.app/"}},
  {"@type":"ItemList","@id":absoluteUrl("/#network-navigation"),name:"manapick公式サイト",itemListElement:[
    {"@type":"SiteNavigationElement",position:1,name:"学ぶ",url:"https://manapick.app/"},
    {"@type":"SiteNavigationElement",position:2,name:"AIを選ぶ",url:"https://ai.manapick.app/"},
    {"@type":"SiteNavigationElement",position:3,name:"資格で証明",url:"https://license.manapick.app/"},
    {"@type":"SiteNavigationElement",position:4,name:"仕事につなぐ",url:SITE_URL}
  ]}
]};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body>
  <JsonLd data={graph}/><Analytics/><AdSenseScript/><a className="skip-link" href="#main">本文へ移動</a><SiteHeader/><main id="main">{children}</main><SiteFooter/><BottomNav/>
</body></html>}
