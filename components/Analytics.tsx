"use client";
import Script from "next/script";

export function Analytics(){
  const id=process.env.NEXT_PUBLIC_GA_ID?.trim();
  if(!id) return null;
  return <><Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} strategy="afterInteractive"/><Script id="ga4" strategy="afterInteractive" dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',${JSON.stringify(id)},{anonymize_ip:true});`}}/></>;
}
