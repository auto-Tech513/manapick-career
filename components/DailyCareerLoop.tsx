import Link from "next/link";
import type { NewsItem } from "@/content/editorial";
import { PhraseText } from "@/components/PhraseTitle";

const steps = [
  { code: "KNOW", label: "知る" },
  { code: "COMPARE", label: "比べる" },
  { code: "TRY", label: "試す" },
  { code: "RECORD", label: "記録" },
];

/**
 * DAILY CAREER LOOP in the adopted design: a ring line with the four
 * stations KNOW / COMPARE / TRY / RECORD and four step cards. Card
 * content and destinations are the site's existing loop (latest news,
 * compare, manapick videos, recording guide).
 */
export function DailyCareerLoop({ latestNews }: { latestNews?: NewsItem }) {
  return (
    <section className="sec sec-tight" aria-labelledby="daily-career-title">
      <div className="loop">
        <div className="ring" aria-hidden="true">
          <div className="ring-c">
            <div>
              <span>DAILY CAREER LOOP</span>
              <b>
                読むだけで<br />
                終わらせない、
                <br />
                15分の使い方。
              </b>
            </div>
          </div>
          {steps.map((step, index) => (
            <div
              key={step.code}
              className={`ring-p ring-p-${["t", "r", "b", "l"][index]}${index === 0 ? " on" : ""}`}
            >
              <em>{step.code}</em>
              <small>{step.label}</small>
            </div>
          ))}
        </div>
        <div>
          <div className="eh eh-loop">
            <div>
              <span className="code">CA-02 · LOOP</span>
              <h2 id="daily-career-title" className="phrase-breaks"><PhraseText text="知る → 比べる → 試す → 記録する" /></h2>
            </div>
          </div>
          <div className="steps4">
            <Link
              className="step4"
              href={latestNews ? `/news/${latestNews.slug}/` : "/news/"}
            >
              <em>01 KNOW</em>
              <b>{latestNews ? "最新のニュースを読む" : "確認済みニュースを読む"}</b>
              <span>
                {latestNews
                  ? `${latestNews.title}（一次資料確認 ${latestNews.checkedAt}）`
                  : "確認を終えた記事だけ公開します"}
              </span>
            </Link>
            <Link className="step4" href="/compare/">
              <em>02 COMPARE</em>
              <b>似た仕事を2つ比べる</b>
              <span>職業名ではなく、成果物と責任範囲で比較</span>
            </Link>
            <a
              className="step4"
              href="https://manapick.app/"
              target="_blank"
              rel="noopener"
            >
              <em>03 TRY</em>
              <b>動画を1本見る</b>
              <span>manapick の関連動画へ乗り換え</span>
            </a>
            <Link className="step4" href="/guide/">
              <em>04 RECORD</em>
              <b>気づきを残す</b>
              <span>目的・試したこと・次の確認を、端末内のメモに保存。次回はここから</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
