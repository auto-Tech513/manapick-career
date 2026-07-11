"use client";
import Script from "next/script";
export function AdSenseScript(){const client=process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();const enabled=process.env.NEXT_PUBLIC_MANUAL_ADS==="true";if(!client||!enabled)return null;return <Script id="adsense-manual" async strategy="afterInteractive" crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}/>}
