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
      {context === "footer" ? <p className="newsletter-form-kick">NEWSLETTER</p> : null}
      <p className="newsletter-form-title">
        <Mail aria-hidden="true" />
        manapick メルマガ
      </p>
      {/* フッターでは説明を2行以内に収める（FOOTER_SPEC）。意味は記事内の文と同じ */}
      <p className="newsletter-form-text">
        {context === "footer"
          ? "仕事と学びの新着を週に一度まとめてお届けする予定です（配信準備中）。登録は無料で、確認メールのリンクを開くと完了します。"
          : "仕事と学びの新着を、週に一度まとめてお届けする予定です（現在、配信開始に向けて準備中です）。登録は無料です。登録すると確認メールが届くので、メール内のリンクを開くと登録が完了します。"}
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
      {context === "footer" ? (
        <p className="newsletter-form-note">
          配信停止はメールのリンクからいつでもできます。アドレスは Kit（Kit, Inc.）で管理し、配信以外には使いません（<a href="/privacy/">プライバシーポリシー</a>）。
        </p>
      ) : (
        <p className="newsletter-form-note">
          配信停止は、各メールのリンクからいつでもできます。メールアドレスの管理は Kit（Kit, Inc.）のシステムで行い、配信以外の目的には使いません。詳しくは
          <a href="/privacy/">プライバシーポリシー</a>
          をご覧ください。
        </p>
      )}
    </div>
  );
}
