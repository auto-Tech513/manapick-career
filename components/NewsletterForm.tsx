import { Mail } from "lucide-react";
import "./newsletter-form.css";

/**
 * manapick メルマガ（Kit）の登録フォーム。
 * 第三者スクリプトは読み込まず、サイト側の通常フォームから Kit の
 * 登録エンドポイントへ直接 POST する（company 側と同一方式）。
 * 送信先と項目名は Kit の実フォーム（フォームID 10147210）の
 * 埋め込みコードから確認したもの。
 */
export function NewsletterForm({ context }: { context: "footer" | "article" }) {
  return (
    <div className={`newsletter-form newsletter-form--${context}`}>
      <p className="newsletter-form-title">
        <Mail aria-hidden="true" />
        manapick メルマガ
      </p>
      <p className="newsletter-form-text">
        仕事と学びの新着を、週に一度まとめてお届けする予定です（現在、配信開始に向けて準備中です）。登録は無料です。登録すると確認メールが届くので、メール内のリンクを開くと登録が完了します。
      </p>
      <form action="https://app.kit.com/forms/10147210/subscriptions" method="post">
        <label className="newsletter-form-label" htmlFor={`newsletter-email-${context}`}>
          メールアドレス
        </label>
        <div className="newsletter-form-row">
          <input
            id={`newsletter-email-${context}`}
            type="email"
            name="email_address"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
          <button type="submit">登録する</button>
        </div>
      </form>
      <p className="newsletter-form-note">
        配信停止は、各メールのリンクからいつでもできます。メールアドレスの管理は Kit（Kit, Inc.）のシステムで行い、配信以外の目的には使いません。詳しくは
        <a href="/privacy/">プライバシーポリシー</a>
        をご覧ください。
      </p>
    </div>
  );
}
