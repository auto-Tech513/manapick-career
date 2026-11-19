"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_CLIENT = "ca-pub-4108900975353940";
const DEFAULT_SLOT = "8041327454";

type AdsWindow = Window & { adsbygoogle?: unknown[] };
type AdState = "pending" | "filled" | "optimized" | "unfilled";

/**
 * 手動の広告枠。
 * - 既存の枠（fold なし）：従来どおり。未配信のときは自社案内（商店へ）を出す。
 * - 追加の枠（fold あり。オーナー判断 2026-11-19 14:38：外した広告の分を手動枠で補う）：
 *   本家の汎用レスポンシブユニット（slot="1438236565"）などを指定して使う。配信されるまでは高さを取らず（CLS を出さない）、
 *   filled になってから「広告」の札と余白を付ける。未配信のときは枠ごと畳み、空白も自社案内も残さない。
 */
export function AdSlot({ label = "広告", placement = "editorial-after-section-2", unit = "article", slot: fixedSlot, fold = false }: { label?: string; placement?: string; unit?: "article" | "career"; slot?: string; fold?: boolean }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || DEFAULT_CLIENT;
  const slot = fixedSlot || (unit === "career" ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_CAREER?.trim() : undefined) || process.env.NEXT_PUBLIC_ADSENSE_SLOT?.trim() || DEFAULT_SLOT;
  const slotRef = useRef<HTMLModElement>(null);
  const [state, setState] = useState<AdState>("pending");

  useEffect(() => {
    const element = slotRef.current;
    if (!element) return;
    let disposed = false;
    let timeout: number | undefined;

    const inspect = () => {
      if (disposed) return;
      const status = element.getAttribute("data-ad-status");
      if (status === "filled") setState("filled");
      if (status === "unfill-optimized") setState("optimized");
      if (status === "unfilled") setState("unfilled");
    };

    const observer = new MutationObserver(inspect);
    observer.observe(element, { attributes: true, attributeFilter: ["data-ad-status"], childList: true, subtree: true });

    try {
      const adsWindow = window as AdsWindow;
      if (!element.getAttribute("data-adsbygoogle-status")) (adsWindow.adsbygoogle = adsWindow.adsbygoogle || []).push({});
      timeout = window.setTimeout(() => {
        if (!disposed && !element.getAttribute("data-ad-status")) setState("unfilled");
      }, 12000);
    } catch {
      timeout = window.setTimeout(() => {
        if (!disposed) setState("unfilled");
      }, 0);
    }

    return () => {
      disposed = true;
      observer.disconnect();
      if (timeout) window.clearTimeout(timeout);
    };
  }, [placement, slot]);

  return <aside className={`ad-shell is-${state}${fold ? " ad-shell--fold" : ""}`} aria-label={label} data-ad-placement={placement} data-ad-state={state}>
    {(!fold || state === "filled") && <small className="ad-label">{label}</small>}
    <ins ref={slotRef} className="adsbygoogle ad-slot" style={{ display: "block" }} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    {/* 独立監査2 2026-11-19 M4：未配信時の制作向けの説明文（「広告が未配信のため…表示しています」）は表示しない（オーナー指示）。
        空の枠の高さは globals.css で畳み、自社案内だけを出す */}
    {!fold && (state === "unfilled" || state === "optimized") && <Link className="ad-fallback" href="/shop/"><ShoppingBag aria-hidden="true" /><span><strong>学習・仕事の道具を用途から確認</strong></span><b>商店へ</b></Link>}
  </aside>;
}
