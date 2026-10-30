export type ArticleChartBar = {
  label: string;
  value: number;
  display: string;
};

export type ArticleChart = {
  title: string;
  note?: string;
  bars: ArticleChartBar[];
};

// グラフの数値は、対象記事の本文（一次資料に基づく公表値）に実際に載っている
// 値だけを使う。表示文字列（display）が本文に逐語で存在することを
// scripts/check-article-charts.mjs で機械照合する。
export const articleCharts: Record<string, ArticleChart> = {
  "minimum-wage-2026": {
    title: "2026年度の地域別最低賃金（時間額）",
    note: "発効日は都道府県ごとに2026年10月1日から12月2日まで異なります。",
    bars: [
      { label: "東京都", value: 1280, display: "1,280円" },
      { label: "全国加重平均", value: 1177, display: "1,177円" },
      { label: "宮崎県", value: 1085, display: "1,085円" },
      { label: "昨年度の全国加重平均", value: 1121, display: "1,121円" },
    ],
  },
  "private-salary-survey-2025": {
    title: "雇用形態別の平均給与（令和7年分・1年を通じて勤務した給与所得者）",
    note: "平均給与は、給料・手当と賞与の年間支給総額を人数で割った値です。",
    bars: [
      { label: "正社員（正職員）", value: 559, display: "559万円" },
      { label: "全体", value: 487, display: "487万円" },
      { label: "正社員（正職員）以外", value: 210, display: "210万円" },
    ],
  },
  "social-insurance-part-timers-2026": {
    title: "社会保険の企業規模要件（被保険者数）の段階的な縮小",
    note: "週の所定労働時間が20時間以上であることなど、ほかの加入要件は変わりません。",
    bars: [
      { label: "2026年10月から", value: 51, display: "51人以上" },
      { label: "2027年10月から", value: 36, display: "36人以上" },
      { label: "2029年10月から", value: 21, display: "21人以上" },
      { label: "2032年10月から", value: 11, display: "11人以上" },
    ],
  },
  "childcare-leave-rate-latest": {
    title: "育児休業取得率（令和7年度雇用均等基本調査）",
    note: "取得率は、対象期間に出産があった人のうち、調査時点までに育児休業を開始した人の割合です。休業期間の長さは含みません。",
    bars: [
      { label: "女性（令和7年度）", value: 88.3, display: "88.3％" },
      { label: "女性（令和6年度）", value: 86.6, display: "86.6％" },
      { label: "男性（令和7年度）", value: 50.9, display: "50.9％" },
      { label: "男性（令和6年度）", value: 40.5, display: "40.5％" },
    ],
  },
  "nurse-exam-latest": {
    title: "国家試験の合格率（2026年実施）",
    note: "看護師の合格率は、新卒者と全体で5.8ポイントの差があります。",
    bars: [
      { label: "助産師", value: 99.7, display: "99.7%" },
      { label: "看護師・新卒", value: 94.1, display: "94.1%" },
      { label: "看護師・全体", value: 88.3, display: "88.3%" },
      { label: "保健師", value: 87.1, display: "87.1%" },
    ],
  },
  "skills-development-survey-latest": {
    title: "OFF-JTを受講した労働者の割合（令和7年度能力開発基本調査）",
    note: "自己啓発を実施した労働者でも、正社員43.3％に対し正社員以外は15.9％と差があります。",
    bars: [
      { label: "正社員", value: 44.5, display: "44.5％" },
      { label: "全体", value: 37.3, display: "37.3％" },
      { label: "正社員以外", value: 19.4, display: "19.4％" },
    ],
  },
  "elderly-employment-latest": {
    title: "65歳までの雇用確保措置の内訳（実施済み企業）",
    note: "65歳までの雇用確保措置を実施済みの企業は99.9％です。70歳までの就業確保措置の実施済みは34.8％にとどまります。",
    bars: [
      { label: "継続雇用制度の導入", value: 65.1, display: "65.1％" },
      { label: "定年の引き上げ", value: 31.0, display: "31.0％" },
      { label: "定年制の廃止", value: 3.9, display: "3.9％" },
    ],
  },
  "spring-wage-settlement-2026": {
    title: "主要企業の平均妥結額（春季賃上げ）",
    note: "賃上げ率は5.18％で、前年の5.52％から0.34ポイント下がりました。集計対象は、資本金10億円以上かつ従業員1,000人以上の労働組合のある企業428社です。",
    bars: [
      { label: "前年", value: 18629, display: "18,629円" },
      { label: "2026年", value: 18167, display: "18,167円" },
    ],
  },
  "job-openings-august-2026": {
    title: "都道府県別の有効求人倍率（2026年8月・就業地別）",
    note: "全国の有効求人倍率（季節調整値）は1.18倍で、正社員有効求人倍率は1.00倍でした。",
    bars: [
      { label: "福井県", value: 1.72, display: "1.72倍" },
      { label: "全国", value: 1.18, display: "1.18倍" },
      { label: "大阪府", value: 0.95, display: "0.95倍" },
    ],
  },
  "gender-whitepaper-latest": {
    title: "「何歳になっても、能力を伸ばし続けることができる」に「そう思う」と答えた割合",
    note: "「社会の変化に対応するために、学び続けることが必要だ」への肯定は、女性44.7％、男性40.3％でした。",
    bars: [
      { label: "女性", value: 47.5, display: "47.5％" },
      { label: "男性", value: 37.9, display: "37.9％" },
    ],
  },
  "teacher-exam-latest": {
    title: "校種別の競争率（令和7年度公立学校教員採用選考）",
    note: "数字は2026年10月1日付の訂正後の資料に基づきます。",
    bars: [
      { label: "全体", value: 2.9, display: "2.9倍" },
      { label: "小学校", value: 2.0, display: "2.0倍" },
      { label: "特別支援学校", value: 2.0, display: "2.0倍" },
      { label: "中学校", value: 3.6, display: "3.6倍" },
      { label: "高等学校", value: 3.8, display: "3.8倍" },
      { label: "養護教諭", value: 8.2, display: "8.2倍" },
      { label: "栄養教諭", value: 9.9, display: "9.9倍" },
    ],
  },
  "new-graduate-employment-latest": {
    title: "学校種別の就職率（2026年3月卒業者・4月1日現在）",
    note: "就職率は、卒業生全員ではなく就職希望者を分母にした割合です。",
    bars: [
      { label: "高等専門学校", value: 99.2, display: "99.2%" },
      { label: "専修学校（専門課程）", value: 98.6, display: "98.6%" },
      { label: "大学生", value: 98.0, display: "98.0%" },
      { label: "高校生", value: 97.9, display: "97.9%" },
      { label: "短期大学", value: 97.4, display: "97.4%" },
    ],
  },
  "first-class-vs-second-class-electrician": {
    title: "電気工事士試験の受験手数料",
    bars: [
      { label: "第一種", value: 14400, display: "14,400円" },
      { label: "第一種（電子申請等）", value: 13000, display: "13,000円" },
      { label: "第二種", value: 12500, display: "12,500円" },
      { label: "第二種（電子申請等）", value: 11100, display: "11,100円" },
    ],
  },
  "nurse-vs-assistant-nurse": {
    title: "看護師の主なタスクの実施率（job tag）",
    note: "job tagのタスク一覧に載る実施率です。",
    bars: [
      { label: "健康状態のチェック", value: 96.2, display: "96.2％" },
      { label: "体温・脈拍・血圧の計測", value: 96.2, display: "96.2％" },
      { label: "注射・点滴などの処置", value: 94.2, display: "94.2％" },
      { label: "看護計画を立てる", value: 80.8, display: "80.8％" },
      { label: "他の看護師を指導し教育する", value: 76.9, display: "76.9％" },
    ],
  },
  "sales-admin-vs-office-clerk": {
    title: "営業事務の主なタスクの実施率（job tag）",
    note: "job tagのタスク一覧に載る実施率です。",
    bars: [
      { label: "顧客の問い合わせに対応する", value: 89.3, display: "89.3%" },
      { label: "出荷の手配を行う", value: 78.6, display: "78.6%" },
      { label: "来客対応を行う", value: 78.6, display: "78.6%" },
      { label: "請求書を発行する", value: 71.4, display: "71.4%" },
      { label: "納期を管理する", value: 69.6, display: "69.6%" },
    ],
  },
};

export function articleChartForPathname(pathname: string): ArticleChart | undefined {
  const slug = pathname.split("/").filter(Boolean)[1];
  return slug ? articleCharts[slug] : undefined;
}
