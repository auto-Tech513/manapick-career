export const measurementId = process.env.NEXT_PUBLIC_GA_ID?.trim() || "G-WW5XWW0YFE";

// 自動操作のブラウザ（Playwright・Selenium 等。navigator.webdriver === true）では js・config を積まない
// （自動確認が GA4 に記録されないように。2026-11-21）。gtag.js の読み込みも components/Analytics.tsx で止める。
// window.gtag は従来どおり定義する（イベントは dataLayer に積まれるだけで送信されない）。
export function analyticsBootstrap(id: string) {
  const serializedId = JSON.stringify(id).replace(/</g, "\\u003c");
  return `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};(function(){if(typeof navigator!=='undefined'&&navigator.webdriver===true)return;window.gtag('js',new Date());window.gtag('config',${serializedId},{anonymize_ip:true});})();`;
}
