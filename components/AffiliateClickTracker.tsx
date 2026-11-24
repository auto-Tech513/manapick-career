"use client";
import { useEffect } from "react";
/**
 * アフィリエイト（PR）リンクのクリックを affiliate_click として GA4 に送る（2026-11-24、決定キュー #74・■3 I-20）。
 * - 名前と引数は ai・license の affiliate_click と同じ：network（amazon／a8）・program（商品名・提供元）・placement（置き場所）。
 * - 対象は data-affiliate-network の付いたリンクだけ（/shop/ の Amazon リンク、記事の PR オファー）。
 * - 送信は gtag があるときだけ（GA4 の読み込み条件＝webdriver 判定は components/Analytics.tsx のまま）。
 * - 画面には何も描かない（document のクリックを捕まえるだけ）。
 */
export default function AffiliateClickTracker() {
  useEffect(() => {
    const click = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[data-affiliate-network]") : null;
      if (!anchor) return;
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.("event", "affiliate_click", {
        network: anchor.dataset.affiliateNetwork ?? "",
        program: anchor.dataset.affiliateProgram ?? "",
        placement: anchor.dataset.affiliatePlacement ?? ""
      });
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);
  return null;
}
