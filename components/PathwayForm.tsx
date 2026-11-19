"use client";
import { Compass } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import "./newsletter-form.css";
import { PhraseText } from "./PhraseTitle";

/**
 * 資格×職業×企業パスウェイの事前登録フォーム（表示に「（開発中）」「開始時期は未定」は出さない：オーナー決定 2026-11-18）。
 * 専用の Kit フォーム（ID 10153174、ダブルオプトイン有効）へ直接 POST する。
 * 項目名は Kit の埋め込みコードで確認したもの。資格名はカスタム項目
 * pathway_qualification として送信される（任意）。
 * 需要計測の主指標はダブルオプトイン確認完了数で、送信件数とは分けて読む。
 * GA4 では signup_submit（method=pathway_route）を送信時に発火する。
 */
export function PathwayForm() {
  return (
    <div className="newsletter-form newsletter-form--article">
      <p className="newsletter-form-title phrase-breaks">
        <Compass aria-hidden="true" />
        <span><PhraseText text="資格×職業×企業の入口 事前登録" /></span>
      </p>
      <p className="newsletter-form-text">
        {/* 入口の説明は /route/ の節のリードにある（独立監査2 2026-11-19 M6：説明の3回の繰り返しを1回に） */}
        公開が決まったら、登録いただいた方にメールでお知らせします。登録は無料で、費用はかかりません。
      </p>
      <form
        action="https://app.kit.com/forms/10153174/subscriptions"
        method="post"
        onSubmit={() => trackEvent("signup_submit", { method: "pathway_route" })}
      >
        <label className="newsletter-form-label" htmlFor="pathway-email">
          メールアドレス
        </label>
        <div className="newsletter-form-row">
          <input
            id="pathway-email"
            type="email"
            name="email_address"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <label className="newsletter-form-label" htmlFor="pathway-qualification">
          興味のある資格名（任意）
        </label>
        <div className="newsletter-form-row">
          <input
            id="pathway-qualification"
            type="text"
            name="fields[pathway_qualification]"
            placeholder="例：基本情報技術者、宅地建物取引士 など"
          />
          <button type="submit">事前登録する</button>
        </div>
      </form>
      <p className="newsletter-form-note">
        登録すると確認メールが届き、メール内のリンクを開くと登録が完了します。資格名は、どの資格への関心が高いかを把握し、開発の優先順位を決めるためだけに使います。メールアドレスと資格名は Kit<span className="nw">（Kit, Inc.）</span>のシステムで管理し、開始のご案内と需要の確認以外の目的には使いません。詳しくは
        <a href="/privacy/">プライバシーポリシー</a>
        をご覧ください。
      </p>
    </div>
  );
}
