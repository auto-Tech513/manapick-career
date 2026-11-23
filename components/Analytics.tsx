"use client";
import Script from "next/script";
import { useSyncExternalStore } from "react";
import { measurementId } from "@/lib/analytics-config";

const subscribe = () => () => {};

export function Analytics() {
  // 自動操作のブラウザ（Playwright・Selenium 等。navigator.webdriver === true）では gtag.js を読み込まない（2026-11-21）。
  // サーバーとハイドレーション時は false（何も出さない）で、その後に navigator を見て描画する（React #418 を起こさない）
  const enabled = useSyncExternalStore(subscribe, () => navigator.webdriver !== true, () => false);
  if (!enabled) return null;
  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`} strategy="lazyOnload" />;
}
