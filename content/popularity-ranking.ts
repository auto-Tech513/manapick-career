export type PopularityEntry = {
  rank: number;
  name: string;
  category: string;
  careerSlug?: string;
  connections: Array<"動画" | "AI" | "資格">;
};

export const popularityMethod = {
  sourceId: "mhlw-jobtag-access-ranking-2026-07-13",
  sourceUrl: "https://shigoto.mhlw.go.jp/Ranking/Ranking",
  checkedAt: "2026-07-13",
  description: "厚生労働省job tagが、同サイト内のアクセス履歴を基に公開している職業アクセスランキングです。",
  limitation: "アクセス数は関心の大きさを示す一指標であり、年収、将来性、適性、採用可能性、職業価値を示しません。",
} as const;

export const popularityRanking: PopularityEntry[] = [
  { rank: 1, name: "Webデザイナー（Web制作会社）", category: "デザイン", careerSlug: "web-designer", connections: ["動画", "AI", "資格"] },
  { rank: 2, name: "CADオペレーター", category: "設計・製図", connections: ["動画", "AI", "資格"] },
  { rank: 3, name: "一般事務", category: "事務", careerSlug: "office-administration", connections: ["動画", "AI", "資格"] },
  { rank: 4, name: "児童相談所相談員", category: "福祉", connections: ["動画", "資格"] },
  { rank: 5, name: "グラフィックデザイナー", category: "デザイン", connections: ["動画", "AI", "資格"] },
  { rank: 6, name: "看護師", category: "医療・看護", connections: ["動画", "資格"] },
  { rank: 7, name: "キャリアカウンセラー/キャリアコンサルタント", category: "相談・支援", connections: ["動画", "資格"] },
  { rank: 8, name: "地方公務員（行政事務）", category: "行政", connections: ["動画", "AI", "資格"] },
  { rank: 9, name: "児童指導員", category: "福祉・教育", connections: ["動画", "資格"] },
  { rank: 10, name: "臨床検査技師", category: "医療・検査", connections: ["動画", "資格"] },
  { rank: 11, name: "プログラマー", category: "IT", careerSlug: "software-engineer", connections: ["動画", "AI", "資格"] },
  { rank: 12, name: "動物園飼育員", category: "動物・施設", connections: ["動画", "資格"] },
];
