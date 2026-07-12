import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, Blocks, FileText, MessageCircle, Palette, ShieldCheck } from "lucide-react";
import { publishedJobs } from "@/content/jobs";

export const metadata: Metadata = { title: "仕事から見るスキル", description: "職業ページで確認したスキルを、技術、データ、対人、制作、業務運営、安全の6群に整理し、使う職業と場面から探せます。", alternates: { canonical: "/skills/" } };

const groups = [
  { key: "technology", label: "技術・デジタル", description: "道具や仕組みを理解し、作る・設定する", icon: Blocks, words: ["プログラミング", "Git", "HTML", "CSS", "データベース", "IT", "Figma", "編集ソフト", "会計ソフト"] },
  { key: "data", label: "データ・分析", description: "数字や情報を整え、判断材料へ変える", icon: BarChart3, words: ["データ", "SQL", "統計", "可視化", "解析", "表計算", "計測", "在庫", "残高", "簿記"] },
  { key: "communication", label: "対人・伝達", description: "聞く、説明する、調整する、支援する", icon: MessageCircle, words: ["説明", "傾聴", "コミュニ", "メール", "英語", "対人", "援助", "連携", "ファシリ", "商品理解"] },
  { key: "creative", label: "文章・制作", description: "目的と相手に合わせて表現を組み立てる", icon: Palette, words: ["ライティング", "構成", "レイアウト", "色", "文字", "画像", "動画", "音声", "文書", "デザイン"] },
  { key: "operations", label: "業務運営・正確性", description: "期限、手順、記録を守り、仕事を完了させる", icon: FileText, words: ["期限", "正確", "確認", "記録", "管理", "優先", "業務", "ダブル", "証跡", "ファイル"] },
  { key: "safety", label: "安全・法令・倫理", description: "権利、制度、安全、個人情報を確認する", icon: ShieldCheck, words: ["セキュリティ", "著作権", "法務", "法令", "感染", "事故", "医薬品", "介護", "権利", "倫理"] },
] as const;

export default function SkillsPage() {
  const allSkills = [...new Set(publishedJobs.flatMap((job) => job.skills))].sort((a, b) => a.localeCompare(b, "ja"));
  const assigned = new Set<string>();
  const sections = groups.map((group) => {
    const skills = allSkills.filter((skill) => group.words.some((word) => skill.includes(word)));
    skills.forEach((skill) => assigned.add(skill));
    return { ...group, skills };
  });
  const foundation = allSkills.filter((skill) => !assigned.has(skill));
  return <div className="page-shell skills-page"><header className="page-heading"><span className="eyebrow">skills by work context</span><h1>スキルを、使う場面で整理する</h1><p>似た言葉を一列に並べず、仕事で果たす役割ごとにまとめました。点数や優劣ではなく、どの職業のどの作業で使うかを確認できます。</p></header>
    <nav className="skill-group-nav" aria-label="スキル分類">{sections.map((section) => <a key={section.key} href={`#${section.key}`}>{section.label}<small>{section.skills.length}</small></a>)}<a href="#foundation">基礎・その他<small>{foundation.length}</small></a></nav>
    <div className="skill-group-grid">{sections.map((section) => { const Icon = section.icon; return <section id={section.key} className="skill-group" key={section.key}><header><span><Icon aria-hidden="true" /></span><div><h2>{section.label}</h2><p>{section.description}</p></div></header><div className="skill-tags">{section.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><div className="skill-jobs"><strong>使う職業</strong>{publishedJobs.filter((job) => job.skills.some((skill) => section.skills.includes(skill))).slice(0, 5).map((job) => <Link href={`/career/${job.slug}/`} key={job.slug}>{job.name}</Link>)}</div></section>; })}
      <section id="foundation" className="skill-group"><header><span><BadgeCheck aria-hidden="true" /></span><div><h2>基礎・その他</h2><p>複数の仕事を支える、分野固有または横断的な力</p></div></header><div className="skill-tags">{foundation.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
    </div>
    <section className="skill-learning"><div><span className="eyebrow">次の一歩</span><h2>覚える前に、1つの作業で試す</h2><p>ツール名だけを覚えず、仕事の課題を1つ選び、成果物・確認手順・注意点まで一周します。</p></div><Link className="button primary" href="/all/">556職業から使う場面を見る <ArrowRight aria-hidden="true" /></Link></section>
  </div>;
}
