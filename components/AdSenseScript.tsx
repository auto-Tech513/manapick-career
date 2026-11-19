"use client";

import { useEffect } from "react";

const DEFAULT_CLIENT = "ca-pub-4108900975353940";

type AnchorWindow = Window & { __mpAdAnchorWatch?: boolean };

/**
 * AdSense 自動広告のアンカー広告（ins.adsbygoogle[data-anchor-status="displayed"]、position:fixed）の
 * 上端・下端の高さを CSS 変数 --ad-anchor-top / --ad-anchor-bottom に入れる。
 * network.css がこの値でヘッダー・メニュー・下部ナビ・乗り換えシートをずらし、広告に覆われて操作できなくなるのを防ぐ。
 * 広告の位置・大きさ・表示には手を加えない（オーナー決定 2026-11-18 21:44）。
 * アンカー広告はページ移動後も残るため、監視は一度だけ始めて止めない。
 */
function watchAdAnchors() {
  const w = window as AnchorWindow;
  if (w.__mpAdAnchorWatch) return;
  w.__mpAdAnchorWatch = true;
  const root = document.documentElement;
  const watched = new WeakSet<Element>();
  let frame = 0;
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  const resize = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
  const attrs = new MutationObserver(schedule);

  function update() {
    frame = 0;
    let top = 0;
    let bottom = 0;
    const viewport = window.innerHeight;
    for (const element of document.querySelectorAll<HTMLElement>("ins.adsbygoogle[data-anchor-status]")) {
      if (!watched.has(element)) {
        watched.add(element);
        resize?.observe(element);
        attrs.observe(element, { attributes: true, attributeFilter: ["data-anchor-status", "style"] });
        element.addEventListener("transitionend", schedule);
      }
      if (element.getAttribute("data-anchor-status") !== "displayed") continue;
      const style = getComputedStyle(element);
      if (style.position !== "fixed" || style.display === "none" || style.visibility === "hidden") continue;
      const rect = element.getBoundingClientRect();
      if (rect.height <= 0 || rect.bottom <= 0 || rect.top >= viewport) continue;
      if (rect.top <= 1) top = Math.max(top, Math.round(rect.bottom));
      else if (rect.bottom >= viewport - 1) bottom = Math.max(bottom, Math.round(viewport - rect.top));
    }
    // 下端のアンカー広告のうち、AdSense が body に付ける下余白（padding-bottom）では足りずにページの末尾を覆う分。
    // network.css がこの分だけフッター最下段の下に足す（PC：広告 275px に対し body の余白 154px 等。本家 PR #31・company PR #21 と同じ求め方）。
    // 広告が無ければ 0
    const bodyPad = bottom ? parseFloat(getComputedStyle(document.body).paddingBottom) || 0 : 0;
    const cover = Math.max(0, Math.round(bottom - bodyPad));
    root.style.setProperty("--ad-anchor-top", `${top}px`);
    root.style.setProperty("--ad-anchor-bottom", `${bottom}px`);
    root.style.setProperty("--ad-anchor-bottom-cover", `${cover}px`);
    // AdSense が body に付けた下余白そのもの（下端のアンカー広告があるときだけ。無ければ 0）。
    // network.css がこの分だけフッターの暗い地を下へ伸ばし、余白の地の色（明るい帯）が見えないようにする（politics PR #23 と同じ考え方）
    root.style.setProperty("--ad-anchor-bottom-pad", `${Math.round(bodyPad)}px`);
  }

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  // AdSense は body の下余白を inline の style で付け外しするので、その変化でも測り直す
  new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ["style"] });
  window.addEventListener("resize", schedule);
  schedule();
}

export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || DEFAULT_CLIENT;

  useEffect(() => {
    // アンカー広告の監視は広告を読み込まない環境でも無害（広告が無ければ 0px のまま）
    watchAdAnchors();
    // 本番（manapick.app とそのサブドメイン）以外では広告を読み込まない（プレビュー・ローカル閲覧の計上防止）
    if (!/(^|\.)manapick\.app$/.test(window.location.hostname)) return;
    if (document.getElementById("manapick-career-adsense")) return;
    const script = document.createElement("script");
    script.id = "manapick-career-adsense";
    script.async = true;
    script.crossOrigin = "anonymous";
    // アンカー広告は画面の下端だけに出す（AdSense 公式ヘルプ answer/7478225 の data-overlays="bottom"。オーナー判断 2026-11-19 14:38）。
    // SP で上端のアンカー（427px）がヘッダーと画面の約半分を覆っていたため。アンカー広告そのものは残す
    script.setAttribute("data-overlays", "bottom");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    document.head.append(script);
  }, [client]);

  return null;
}
