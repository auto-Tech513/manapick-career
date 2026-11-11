"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import "./back-to-top.css";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  return <button type="button" className="back-to-top" aria-label="ページトップへ戻る" onClick={toTop}>
    <ArrowUp aria-hidden="true" />
  </button>;
}
