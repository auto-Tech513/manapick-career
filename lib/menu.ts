/**
 * サイトメニューの区分と項目。説明は各ページの見出し・説明文の言い回しに合わせる。
 * match は「現在地」を判定するパスの先頭（省略時は href）。
 */
export type MenuItem = { href: string; label: string; description: string; match?: string[] };
export type MenuSection = { no: string; key: string; title: string; items: MenuItem[] };

export const menuSections: MenuSection[] = [
  {
    no: "01", key: "find", title: "職業を探す",
    items: [
      { href: "/", label: "トップ", description: "職業名・別名から探す入口" },
      { href: "/all/", label: "556職業の名録", description: "仕事内容・関連資格・年収の目安を出典つきで", match: ["/all/", "/occupation/", "/career/", "/category/"] },
      { href: "/employers/", label: "企業例のある職業", description: "企業・法人・公的機関の例を公式ページで確認" },
      { href: "/ranking/", label: "人気職業ランキング", description: "job tagのアクセス順と、統計で見る年収など" },
    ],
  },
  {
    no: "02", key: "decide", title: "比べる・試す",
    items: [
      { href: "/compare/", label: "職業を比較", description: "最大3つを仕事内容・資格・AI活用で並べる" },
      { href: "/route/", label: "キャリア候補の入口案内", description: "3問の入口案内と16タイプ働き方診断" },
      { href: "/skills/", label: "仕事から見るスキル", description: "6群のスキルから、使う職業を探す" },
      { href: "/tools/net-income/", label: "手取りシミュレーター", description: "年収から手取りの目安を試算する" },
    ],
  },
  {
    no: "03", key: "read", title: "読む・調べる",
    items: [
      { href: "/guide/", label: "職業ガイド", description: "職業の違いと仕事の読み方を公式出典で確認" },
      { href: "/news/", label: "キャリアニュース", description: "雇用・賃金・制度の一次資料を読み解く" },
      { href: "/research/", label: "キャリアデータ室", description: "一次資料の示すこと・示さないことを読む" },
      { href: "/glossary/", label: "キャリア用語集", description: "統計・賃金・雇用制度の用語105語" },
      { href: "/shop/", label: "manapi商店", description: "学び直し・面接・仕事準備の道具" },
    ],
  },
  {
    no: "04", key: "about", title: "このサイトについて",
    items: [
      { href: "/faq/", label: "よくある質問", description: "使い方・出典・数字の読み方" },
      { href: "/about-method/", label: "作成方法・編集方針", description: "名録データと出典の扱い" },
      { href: "/contact/", label: "訂正・お問い合わせ", description: "誤りの報告と問い合わせ" },
      { href: "/operator/", label: "運営者情報", description: "運営体制と姉妹サイトの役割" },
      { href: "/affiliate/", label: "広告・アフィリエイト", description: "PR表示と紹介料の方針" },
      { href: "/disclaimer/", label: "免責事項", description: "保証しないことと確認のお願い" },
      { href: "/privacy/", label: "プライバシーポリシー", description: "アクセス解析・Cookieの扱い" },
    ],
  },
];

const allItems = menuSections.flatMap((section) => section.items.map((item) => ({ ...item, section })));

/** パスから現在地の項目を返す（最長一致）。 */
export function currentMenuItem(pathname: string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  let best: (typeof allItems)[number] | undefined;
  let bestLength = -1;
  for (const item of allItems) {
    for (const prefix of item.match ?? [item.href]) {
      const hit = prefix === "/" ? path === "/" : path.startsWith(prefix);
      if (hit && prefix.length > bestLength) { best = item; bestLength = prefix.length; }
    }
  }
  return best;
}
