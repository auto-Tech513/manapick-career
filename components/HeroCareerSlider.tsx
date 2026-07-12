"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from "lucide-react";
import type { CareerJob } from "@/content/jobs";

export function HeroCareerSlider({ jobs }: { jobs: CareerJob[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const moveTo = useCallback((next: number) => {
    const target = (next + jobs.length) % jobs.length;
    const element = rail.current?.children[target] as HTMLElement | undefined;
    const first = rail.current?.children[0] as HTMLElement | undefined;
    if (element && first && rail.current) rail.current.scrollTo({ left: element.offsetLeft - first.offsetLeft, behavior: "smooth" });
    setIndex(target);
  }, [jobs.length]);

  useEffect(() => {
    if (paused || jobs.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => moveTo(index + 1), 5200);
    return () => window.clearInterval(timer);
  }, [index, jobs.length, moveTo, paused]);

  const onScroll = () => {
    const element = rail.current;
    if (!element) return;
    const cards = Array.from(element.children) as HTMLElement[];
    const base = cards[0]?.offsetLeft ?? 0;
    const nearest = cards.reduce((best, card, cardIndex) => Math.abs(card.offsetLeft - base - element.scrollLeft) < Math.abs(cards[best].offsetLeft - base - element.scrollLeft) ? cardIndex : best, 0);
    setIndex(nearest);
  };

  if (!jobs.length) return null;

  return <div className="hero-visual" aria-label="職業の入口ピックアップ" aria-roledescription="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
    <div className="hero-visual-head">
      <div className="hero-brand-image"><Image src="/brand/career-icon.png" width={1254} height={1254} priority sizes="64px" alt="manapick career アイコン" /></div>
      <div><span>CAREER STARTER</span><strong>仕事から学びを選ぶ</strong></div>
      <span className="hero-visual-count">{String(index + 1).padStart(2, "0")} / {String(jobs.length).padStart(2, "0")}</span>
    </div>
    <div ref={rail} className="hero-career-rail" onScroll={onScroll} aria-live="off">
      {jobs.map((job, jobIndex) => <article className={`hero-career-slide cat-bg-${job.category}`} key={job.slug} aria-label={`${jobIndex + 1} / ${jobs.length}: ${job.name}`}>
        <div className="hero-slide-orbit" aria-hidden="true"><Sparkles /></div>
        <span className="hero-slide-kicker">仕事の入口を見る</span>
        <h2>{job.name}</h2>
        <p>{job.conclusion[0]}</p>
        <div className="hero-slide-skills" aria-label="入口スキル">{job.entrySkills.slice(0, 2).map(skill => <span key={skill}>{skill}</span>)}</div>
        <Link href={`/career/${job.slug}/`}>仕事内容と学び方 <ArrowRight aria-hidden="true" /></Link>
      </article>)}
    </div>
    <div className="hero-slider-controls">
      <button type="button" onClick={() => moveTo(index - 1)} aria-label="前の職業"><ChevronLeft aria-hidden="true" /></button>
      <div className="hero-slider-dots" role="tablist" aria-label="表示する職業を選ぶ">{jobs.map((job, itemIndex) => <button key={job.slug} type="button" role="tab" aria-selected={itemIndex === index} aria-label={`${itemIndex + 1}枚目、${job.name}`} className={itemIndex === index ? "is-active" : ""} onClick={() => moveTo(itemIndex)} />)}</div>
      <button type="button" onClick={() => moveTo(index + 1)} aria-label="次の職業"><ChevronRight aria-hidden="true" /></button>
      <button type="button" className="hero-slider-pause" aria-label={paused ? "自動切り替えを再開" : "自動切り替えを一時停止"} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>
    </div>
  </div>;
}
