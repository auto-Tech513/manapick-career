"use client";

import { useEffect } from "react";

const DEFAULT_CLIENT = "ca-pub-4108900975353940";

export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || DEFAULT_CLIENT;

  useEffect(() => {
    if (document.getElementById("manapick-career-adsense")) return;
    const script = document.createElement("script");
    script.id = "manapick-career-adsense";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    document.head.append(script);
  }, [client]);

  return null;
}
