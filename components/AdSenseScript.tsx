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
  // 本文（main）の画面上の位置とスクロール位置の記録。スクロールのたび（ブラウザ・AdSense による補正のスクロールも含む）と測り直しのたびに更新する
  let lastPadTop: number | null = null;
  let mark: { top: number; y: number } | null = null;
  const record = () => {
    const main = document.querySelector("main");
    mark = main ? { top: main.getBoundingClientRect().top, y: window.scrollY } : null;
  };
  window.addEventListener("scroll", record, { passive: true });

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
      // 上か下かは、画面の上端・下端のどちらに接しているかで決める（高さが画面の半分を超えるアンカーもあるため、位置の上下だけでは決めない）。
      // 両方に接している（画面いっぱいの）ときは、AdSense が付ける固定位置（bottom: 0）で決める
      const touchesTop = rect.top <= 1;
      const touchesBottom = rect.bottom >= viewport - 1;
      const isBottom = touchesBottom && (!touchesTop || style.bottom === "0px");
      if (isBottom) bottom = Math.max(bottom, Math.round(viewport - Math.max(0, rect.top)));
      else if (touchesTop) top = Math.max(top, Math.round(Math.min(viewport, rect.bottom)));
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

    // 読んでいる途中で本文がずれないようにする（2026-11-19）。data-overlays="bottom" でも SP の上端アンカーは出ており、
    // スクロール後は余白なしで重なって出るが、上へ戻ったときなどに AdSense が body に上余白（390px 幅で 452px）を付け、
    // iPhone の Safari 相当では本文が一度に 452px 下へずれていた（本物の広告で測定）。
    // 上余白が変わったとき、最後の記録から本文が画面の中で実際に動いた分（スクロールによる分を除く）だけスクロール位置を足し引きして戻す。
    // ブラウザの自動補正（scroll anchoring）や AdSense 自身がスクロールで補正した場合は、そのスクロールで記録が更新されるので動いた分は 0 になり、二重には補正しない。
    // ページの先頭（スクロール 0）にいるときは補正しない（広告の下にヘッダーから並ぶ AdSense の本来の出方）。広告そのものには触らない
    const padTop = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
    const main = document.querySelector("main");
    if (main && mark && lastPadTop !== null && padTop !== lastPadTop && mark.y > 0) {
      const moved = Math.round(main.getBoundingClientRect().top - mark.top + (window.scrollY - mark.y));
      if (moved) window.scrollBy({ top: moved, behavior: "instant" as ScrollBehavior });
    }
    lastPadTop = padTop;
    record();
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
    // 自動操作のブラウザ（navigator.webdriver === true。Playwright・Selenium 等）では読み込まない（無効トラフィック対策。2026-11-21）
    if (navigator.webdriver === true) return;
    if (document.getElementById("manapick-career-adsense")) return;
    // 404 など中身の無い画面（components/AdFreeScreen.tsx の目印 data-ad-free-screen がある文書）では読み込まない（2026-11-26、AdSense のポリシー上の懸念）
    if (document.querySelector("[data-ad-free-screen]")) return;
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
