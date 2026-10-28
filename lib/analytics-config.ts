export const measurementId = process.env.NEXT_PUBLIC_GA_ID?.trim() || "G-WW5XWW0YFE";

export function analyticsBootstrap(id: string) {
  const serializedId = JSON.stringify(id).replace(/</g, "\\u003c");
  return `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',${serializedId},{anonymize_ip:true});`;
}
