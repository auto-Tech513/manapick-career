export type Guide = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  readMinutes: number;
  checkedAt: string;
  author: string;
  editor: string;
  sourceIds: string[];
  sections: Array<{ heading: string; paragraphs: string[]; points?: string[] }>;
};

export type NewsItem = {
  slug: string;
  title: string;
  summary: string;
  kind: "公開情報" | "機能改善" | "編集情報";
  publishedAt: string;
  checkedAt: string;
  body: string[];
  relatedHref: string;
  relatedLabel: string;
};

export const guides: Guide[] = [
  {
    slug: "how-to-read-career-pages",
    title: "職業ページの読み方：仕事内容から学びの入口を見つける",
    summary: "結論だけで決めず、仕事内容・注意点・学ぶ順番・出典を順に確認するためのガイドです。",
    category: "はじめての方へ",
    readMinutes: 5,
    checkedAt: "2026-07-12",
    author: "manapick career編集部",
    editor: "manapick編集責任者",
    sourceIds: ["mhlw-jobtag-dx", "ipa-dss"],
    sections: [
      {
        heading: "最初に仕事内容と注意点を読む",
        paragraphs: ["職業名が同じでも、組織や担当範囲によって実際の作業は変わります。まず『どんな仕事？』と『先に知っておきたい注意点』を続けて読み、自分が取り組みたい作業と避けたい条件を分けてください。"],
        points: ["職業名だけで判断しない", "作業の目的と相手を確認する", "注意点を後回しにしない"],
      },
      {
        heading: "入口スキルは試す順番として使う",
        paragraphs: ["必要スキルの一覧は、すべてを先に習得するためのチェックリストではありません。小さな成果物を作り、分からなかった部分を次に学ぶ順番として使います。"],
      },
      {
        heading: "出典と確認日を最後に確認する",
        paragraphs: ["制度や資格要件は変わる可能性があります。ページ末尾の出典、最終確認日、確認方法を読み、申込みや費用の判断は必ず公式ページの最新表示で確認してください。"],
      },
    ],
  },
  {
    slug: "build-a-learning-route-from-tasks",
    title: "仕事内容から学ぶ順番を作る3ステップ",
    summary: "興味のある作業を一つ選び、小さく試してから学習範囲を広げる方法を整理します。",
    category: "学び方",
    readMinutes: 6,
    checkedAt: "2026-07-12",
    author: "manapick career編集部",
    editor: "manapick編集責任者",
    sourceIds: ["ipa-dss"],
    sections: [
      {
        heading: "1. 職業ではなく作業を一つ選ぶ",
        paragraphs: ["『データアナリストを学ぶ』のように広く置かず、『表を整えて問いに沿ったグラフを作る』のように、完了を確認できる作業へ分解します。"],
      },
      {
        heading: "2. 短い時間で試作品を作る",
        paragraphs: ["最初から完成度を求めず、入力・処理・出力が一度つながるところまで試します。できなかった箇所が、次に学ぶ具体的なテーマになります。"],
        points: ["作業の目的を1文で書く", "使う素材と道具を限定する", "完成条件を先に決める"],
      },
      {
        heading: "3. 公式情報と実務例で見直す",
        paragraphs: ["試した作業が実際の職務のどこに位置するかを、公的な職業情報や職種別の一次情報で確認します。ページ内の関連動画・AI・資格は別々の役割として比較してください。"],
      },
    ],
  },
  {
    slug: "how-to-think-about-ai-and-work",
    title: "AIと仕事を考えるときに、代替率ではなく作業を見る理由",
    summary: "職業全体をAIが置き換えると断定せず、変化する作業と人が確認する作業を分けて考えます。",
    category: "AI活用",
    readMinutes: 7,
    checkedAt: "2026-07-12",
    author: "manapick career編集部",
    editor: "manapick編集責任者",
    sourceIds: ["ipa-dss"],
    sections: [
      {
        heading: "職業全体ではなく作業単位で見る",
        paragraphs: ["一つの職業には、情報整理、作成、確認、説明、関係者との調整など複数の作業があります。AIの影響を考えるときは、入力条件と確認責任を含めて作業ごとに見ます。"],
      },
      {
        heading: "変化しやすい作業と人に残る確認を分ける",
        paragraphs: ["定型的な下書きや分類は道具で変化しやすい一方、目的設定、例外判断、安全確認、説明責任は利用場面に応じた人の確認が必要です。これは将来を保証する分類ではなく、学ぶ範囲を具体化するための整理です。"],
      },
      {
        heading: "AIを使う前に確認すること",
        paragraphs: ["扱う情報の機密性、出力の検証方法、誤りが起きたときの影響を先に確認します。関連AIへのリンクは利用を推奨する順位ではなく、用途を調べる入口として掲載しています。"],
        points: ["入力してよい情報か", "誰が出力を検証するか", "元資料へ戻れるか"],
      },
    ],
  },
];

export const newsItems: NewsItem[] = [
  {
    slug: "guide-and-news-opened",
    title: "職業ガイドと掲載内容の更新情報を公開しました",
    summary: "職業ページの読み方、学ぶ順番、AIと仕事の考え方をまとめたガイドと、サイト更新情報の掲載を開始しました。",
    kind: "編集情報",
    publishedAt: "2026-07-12",
    checkedAt: "2026-07-12",
    body: ["職業詳細だけでなく、情報をどう読み、次の学びへどうつなげるかを説明するガイドを追加しました。", "更新情報では、掲載範囲や画面・導線の変更を記録します。外部の労働市場ニュースを無断転載するページではありません。"],
    relatedHref: "/guide/",
    relatedLabel: "ガイドを見る",
  },
  {
    slug: "home-navigation-improved",
    title: "ホーム画面とメニューの情報設計を改善しました",
    summary: "見出しの強弱、ヒーローと職業一覧の間隔、スマートフォンのメニュー導線を見直しました。",
    kind: "機能改善",
    publishedAt: "2026-07-12",
    checkedAt: "2026-07-12",
    body: ["トップ画面では、主見出しの強調箇所を一つに絞り、職業一覧へ続く余白を短縮しました。", "ハンバーガーメニューは用途別の2列タイルに整理し、職業、ガイド、更新情報、編集方針へ短い操作で移動できる構成にしました。"],
    relatedHref: "/",
    relatedLabel: "ホームを見る",
  },
  {
    slug: "career-site-launched",
    title: "manapick careerを公開しました",
    summary: "公開条件を満たした職業だけを掲載し、仕事内容から動画・AI・資格の学びへつなぐ職業情報サイトを開始しました。",
    kind: "公開情報",
    publishedAt: "2026-07-12",
    checkedAt: "2026-07-12",
    body: ["career.manapick.appを職業詳細情報の正本として公開しました。職業そのものの点数化や、根拠のない年収・将来性の順位付けは行いません。", "各職業ページには執筆、編集確認、最終確認日、出典、訂正窓口を表示し、公開条件を満たさないデータはページやsitemapへ出さない設計です。"],
    relatedHref: "/about-method/",
    relatedLabel: "作成方法を確認する",
  },
];

export const guideBySlug = (slug: string) => guides.find((item) => item.slug === slug);
export const newsBySlug = (slug: string) => newsItems.find((item) => item.slug === slug);
