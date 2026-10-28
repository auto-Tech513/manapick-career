"use client";
import Script from "next/script";
import { measurementId } from "@/lib/analytics-config";

export function Analytics() {
  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`} strategy="lazyOnload" />;
}
