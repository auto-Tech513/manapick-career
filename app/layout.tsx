import { analyticsBootstrap, measurementId } from "@/lib/analytics-config";
import NetworkAnalytics from "../components/NetworkAnalytics";
import NetworkFooter from "../components/NetworkFooter";
import { NetworkRail } from "../components/NetworkRail";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/Analytics";
import { AdSenseScript } from "@/components/AdSenseScript";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl, siteOpenGraph, SITE_DESCRIPTION, SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";
import "./globals.css";
import "./network.css";

const description = SITE_DESCRIPTION;

export const metadata: Metadata={
  metadataBase:new URL(SITE_URL), title:{default:`${SITE_NAME} | ${TAGLINE}`,template:`%s | ${SITE_NAME}`},description,
  alternates:{canonical:"/",types:{"application/rss+xml":"/feed.xml"}},
  robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}},
  openGraph:siteOpenGraph(),
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
  {"@type":"Organization","@id":absoluteUrl("/#organization"),name:"manapick",url:"https://manapick.app/",logo:{"@type":"ImageObject",url:absoluteUrl("/brand/career-icon-512.png"),width:512,height:512},sameAs:["https://manapick.app/","https://ai.manapick.app/","https://license.manapick.app/","https://career.manapick.app/","https://company.manapick.app/","https://x.com/manapick_app"]},
  {"@type":"WebSite","@id":absoluteUrl("/#website"),name:SITE_NAME,url:SITE_URL,inLanguage:"ja-JP",publisher:{"@id":absoluteUrl("/#organization")},isPartOf:{"@type":"WebSite",name:"manapick",url:"https://manapick.app/"}},
  {"@type":"ItemList","@id":absoluteUrl("/#network-navigation"),name:"manapick公式サイト",itemListElement:[
    {"@type":"SiteNavigationElement",position:1,name:"学ぶ",url:"https://manapick.app/"},
    {"@type":"SiteNavigationElement",position:2,name:"AIを選ぶ",url:"https://ai.manapick.app/"},
    {"@type":"SiteNavigationElement",position:3,name:"資格で証明",url:"https://license.manapick.app/"},
    {"@type":"SiteNavigationElement",position:4,name:"仕事につなぐ",url:SITE_URL},
    {"@type":"SiteNavigationElement",position:5,name:"企業を読む",url:"https://company.manapick.app/"},
    {"@type":"SiteNavigationElement",position:6,name:"政治と法律",url:"https://politics.manapick.app/"}
  ]}
]};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><head><script id="ga4-queue" dangerouslySetInnerHTML={{__html:analyticsBootstrap(measurementId)}} /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,600;1,500&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Zen+Old+Mincho:wght@500;700;900&display=swap" rel="stylesheet" /></head><body>
  <JsonLd data={graph}/><Analytics/>{/* AdSense 自動広告は全ページで読み込む（オーナー決定 2026-11-18 22:32。他の manapick と同じ）。手動の広告枠はここでは置かない */}<AdSenseScript/><a className="skip-link" href="#main">本文へ移動</a><NetworkRail/><SiteHeader/><main id="main">{children}</main><BottomNav/>
<NetworkAnalytics /><NetworkFooter /></body></html>}
