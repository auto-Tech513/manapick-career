"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_CLIENT = "ca-pub-4108900975353940";
const DEFAULT_SLOT = "8041327454";

type AdsWindow = Window & { adsbygoogle?: unknown[] };
type AdState = "pending" | "filled" | "optimized" | "unfilled";

export function AdSlot({ label = "広告", placement = "editorial-after-section-2" }: { label?: string; placement?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || DEFAULT_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT?.trim() || DEFAULT_SLOT;
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

  return <aside className={`ad-shell is-${state}`} aria-label={label} data-ad-placement={placement} data-ad-state={state}>
    <small className="ad-label">{label}</small>
    <ins ref={slotRef} className="adsbygoogle ad-slot" style={{ display: "block" }} data-ad-client={client} data-ad-slot={slot} data-ad-format="horizontal" data-full-width-responsive="true" />
    {state === "unfilled" && <Link className="ad-fallback" href="/shop/"><ShoppingBag aria-hidden="true" /><span><strong>学習・仕事の道具を用途から確認</strong><small>広告が未配信のため、manapi商店の自社案内を表示しています</small></span><b>商店へ</b></Link>}
  </aside>;
}
