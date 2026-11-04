"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { axisStrength, typeCodeFromScores, workstyleAxes, workstyleQuestions, workstyleTypes, type WorkstyleAxisKey } from "@/content/workstyle-diagnosis";
import { trackEvent } from "@/lib/analytics";

export interface WorkstyleCard {
  catalogId: string;
  name: string;
  summary: string;
  traits: string[];
  reasons: string[];
}

export interface WorkstyleCardsByType {
  close: WorkstyleCard[];
  stretch: WorkstyleCard[];
}

const STORAGE_KEY = "manapick-career-workstyle";

type Scores = Record<WorkstyleAxisKey, number>;

const emptyScores = (): Scores => ({ contact: 0, info: 0, judge: 0, pace: 0 });

export function WorkstyleDiagnosis({ cardsByType }: { cardsByType: Record<string, WorkstyleCardsByType> }) {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [saved, setSaved] = useState<{ code: string; scores: Scores } | null>(null);

  useEffect(() => {
    // 保存済み結果の読み込みは初回描画の後に回す（静的出力との不整合を避ける）
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { code?: string; scores?: Scores };
          if (parsed.code && parsed.scores && workstyleTypes[parsed.code]) setSaved({ code: parsed.code, scores: parsed.scores });
        }
      } catch { /* 保存がなくても診断は使える */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const scores = useMemo<Scores>(() => {
    const result = emptyScores();
    answers.forEach((side, index) => {
      const question = workstyleQuestions[index];
      if (question) result[question.axis] += side;
    });
    return result;
  }, [answers]);

  const code = typeCodeFromScores(scores);
  const type = workstyleTypes[code];
  const cards = cardsByType[code] ?? { close: [], stretch: [] };

  function start() {
    setAnswers([]);
    setStep(0);
    setPhase("quiz");
    trackEvent("workstyle_start", {});
  }

  function choose(side: -1 | 1) {
    const next = [...answers.slice(0, step), side];
    setAnswers(next);
    if (step + 1 >= workstyleQuestions.length) {
      const finalScores = emptyScores();
      next.forEach((value, index) => {
        const question = workstyleQuestions[index];
        if (question) finalScores[question.axis] += value;
      });
      const finalCode = typeCodeFromScores(finalScores);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: finalCode, scores: finalScores, at: new Date().toISOString() })); } catch { /* 保存できなくても結果は表示する */ }
      setSaved({ code: finalCode, scores: finalScores });
      trackEvent("workstyle_complete", { result_type: finalCode });
      setPhase("result");
    } else {
      setStep(step + 1);
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function showSaved() {
    if (!saved) return;
    // 保存済みスコアから結果画面を復元する（回答そのものは保存していないため、軸ごとに合計が一致する回答を再構成）
    const seen: Partial<Record<WorkstyleAxisKey, number>> = {};
    setAnswers(workstyleQuestions.map((question) => {
      const score = saved.scores[question.axis];
      const side = score >= 0 ? 1 : -1;
      const matchingCount = (3 + Math.abs(score)) / 2;
      const indexInAxis = (seen[question.axis] ?? 0) + 1;
      seen[question.axis] = indexInAxis;
      return (indexInAxis <= matchingCount ? side : -side) as -1 | 1;
    }));
    setPhase("result");
  }

  if (phase === "intro") {
    return <div className="wsd-intro">
      <button type="button" className="wsd-start" onClick={start}>診断をはじめる（12問）<ArrowRight aria-hidden="true" /></button>
      {saved ? <div className="wsd-saved"><p>前回の結果：<strong>{workstyleTypes[saved.code].name}</strong></p><button type="button" className="wsd-subtle-button" onClick={showSaved}>前回の結果を見る</button></div> : null}
    </div>;
  }

  if (phase === "quiz") {
    const question = workstyleQuestions[step];
    return <div className="wsd-quiz">
      <div className="wsd-progress" aria-label={`質問 ${step + 1} / ${workstyleQuestions.length}`}>
        <span>{step + 1} / {workstyleQuestions.length}</span>
        <div className="wsd-progress-track"><div className="wsd-progress-fill" style={{ width: `${((step + 1) / workstyleQuestions.length) * 100}%` }} /></div>
      </div>
      <h2 className="wsd-question">{question.text}</h2>
      <div className="wsd-options">
        {question.options.map((option) => <button key={option.label} type="button" className="wsd-option" onClick={() => choose(option.side)}>{option.label}</button>)}
      </div>
      {step > 0 ? <button type="button" className="wsd-back" onClick={back}><ArrowLeft aria-hidden="true" />前の質問に戻る</button> : null}
    </div>;
  }

  return <div className="wsd-result">
    <div className="wsd-result-grid">
      <section className="wsd-type-panel" aria-labelledby="wsd-type-name">
        <span className="eyebrow">あなたの働き方タイプ</span>
        <h2 id="wsd-type-name">{type.name}</h2>
        <p>{type.summary}</p>
        <div className="wsd-axes">
          {workstyleAxes.map((axis) => {
            const score = scores[axis.key];
            return <div key={axis.key} className="wsd-axis">
              <div className="wsd-axis-labels"><span className={score < 0 ? "is-strong" : undefined}>{axis.minusLabel}</span><span className={score > 0 ? "is-strong" : undefined}>{axis.plusLabel}</span></div>
              <div className="wsd-axis-track"><div className="wsd-axis-marker" style={{ left: `${((score + 3) / 6) * 100}%` }} /></div>
              <p className="wsd-axis-note">{axisStrength(score) === "はっきり" ? "はっきり出ています" : "わずかに出ています。場面によって変わりやすい傾向です"}</p>
            </div>;
          })}
        </div>
        <h3>力が入りやすい働き方</h3>
        <ul>{type.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>続くと負担になりやすい作業</h3>
        <ul>{type.burdens.map((item) => <li key={item}>{item}</li>)}</ul>
        <button type="button" className="wsd-subtle-button" onClick={start}><RotateCcw aria-hidden="true" />もう一度診断する</button>
      </section>
      <section className="wsd-jobs" aria-labelledby="wsd-jobs-title">
        <h2 id="wsd-jobs-title">働き方が近い入口</h2>
        <div className="wsd-cards">
          {cards.close.map((card) => <WorkstyleJobCard key={card.catalogId} card={card} />)}
        </div>
        {cards.stretch.length ? <>
          <h2 className="wsd-stretch-title">少し違う働き方の入口</h2>
          <p className="wsd-stretch-note">主な傾向は近いものの、対象や進め方が少し異なる職業です。選択肢を広げるために表示しています。</p>
          <div className="wsd-cards">
            {cards.stretch.map((card) => <WorkstyleJobCard key={card.catalogId} card={card} />)}
          </div>
        </> : null}
        <div className="wsd-next-actions">
          <Link href="/compare/">気になった職業を比べる<ArrowRight aria-hidden="true" /></Link>
          <Link href="/route/">関心から探す入口案内も試す<ArrowRight aria-hidden="true" /></Link>
          <Link href="/all/">556職業の名録で探す<ArrowRight aria-hidden="true" /></Link>
        </div>
        <details className="wsd-about">
          <summary>この診断について（方法と限界）</summary>
          <p>12の質問への回答をもとに、4つの働き方の傾向を表示しています。結果は、働き方の好みから職業を探すための目安で、適性や向き不向きを判定するものではありません。ここに出る職業は、その働き方が比較的多い入口です。実際の仕事内容は職場によって変わるため、各職業の仕事内容と条件を個別ページで確認してください。</p>
          <p>職業との対応づけは、各職業の仕事内容をもとに作業特性（人との関わり／情報の扱い／判断基準／進め方）を整理し、傾向の重なりで選んでいます。質問の作り方と対応づけの方法は<Link href="/about-method/">作成方法・編集方針</Link>にまとめています。結果はこの端末の中にだけ保存され、いつでも「もう一度診断する」から消してやり直せます。</p>
        </details>
      </section>
    </div>
  </div>;
}

function WorkstyleJobCard({ card }: { card: WorkstyleCard }) {
  return <article className="wsd-card">
    <h3>{card.name}</h3>
    <p className="wsd-card-summary">{card.summary}</p>
    {card.traits.length ? <ul className="wsd-chips">{card.traits.map((trait) => <li key={trait}>{trait}</li>)}</ul> : null}
    {card.reasons.length ? <div className="wsd-reasons"><h4>この職業が入口になる理由</h4><ul>{card.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div> : null}
    <Link className="wsd-card-link" href={`/occupation/${card.catalogId}/`} onClick={() => trackEvent("workstyle_action", { action: "occupation_click", occupation_id: card.catalogId })}>仕事内容を見る<ArrowRight aria-hidden="true" /></Link>
  </article>;
}
