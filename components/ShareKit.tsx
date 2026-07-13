"use client";

import { useMemo, useState } from "react";
import { BookmarkPlus, BriefcaseBusiness, Copy, Mail, MessageCircle, MessagesSquare, Send, Share2, Sparkles } from "lucide-react";

type ShareKind = "news" | "guide";

function compact(value: string, max = 78) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function trackedUrl(rawUrl: string, source: string, kind: ShareKind) {
  const url = new URL(rawUrl);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", source === "email" ? "email" : "social");
  url.searchParams.set("utm_campaign", `share_${kind}`);
  return url.toString();
}

export function ShareKit({ title, summary, url, kind }: { title: string; summary: string; url: string; kind: ShareKind }) {
  const [copied, setCopied] = useState(false);
  const copyText = useMemo(() => `${title}\n${compact(summary)}\n${trackedUrl(url, "copy", kind)}\n\n#manapickcareer`, [kind, summary, title, url]);
  const socialText = useMemo(() => `${title}\n${compact(summary, 68)}\n#manapickcareer`, [summary, title]);
  const xHref = `https://x.com/intent/tweet?${new URLSearchParams({ text: socialText, url: trackedUrl(url, "x", kind) }).toString()}`;
  const threadsHref = `https://www.threads.net/intent/post?${new URLSearchParams({ text: `${title}\n${compact(summary, 68)}\n${trackedUrl(url, "threads", kind)}` }).toString()}`;
  const blueskyHref = `https://bsky.app/intent/compose?${new URLSearchParams({ text: `${title}\n${compact(summary, 64)}\n${trackedUrl(url, "bluesky", kind)}` }).toString()}`;
  const lineHref = `https://social-plugins.line.me/lineit/share?${new URLSearchParams({ url: trackedUrl(url, "line", kind) }).toString()}`;
  const hatenaHref = `https://b.hatena.ne.jp/entry/panel/?${new URLSearchParams({ url: trackedUrl(url, "hatena", kind), title }).toString()}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url: trackedUrl(url, "linkedin", kind) }).toString()}`;
  const mailHref = `mailto:?${new URLSearchParams({ subject: title, body: `${title}\n\n${compact(summary)}\n\n${trackedUrl(url, "email", kind)}` }).toString()}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return copy();
    try { await navigator.share({ title, text: compact(summary), url: trackedUrl(url, "native", kind) }); } catch { /* user cancellation */ }
  };

  return <section className="career-share-kit" aria-label="この記事を共有">
    <div className="career-share-copy"><span>SHARE</span><strong>この記事を共有する</strong><p>内容を変えず、計測用URLだけを付けます。</p></div>
    <div className="career-share-actions">
      <a href={xHref} target="_blank" rel="noopener noreferrer" aria-label="Xで共有"><Send aria-hidden="true" /><span>X</span></a>
      <a href={threadsHref} target="_blank" rel="noopener noreferrer" aria-label="Threadsで共有"><MessageCircle aria-hidden="true" /><span>Threads</span></a>
      <a href={blueskyHref} target="_blank" rel="noopener noreferrer" aria-label="Blueskyで共有"><Sparkles aria-hidden="true" /><span>Bluesky</span></a>
      <a href={lineHref} target="_blank" rel="noopener noreferrer" aria-label="LINEで共有"><MessagesSquare aria-hidden="true" /><span>LINE</span></a>
      <a href={hatenaHref} target="_blank" rel="noopener noreferrer" aria-label="はてなブックマークへ保存"><BookmarkPlus aria-hidden="true" /><span>はてブ</span></a>
      <a href={linkedinHref} target="_blank" rel="noopener noreferrer" aria-label="LinkedInで共有"><BriefcaseBusiness aria-hidden="true" /><span>LinkedIn</span></a>
      <a href={mailHref} aria-label="メールで共有"><Mail aria-hidden="true" /><span>メール</span></a>
      <button type="button" onClick={copy}><Copy aria-hidden="true" /><span>{copied ? "コピー済み" : "コピー"}</span></button>
      <button className="career-share-native" type="button" onClick={nativeShare}><Share2 aria-hidden="true" /><span>スマホ共有</span></button>
    </div>
  </section>;
}
