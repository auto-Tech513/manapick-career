export type PublicationStatus = "draft" | "reviewed" | "published";

export type Claim = {
  id: string;
  text: string;
  sourceIds: string[];
  lastCheckedAt: string;
  freshnessDays: number;
  critical?: boolean;
};

export type CareerJob = {
  slug: string;
  name: string;
  category: string;
  status: PublicationStatus;
  conclusion: [string, string];
  work: string[];
  possibilities: string[];
  cautions: string[];
  tasks: string[];
  skills: string[];
  learningSteps: string[];
  qualifications: { label: string; networkId: string }[];
  ai: { label: string; networkId: string; use: string }[];
  videos: { label: string; networkId: string }[];
  learningTime: string;
  entrySkills: string[];
  learningLoad: "小さく試す" | "基礎から積む" | "継続的に積む";
  sourceIds: string[];
  checkedAt: string;
  author: string;
  editor: string;
  editorNote: string;
  editorReviewed: boolean;
  routeTags: string[];
  claims: Claim[];
};

const checkedAt = "2026-07-12";
const claim = (id: string, text: string, sourceIds: string[], critical = false): Claim => ({
  id,
  text,
  sourceIds,
  lastCheckedAt: checkedAt,
  freshnessDays: critical ? 60 : 180,
  critical,
});

