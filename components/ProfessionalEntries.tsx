import Link from "next/link";
import "./professional-entries.css";
import profiles from "@/content/professional-careers.json";
import { PhraseText } from "@/components/PhraseTitle";

/** Occupation-page ids for the four profiled occupations (仕事内容/資格/年収 anchors). */
const occupationIdBySlug: Record<string, string> = {
  "tax-accountant": "91",
  lawyer: "88",
  nurse: "155",
  "childcare-worker": "130",
};

function BuildingIcon({ slug }: { slug: string }) {
  const stroke = "#172033";
  if (slug === "lawyer") {
    return (
      <svg width="130" height="120" viewBox="0 0 130 120" aria-hidden="true">
        <polygon points="65,14 112,40 65,62 18,40" fill="#172033" />
        <polygon points="22,46 65,68 65,108 22,86" fill="#fff" stroke={stroke} strokeWidth="2.5" />
        <polygon points="65,68 108,46 108,86 65,108" fill="#E8E1C9" stroke={stroke} strokeWidth="2.5" />
        <circle cx="86" cy="76" r="8" fill="#FFD700" stroke={stroke} strokeWidth="2" />
      </svg>
    );
  }
  if (slug === "nurse") {
    return (
      <svg width="130" height="120" viewBox="0 0 130 120" aria-hidden="true">
        <polygon points="65,24 118,50 65,76 12,50" fill="#fff" stroke={stroke} strokeWidth="2.5" />
        <polygon points="12,50 65,76 65,108 12,82" fill="#fff" stroke={stroke} strokeWidth="2.5" />
        <polygon points="65,76 118,50 118,82 65,108" fill="#E8E1C9" stroke={stroke} strokeWidth="2.5" />
        <path d="M58 44h14M65 37v14" stroke="#D93025" strokeWidth="5" />
      </svg>
    );
  }
  if (slug === "childcare-worker") {
    return (
      <svg width="130" height="120" viewBox="0 0 130 120" aria-hidden="true">
        <polygon points="65,30 112,54 65,78 18,54" fill="#9AD0B0" stroke={stroke} strokeWidth="2.5" />
        <polygon points="18,54 65,78 65,104 18,80" fill="#fff" stroke={stroke} strokeWidth="2.5" />
        <polygon points="65,78 112,54 112,80 65,104" fill="#E8E1C9" stroke={stroke} strokeWidth="2.5" />
        <path d="M40 14l26 16-26 0z" fill="#FFD700" stroke={stroke} strokeWidth="2" />
        <path d="M40 14v42" stroke={stroke} strokeWidth="2.5" />
      </svg>
    );
  }
  return (
    <svg width="130" height="120" viewBox="0 0 130 120" aria-hidden="true">
      <polygon points="65,20 115,45 65,70 15,45" fill="#FFD700" stroke={stroke} strokeWidth="2.5" />
      <polygon points="15,45 65,70 65,108 15,83" fill="#fff" stroke={stroke} strokeWidth="2.5" />
      <polygon points="65,70 115,45 115,83 65,108" fill="#E8E1C9" stroke={stroke} strokeWidth="2.5" />
      <path d="M28 60v18M40 66v18M52 72v18M78 72v18M90 66v18M102 60v18" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

/**
 * 「身近な仕事を、具体的に知る」 — occupation cards in the adopted
 * design: a pale-yellow field with the occupation's isometric building,
 * the name in Mincho, a one-line summary from the profile data, and the
 * 仕事内容 / 資格 / 年収 shortcuts into the occupation page.
 */
export function ProfessionalEntries() {
  return (
    <section className="sec pro-entries" id="professional" aria-labelledby="professional-title">
      <div className="eh">
        <div>
          <span className="code">CA-01 · CLOSE TO YOU</span>
          <h2 id="professional-title" className="phrase-breaks"><PhraseText text="身近な仕事を、具体的に知る" /></h2>
        </div>
        <p className="phrase-breaks"><PhraseText text="実際の働き方・資格・日本企業と公的機関の例・統計の数値を整理しています。" /></p>
      </div>
      <div className="jobs">
        {profiles.items.map((item) => {
          const occupationId = occupationIdBySlug[item.slug];
          return (
            <article className="job" key={item.slug}>
              <div className="job-top">
                <span className="job-tag">{item.categoryLabel}</span>
                <BuildingIcon slug={item.slug} />
              </div>
              <div className="job-bd">
                <h3>
                  <Link href={`/career/${item.slug}/`}>{item.name}</Link>
                </h3>
                <p>{item.summary.slice(0, item.summary.indexOf("。") + 1)}</p>
                {occupationId ? (
                  <div className="job-lk">
                    <Link href={`/occupation/${occupationId}/#work`}>仕事内容</Link>
                    <Link href={`/occupation/${occupationId}/#qualifications`}>資格</Link>
                    <Link href={`/occupation/${occupationId}/#income`}>年収</Link>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