export const jobs: CareerJob[] = [
  {
    slug: "it-consultant", name: "ITコンサルタント", category: "it-ai", status: "published",
    conclusion: ["企業の経営・業務上の課題を整理し、情報技術を使った解決方針と実行計画を提案する仕事です。", "製品を勧める前に、現状、目的、制約、効果の測り方を関係者と合意する力が入口になります。"],
    work: ["経営層や現場へ聞き取りを行い、業務・システム・組織の課題と優先順位を整理します。", "解決策の比較、要件や導入計画の作成、ベンダーや開発チームとの調整、導入後の評価を支援します。"],
    possibilities: ["曖昧な相談を質問で具体化したい", "業務と技術の両方を調べて説明したい", "立場の違う人の条件を整理して合意点を探したい"],
    cautions: ["ITコンサルタントという名称でも、戦略、業務、ERP、セキュリティなど担当領域は異なります。", "提案の影響範囲、費用、情報セキュリティ、移行リスクを確認し、効果を保証する表現は避けます。"],
    tasks: ["経営・業務課題の聞き取り", "現状分析", "解決策の比較", "要件と導入計画の作成", "関係者調整", "導入後の評価"],
    skills: ["業務分析", "論点整理", "ITの基礎", "情報セキュリティ", "文書・プレゼンテーション", "プロジェクト管理"],
    learningSteps: ["身近な業務を入力・処理・出力に分ける", "課題・原因・制約を一枚に整理する", "複数の解決案と評価基準を作る", "提案と検証結果を第三者へ説明する"],
    qualifications: [{label:"ITパスポート",networkId:"license:it-passport"},{label:"G検定",networkId:"license:g-kentei"}],
    ai: [{label:"ChatGPT",networkId:"ai:chatgpt",use:"たたき台作成と論点整理"},{label:"Microsoft Copilot",networkId:"ai:copilot",use:"文書・表計算作業の補助"}],
    videos: [{label:"IT・生成AIロードマップ",networkId:"learning:ai"}],
    learningTime: "IT知識だけでなく、一つの業務課題を分析し、複数案と導入条件を説明できる成果物までを最初の区切りにします。",
    entrySkills: ["業務フローの可視化", "課題と制約の整理", "比較提案の作成"], learningLoad: "継続的に積む",
    sourceIds: ["mhlw-jobtag-it-consultant","ipa-dss"], checkedAt, author:"manapick career編集部", editor:"manapick編集責任者", editorNote:"job tagのITコンサルタントとIPA資料を基にした独自要約。実体験談ではありません。", editorReviewed:true,
    routeTags:["仕組みを改善","人と調整","週3時間以上"],
    claims:[claim("it-consultant-role","ITコンサルタントは経営・業務上の課題を分析し、IT戦略やシステム化方針を提案します。",["mhlw-jobtag-it-consultant","ipa-dss"])]
  },
  {
    slug:"software-engineer",name:"ソフトウェアエンジニア",category:"it-ai",status:"published",
    conclusion:["利用者の課題を、動くソフトウェアとして形にする仕事です。","文法の暗記より、設計・実装・テスト・改善を小さく一周することが入口になります。"],
    work:["要件を整理し、画面やデータの構造を設計してコードを書きます。","動作確認、レビュー、障害対応、更新を繰り返し、チームで品質を守ります。"],
    possibilities:["仕組みを分解して考える作業が好き","分からない原因を調べ続けられる","作ったものを利用者の反応で改善したい"],
    cautions:["使う言語や開発環境は職場によって異なります。","生成AIの出力はそのまま採用せず、権限・安全性・ライセンス・テストを人が確認します。"],
    tasks:["要件整理","設計","プログラミング","コードレビュー","テスト","運用と障害対応"],
    skills:["論理的な分解","プログラミング基礎","Git","データベース","テスト","セキュリティ"],
    learningSteps:["HTML/CSS/JavaScriptかPythonで基礎を一周する","小さなアプリを作る","Gitで変更履歴を管理する","テストと公開手順を学ぶ"],
    qualifications:[{label:"基本情報技術者試験",networkId:"license:fe"},{label:"ITパスポート",networkId:"license:it-passport"}],
    ai:[{label:"GitHub Copilot",networkId:"ai:github-copilot",use:"コード候補と説明の補助"},{label:"ChatGPT",networkId:"ai:chatgpt",use:"エラーの論点整理"}],
    videos:[{label:"Pythonロードマップ",networkId:"learning:prog"}],
    learningTime:"学習期間の長さより、説明できる小作品を作り、テストと修正まで経験したかで考えます。",
    entrySkills:["変数・条件分岐・関数", "Gitの基本", "小さなアプリ1つ"],learningLoad:"継続的に積む",
    sourceIds:["mhlw-jobtag-software","ipa-dss"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"開発職の範囲は広いため、Web・業務ソフトの共通部分を中心に整理。",editorReviewed:true,
    routeTags:["ものを作る","一人で集中","週3時間以上"],claims:[claim("software-flow","ソフトウェア開発には企画・設計・実装・更新が含まれます。",["mhlw-jobtag-software","ipa-dss"])]
  },
  {
    slug:"data-analyst",name:"データアナリスト",category:"data",status:"published",
    conclusion:["数字を集計するだけでなく、判断したい問いに合わせてデータを整え、解釈を伝える仕事です。","表計算、SQL、可視化の順に、実際の問いを使って学ぶと入口を作れます。"],
    work:["依頼者と分析目的を決め、必要なデータの意味や欠損を確認します。","集計・可視化・検証を行い、限界も含めて意思決定者へ説明します。"],
    possibilities:["数字の違いの理由を考えたい","曖昧な依頼を問いに直すのが苦にならない","結論と限界を分けて説明したい"],
    cautions:["相関だけで原因を断定すると判断を誤ることがあります。","個人情報や社外秘データを、承認のないAIサービスへ入力しません。"],
    tasks:["分析目的の確認","データ整形","集計","グラフ作成","検証","報告"],
    skills:["Excel/スプレッドシート","SQL","基礎統計","可視化","業務理解","説明力"],
    learningSteps:["表計算で集計とグラフを作る","SQLで必要な行を取り出す","指標の定義書を作る","結果と注意点を1ページにまとめる"],
    qualifications:[{label:"ITパスポート",networkId:"license:it-passport"}],ai:[{label:"NotebookLM",networkId:"ai:notebooklm",use:"資料を根拠付きで整理"},{label:"ChatGPT",networkId:"ai:chatgpt",use:"分析観点の洗い出し"}],videos:[{label:"Excelデータ分析ロードマップ",networkId:"learning:data"}],
    learningTime:"同じデータで、問い・定義・集計・説明を一周できるまでを最初の区切りにします。",entrySkills:["ピボット集計","SQLのSELECT","指標定義"],learningLoad:"基礎から積む",
    sourceIds:["mhlw-jobtag-data","ipa-dss"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"job tagのデータサイエンティスト情報を、分析職の共通工程に限って参照。",editorReviewed:true,routeTags:["数字を読む","一人で集中","週3時間以上"],claims:[claim("data-flow","分析は目的設定、データ確認、加工、検証、説明を反復します。",["mhlw-jobtag-data","ipa-dss"])]
  },
  {
    slug:"web-marketer",name:"Webマーケター",category:"marketing",status:"published",
    conclusion:["Web上の接点を使い、誰に何を届け、結果をどう改善するかを考える仕事です。","広告・SEO・メール・分析を広く触り、1つの施策を計測まで回すことが入口になります。"],
    work:["顧客や市場を調べ、サイトや広告などの施策を設計します。","表示・クリック・問い合わせなどの数字を確認し、表現や導線を改善します。"],
    possibilities:["人の行動理由を考えたい","文章と数字の両方を扱いたい","試した結果から次の案を作りたい"],cautions:["短期のクリックだけを追うと、顧客の信頼や長期成果を損なう場合があります。","広告表示、個人情報、Cookie、景品表示などのルールを確認します。"],tasks:["市場調査","顧客像の整理","コンテンツ企画","広告運用","アクセス解析","改善提案"],skills:["ライティング","アクセス解析","広告の基礎","SEOの基礎","表計算","法務・表示ルール"],learningSteps:["商品と顧客の仮説を言葉にする","小さな記事やLPを作る","計測項目を決める","結果から改善案を作る"],qualifications:[{label:"ITパスポート",networkId:"license:it-passport"}],ai:[{label:"ChatGPT",networkId:"ai:chatgpt",use:"企画案の比較と下書き"},{label:"Canva",networkId:"ai:canva",use:"制作案のたたき台"}],videos:[{label:"Webマーケロードマップ",networkId:"learning:marketing"}],learningTime:"施策を1回出すまでではなく、計測し、改善理由を説明できるまでを1サイクルとして考えます。",entrySkills:["顧客像の整理","計測の基礎","改善メモ"],learningLoad:"基礎から積む",sourceIds:["mhlw-jobtag-marketing"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"特定媒体の最新アルゴリズムではなく、共通する仕事の流れを整理。",editorReviewed:true,routeTags:["届け方を考える","人と調整","週3時間以上"],claims:[claim("marketing-work","Webマーケティングには市場調査、広告出稿、訪問者ニーズの分析が含まれます。",["mhlw-jobtag-marketing"])]
  },
  {
    slug:"social-media-manager",name:"SNS運用担当",category:"marketing",status:"published",
    conclusion:["SNSで継続的に情報を届け、反応と事業目的を結びつける仕事です。","投稿制作だけでなく、企画、確認体制、コメント対応、振り返りまでを一連で考えます。"],work:["対象者と運用目的を決め、投稿計画と制作ルールを整えます。","公開前確認、コメント対応、反応の記録を行い、次の企画を調整します。"],possibilities:["短い表現を何度も磨ける","相手の反応を落ち着いて観察できる","決めた頻度で継続するのが得意"],cautions:["私用アカウントとの誤投稿、著作権・肖像権、炎上時の対応経路を事前に決めます。","フォロワー数だけで成果や職業価値を判断しません。"],tasks:["運用目的の設定","投稿カレンダー","文章・画像制作","公開前確認","コメント対応","数値振り返り"],skills:["短文ライティング","画像・短尺動画の基礎","コミュニティ対応","計測","著作権・表示ルール"],learningSteps:["架空案件ではなく自分のテーマで運用方針を作る","1か月分の投稿案を作る","確認チェックリストを作る","反応を分類して改善する"],qualifications:[],ai:[{label:"Canva",networkId:"ai:canva",use:"画像・短尺素材の制作補助"},{label:"ChatGPT",networkId:"ai:chatgpt",use:"投稿案の比較"}],videos:[{label:"Webマーケ・SNS運用ロードマップ",networkId:"learning:marketing"}],learningTime:"毎日投稿の量ではなく、目的・制作・確認・対応・振り返りの運用を一通り設計できるかで考えます。",entrySkills:["投稿企画","制作チェック","反応の分類"],learningLoad:"小さく試す",sourceIds:["mhlw-jobtag-marketing"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"SNS専業の公的職業分類が限定的なため、Webマーケティングの共通工程から独自に整理。",editorReviewed:true,routeTags:["届け方を考える","短く作る","週3時間未満"],claims:[claim("sns-context","SNS運用はWebを利用した販売促進・顧客理解に隣接する業務です。",["mhlw-jobtag-marketing"])]
  },
  {
    slug:"video-editor",name:"動画編集者",category:"creative",status:"published",
    conclusion:["撮影素材を選び、構成・音・色・文字を整えて、目的に合う映像へ仕上げる仕事です。","編集ソフトの機能を広く覚えるより、短い1本を納品仕様まで完成させることが入口になります。"],work:["依頼の目的と納品形式を確認し、素材を整理して構成を組みます。","カット、テロップ、音量、色を調整し、修正指示を反映して書き出します。"],possibilities:["細かな違和感に気づく","同じ場面を繰り返し確認できる","視聴者に伝わる順番を考えたい"],cautions:["素材・BGM・フォントの利用許諾と、出演者の肖像権を確認します。","高性能な機材や有料ソフトの購入を最初の条件にしません。"],tasks:["要件確認","素材整理","構成","カット編集","音・色・字幕調整","書き出しと修正"],skills:["編集ソフト","構成","音声調整","色の基礎","ファイル管理","権利確認"],learningSteps:["30〜60秒の素材をカットする","音量と字幕を整える","目的別に2案を書き出す","修正依頼を反映する"],qualifications:[],ai:[{label:"Canva",networkId:"ai:canva",use:"短尺素材と字幕案の補助"}],videos:[{label:"動画編集ロードマップ",networkId:"learning:video"}],learningTime:"短い作品でも、素材受領から修正・書き出しまでを一周した本数で考えます。",entrySkills:["カット","音量調整","書き出し設定"],learningLoad:"基礎から積む",sourceIds:["mhlw-jobtag-video"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"テレビ映像編集とWeb動画制作の共通工程を中心に独自要約。",editorReviewed:true,routeTags:["ものを作る","一人で集中","週3時間以上"],claims:[claim("video-work","動画制作には撮影素材の構成・加工・編集が含まれます。",["mhlw-jobtag-video"])]
  },
  {
    slug:"web-designer",name:"Webデザイナー",category:"creative",status:"published",
    conclusion:["見た目を整えるだけでなく、情報を理解しやすく、操作しやすいWeb画面を設計する仕事です。","デザインの基礎とHTML/CSSをつなぎ、実際に使える小さなページを作ることが入口になります。"],work:["目的、利用者、掲載情報を整理し、構成と画面案を作ります。","画像や文字組みを整え、実装担当と確認しながら端末ごとの表示を調整します。"],possibilities:["情報の優先順位を考えたい","文字や余白の細部を整えるのが好き","利用者の迷いを減らす工夫に関心がある"],cautions:["作品集では、担当範囲と制作意図を明確にします。","生成AIの画像や他サイトのデザインを、権利確認なしに流用しません。"],tasks:["要件整理","情報設計","ワイヤーフレーム","ビジュアル制作","レスポンシブ確認","実装連携"],skills:["レイアウト","色と文字","Figma等の制作ツール","HTML/CSS","アクセシビリティ","著作権"],learningSteps:["既存ページの情報構造を観察する","ワイヤーを作る","1ページをHTML/CSSで再現する","スマホとPCで使いやすさを確認する"],qualifications:[{label:"ウェブデザイン技能検定3級",networkId:"license:webdesign-3"}],ai:[{label:"Canva",networkId:"ai:canva",use:"素材案の作成補助"}],videos:[{label:"Office・資料作成ロードマップ",networkId:"learning:office"}],learningTime:"作品数より、目的・設計理由・担当範囲・検証結果を説明できる1件を最初の基準にします。",entrySkills:["情報の優先順位","余白と文字組み","HTML/CSS"],learningLoad:"基礎から積む",sourceIds:["mhlw-jobtag-webdesign"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"入職資格が必須でないことと、採用されやすさは別であると区別。",editorReviewed:true,routeTags:["ものを作る","見た目を整える","週3時間以上"],claims:[claim("webdesign-work","WebデザイナーはWebサイトの企画・デザイン等を行い、デザインの基礎知識と技術が求められます。",["mhlw-jobtag-webdesign"])]
  },
  {
    slug:"office-administration",name:"一般事務・営業事務",category:"office-accounting",status:"published",
    conclusion:["書類・データ・連絡を正確に扱い、組織や営業活動が滞らないよう支える仕事です。","表計算と文書作成だけでなく、締切、確認、相手への伝え方をセットで身につけます。"],work:["一般事務は文書、台帳、届出、電話・メールなど幅広い定型業務を扱います。","営業事務は見積・受発注・納品・顧客対応など、営業活動に近い情報を管理します。"],possibilities:["抜け漏れを減らす工夫が好き","複数の依頼の順番を整えられる","相手に合わせて確認事項を伝えたい"],cautions:["同じ職種名でも、担当範囲は企業や部署で大きく異なります。","自動化後も、例外処理と最終確認の責任が残ります。"],tasks:["文書作成","データ入力・集計","受発注管理","メール・電話対応","書類点検","期限管理"],skills:["Excel/スプレッドシート","文書作成","ビジネスメール","優先順位付け","ダブルチェック"],learningSteps:["表計算の基本関数を使う","見積・議事録など定型文書を作る","確認チェックリストを作る","自動化できる反復作業を見つける"],qualifications:[{label:"MOS",networkId:"license:mos"},{label:"ITパスポート",networkId:"license:it-passport"}],ai:[{label:"Microsoft Copilot",networkId:"ai:copilot",use:"文書・表計算の補助"},{label:"ChatGPT",networkId:"ai:chatgpt",use:"メール案の整理"}],videos:[{label:"Office・資料作成ロードマップ",networkId:"learning:office"}],learningTime:"ソフト操作の時間ではなく、依頼の受領から確認・提出まで正確に完了できる課題で考えます。",entrySkills:["表計算の基本","ビジネス文書","確認手順"],learningLoad:"小さく試す",sourceIds:["mhlw-jobtag-office"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"一般事務と営業事務の共通点・差分を明示。",editorReviewed:true,routeTags:["人を支える","正確に進める","週3時間未満"],claims:[claim("office-work","一般事務は文書・数量・社内書類の管理、営業事務は見積・受発注・顧客対応などを扱います。",["mhlw-jobtag-office"])]
  },
  {
    slug:"accounting",name:"経理",category:"office-accounting",status:"published",
    conclusion:["取引を正しい区分で記録し、会社のお金の状態を確認できる形にする仕事です。","簿記の考え方と会計ソフト・表計算をつなぎ、証憑から月次集計までの流れを学びます。"],work:["請求書や領収書を確認し、入出金と取引を帳簿へ記録します。","残高を照合し、月次・年次の締め作業や、経営に必要な資料作成を支えます。"],possibilities:["数字の不一致を最後まで確かめたい","決められた期限と手順を守れる","取引の背景を確認して分類するのが苦にならない"],cautions:["税務判断や決算責任の範囲は、企業規模と役割により異なります。","制度や税率などの重要情報は、必ず最新の公式情報と専門家の指示を確認します。"],tasks:["証憑確認","仕訳","入出金管理","残高照合","月次締め","資料作成"],skills:["簿記","会計ソフト","表計算","正確性","期限管理","証跡管理"],learningSteps:["取引を仕訳に直す","現金・預金の残高を照合する","試算表のつながりを読む","会計ソフトの入力と修正履歴を確認する"],qualifications:[{label:"日商簿記3級",networkId:"license:boki-3"}],ai:[{label:"Microsoft Copilot",networkId:"ai:copilot",use:"集計式や説明文の補助"}],videos:[{label:"会計資格ロードマップ",networkId:"learning:qualification"}],learningTime:"資格の学習時間だけでなく、証憑・仕訳・照合・締めの関係を説明できるかで考えます。",entrySkills:["基本仕訳","残高照合","表計算"],learningLoad:"基礎から積む",sourceIds:["mhlw-jobtag-office"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"税務助言ではなく、経理事務の仕事理解と学習入口に限定。",editorReviewed:true,routeTags:["数字を読む","正確に進める","週3時間以上"],claims:[claim("accounting-work","経理事務は入出金・帳簿・残高確認・決算資料作成を扱います。",["mhlw-jobtag-office"])]
  },
  {
    slug:"english-sales-support",name:"英語を使う営業・カスタマーサポート",category:"people-license",status:"published",
    conclusion:["英語力だけでなく、相手の目的や困りごとを確認し、商品・手順・解決策を正確に伝える仕事です。","職種を一括りにせず、営業かサポートか、会話・メール・資料のどれを使うかを先に絞ります。"],work:["営業では顧客の課題を聞き、提案や調整、継続的な関係づくりを行います。","サポートでは問い合わせを整理し、手順案内、記録、必要に応じた引き継ぎを行います。"],possibilities:["分からない点を質問で確かめられる","文化や前提の違いを急いで決めつけない","相手が理解できたか確認しながら伝えたい"],cautions:["必要な英語レベルは、業界・商材・相手・業務範囲で大きく変わります。","スコアだけで採用可能性や実務対応力を保証しません。"],tasks:["要望の聞き取り","提案・案内","英語メール","問い合わせ記録","社内連携","フォローアップ"],skills:["業務英語","傾聴","説明","商品理解","記録","異文化コミュニケーション"],learningSteps:["希望する場面を営業かサポートに絞る","頻出の説明と質問を日英で作る","模擬メールと会話を練習する","誤解が起きた例を修正する"],qualifications:[{label:"TOEIC L&R",networkId:"license:toeic-lr"}],ai:[{label:"DeepL",networkId:"ai:deepl",use:"翻訳案の比較"},{label:"ChatGPT",networkId:"ai:chatgpt",use:"会話練習とメール案"}],videos:[{label:"英語ロードマップ",networkId:"learning:english"}],learningTime:"試験対策だけでなく、想定する顧客場面を英語で説明・確認・記録できるまでを区切りにします。",entrySkills:["質問で確認する英語","業務メール","商品説明"],learningLoad:"継続的に積む",sourceIds:["mhlw-jobtag-sales","mhlw-jobtag-support"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"英語使用職を一括評価せず、営業とサポートの共通業務を整理。",editorReviewed:true,routeTags:["人と話す","人を支える","週3時間以上"],claims:[claim("english-support","営業は顧客課題の把握と提案、サポートは問い合わせ対応と記録が中心で、ITサポートでは英語を使う機会があります。",["mhlw-jobtag-sales","mhlw-jobtag-support"])]
  },
  {
    slug:"registered-salesperson",name:"登録販売者",category:"people-license",status:"published",
    conclusion:["ドラッグストア等で、第2類・第3類の一般用医薬品の販売と情報提供を担う資格職です。","試験合格だけで終わらず、医薬品の安全な案内、店舗業務、継続的な制度確認が仕事の土台です。"],work:["購入者の状況を聞き、扱える範囲の一般用医薬品について説明します。","品出し、在庫・期限管理、発注、売場づくり、記録など店舗運営にも関わります。"],possibilities:["健康情報を正確に学び続けたい","相手の話を聞き、必要なら受診や薬剤師相談へつなげたい","接客と在庫管理の両方に取り組める"],cautions:["第1類医薬品は登録販売者だけでは販売できません。","試験・研修・店舗管理者要件などは都道府県と勤務先の最新案内を確認します。"],tasks:["購入者への確認","医薬品の情報提供","品出し","在庫・期限管理","発注","記録"],skills:["一般用医薬品の知識","説明と傾聴","法令順守","在庫管理","必要時の引き継ぎ"],learningSteps:["公式の試験範囲と自治体日程を確認する","人体と医薬品の基礎を学ぶ","過去問で弱点を確認する","販売時の確認・引き継ぎ場面を練習する"],qualifications:[{label:"登録販売者",networkId:"license:touroku-hanbai"}],ai:[{label:"ChatGPT",networkId:"ai:chatgpt",use:"学習用の問い作り（医療判断には使わない）"}],videos:[{label:"資格・検定ロードマップ",networkId:"learning:qualification"}],learningTime:"受験日から逆算しつつ、合格後の販売ルールと現場研修までを分けて計画します。",entrySkills:["公式試験案内の確認","医薬品分類","相談先への引き継ぎ"],learningLoad:"基礎から積む",sourceIds:["mhlw-jobtag-registered-sales","mhlw-medicine-sales"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"制度変更の影響が大きいため、公開前と定期監査で厚労省・自治体情報を再確認。",editorReviewed:true,routeTags:["人と話す","資格で証明","週3時間以上"],claims:[claim("registered-scope","登録販売者は第2類・第3類一般用医薬品を販売できますが、第1類は薬剤師が扱います。",["mhlw-jobtag-registered-sales","mhlw-medicine-sales"],true)]
  },
  {
    slug:"certified-care-worker",name:"介護福祉士",category:"people-license",status:"published",
    conclusion:["生活に支援が必要な人の尊厳と安全を守り、日常生活を支える国家資格職です。","身体介護の技術だけでなく、観察、記録、多職種連携、本人の意思を尊重する姿勢が欠かせません。"],work:["食事、入浴、排泄、移動などを、本人の状態と希望に合わせて支援します。","変化を観察・記録し、家族や看護師、相談員などと情報を共有します。"],possibilities:["相手のペースを尊重して関われる","小さな変化を観察して共有できる","チームで支援方法を調整したい"],cautions:["身体的・心理的な負担や勤務形態を、職場見学や公式情報で具体的に確認します。","国家試験の受験資格には複数ルートがあり、実務経験だけで自動的に受験できるとは限りません。"],tasks:["生活支援","身体介護","状態観察","記録","家族対応","多職種連携"],skills:["介護技術","観察","対人援助","記録","感染・事故予防","チーム連携"],learningSteps:["資格取得ルートを公式図で確認する","介護の基礎と倫理を学ぶ","実習・現場で安全な介助を身につける","記録と連携を練習する"],qualifications:[{label:"介護福祉士",networkId:"license:kaigo-fukushi"}],ai:[{label:"ChatGPT",networkId:"ai:chatgpt",use:"学習内容の整理（個人・医療情報は入力しない）"}],videos:[{label:"資格・検定ロードマップ",networkId:"learning:qualification"}],learningTime:"取得ルートにより必要な学校・実務・研修が異なるため、公式のルート図から個別に計画します。",entrySkills:["介護の倫理","安全な介助の基礎","観察記録"],learningLoad:"継続的に積む",sourceIds:["mhlw-jobtag-care","sssc-care-worker"],checkedAt,author:"manapick career編集部",editor:"manapick編集責任者",editorNote:"資格要件と仕事理解を分け、試験センターの最新ルート確認を必須化。",editorReviewed:true,routeTags:["人を支える","資格で証明","週3時間以上"],claims:[claim("care-work","施設介護では生活支援、身体介護、観察・記録、多職種連携を行います。",["mhlw-jobtag-care"]),claim("care-route","介護福祉士国家試験の受験資格には養成施設、実務経験＋実務者研修、福祉系高校等のルートがあります。",["sssc-care-worker"],true)]
  }
];

export const publishedJobs = jobs.filter((job) => job.status === "published");
export const categories = [
  {key:"it-ai",label:"IT・AI",description:"仕組みを作る・変える仕事"},
  {key:"data",label:"データ",description:"数字を整理し判断につなげる仕事"},
  {key:"marketing",label:"マーケ",description:"情報を届け、反応から改善する仕事"},
  {key:"creative",label:"クリエイティブ",description:"目的に合う表現を作る仕事"},
  {key:"office-accounting",label:"事務・会計",description:"組織の情報とお金を支える仕事"},
  {key:"people-license",label:"対人・資格",description:"人に向き合い、資格も活かす仕事"},
] as const;
