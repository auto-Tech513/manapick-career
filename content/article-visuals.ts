// 記事の視覚情報（キーフィギュア／用語・項目の図解）。
// グラフ（article-charts.ts）と同じ原則: 表示値はすべて対象記事の本文に
// 逐語で存在するものだけを使い、scripts/check-article-charts.mjs で照合する。
// 新しい数字・言い換えた説明は入れない。

export type ArticleFigureItem = {
  label: string;
  display: string;
};

export type ArticleFigures = {
  title: string;
  note?: string;
  items: ArticleFigureItem[];
};

export const articleFigures: Record<string, ArticleFigures> = {
  "anma-hari-kyu-vs-judo-seifuku": {
    "title": "両資格に共通する仕組みの数字",
    "items": [
      {
        "label": "あはき法に置かれた免許の種類",
        "display": "3種類"
      },
      {
        "label": "学校・養成施設での修得（両資格共通）",
        "display": "3年以上"
      },
      {
        "label": "施術所を開設したときの届出（両法共通）",
        "display": "10日以内"
      }
    ]
  },
  "care-worker-exam-39": {
    "title": "第39回介護福祉士国家試験の日程と手数料",
    "items": [
      {
        "label": "試験日",
        "display": "2027年1月31日"
      },
      {
        "label": "受験手数料",
        "display": "20,510円"
      },
      {
        "label": "インターネット申込",
        "display": "2026年7月22日9時30分から9月2日23時59分"
      },
      {
        "label": "合格発表",
        "display": "2027年3月23日午後"
      }
    ]
  },
  "career-consultant-vs-industrial-counselor": {
    "title": "数字で見る取得と更新の仕組み",
    "items": [
      {
        "label": "キャリアコンサルタントの登録更新",
        "display": "5年ごと"
      },
      {
        "label": "更新講習（知識講習）",
        "display": "8時間以上"
      },
      {
        "label": "更新講習（技能講習）",
        "display": "30時間以上"
      },
      {
        "label": "産業カウンセラー養成講座の体験学習",
        "display": "104時間"
      }
    ]
  },
  "childcare-worker-vs-babysitter": {
    "title": "ベビーシッター事業（居宅訪問型保育）の届出制の数字",
    "items": [
      {
        "label": "事業開始からの届出の期限",
        "display": "1か月以内"
      },
      {
        "label": "無届け・虚偽の届出への過料",
        "display": "50万円以下"
      },
      {
        "label": "居宅訪問型で保育従事者が預かる乳幼児",
        "display": "1人"
      }
    ]
  },
  "clinical-lab-tech-vs-cytotechnologist": {
    "title": "資格取得と更新の数字",
    "note": "臨床検査技師は国家試験に合格すれば免許が続く仕組みで、細胞検査士は更新審査を受け続けます。",
    "items": [
      {
        "label": "臨床検査技師：指定学校・養成所での修習",
        "display": "3年以上"
      },
      {
        "label": "細胞検査士：前提となる細胞診の実務",
        "display": "1年以上"
      },
      {
        "label": "細胞検査士：資格の更新",
        "display": "5年ごと"
      },
      {
        "label": "細胞検査士：更新に必要な単位数",
        "display": "最低350単位"
      }
    ]
  },
  "construction-labor-unit-price-latest": {
    "title": "令和8年3月適用の公共工事設計労務単価",
    "note": "全国全職種の加重平均値は、初めて25,000円を超えました。",
    "items": [
      {
        "label": "全国全職種の加重平均値",
        "display": "25,834円"
      },
      {
        "label": "単純平均の前年度比",
        "display": "4.5％"
      },
      {
        "label": "引き上げの継続",
        "display": "14年連続"
      }
    ]
  },
  "cook-vs-registered-dietitian": {
    "title": "調理師の取得ルートと名称使用の罰金",
    "items": [
      {
        "label": "調理師：養成施設で修得する期間",
        "display": "1年以上"
      },
      {
        "label": "調理師：試験ルートで必要な調理業務の経験",
        "display": "2年以上"
      },
      {
        "label": "「調理師」の名称の無断使用への罰金",
        "display": "30万円以下"
      }
    ]
  },
  "digital-skills-across-occupations-2026": {
    "title": "求人分析の対象と期間",
    "items": [
      {
        "label": "分析対象の求人投稿",
        "display": "600万件超"
      },
      {
        "label": "対象地域",
        "display": "アジア太平洋6か国"
      },
      {
        "label": "分析期間",
        "display": "2019年から2024年"
      }
    ]
  },
  "employment-whitepaper-2026": {
    "title": "就職白書2026の調査規模",
    "note": "学生と企業の回答を基にした新卒採用の分析です。",
    "items": [
      {
        "label": "学生調査の回答",
        "display": "1,326人"
      },
      {
        "label": "企業調査の回答",
        "display": "1,196社"
      },
      {
        "label": "企業調査の対象",
        "display": "4,695社"
      }
    ]
  },
  "first-class-vs-second-class-architect": {
    "title": "一級建築士でなければ設計・工事監理ができない建築物（建築士法第3条・新築の場合）",
    "note": "増築・改築・大規模の修繕・大規模の模様替の場合も、その部分を新築とみなして同じ基準が適用されます。二級建築士が担当できないのは、この第3条の建築物だけです。",
    "items": [
      {
        "label": "学校・病院・劇場・百貨店等",
        "display": "延べ面積が500平方メートルを超えるもの"
      },
      {
        "label": "木造の建築物",
        "display": "高さが16メートルを超えるもの"
      },
      {
        "label": "鉄筋コンクリート造・鉄骨造等",
        "display": "延べ面積が300平方メートルを超えるもの"
      },
      {
        "label": "延べ面積・階数の基準",
        "display": "延べ面積が1,000平方メートルを超え、かつ、階数が2以上である建築物"
      }
    ]
  },
  "hazardous-materials-vs-fire-equipment": {
    "title": "保安監督・受験資格・届出に関わる期間",
    "items": [
      {
        "label": "危険物保安監督者に必要な実務経験",
        "display": "6月以上"
      },
      {
        "label": "甲種の受験資格になる乙種取得後の実務経験",
        "display": "2年以上"
      },
      {
        "label": "甲種消防設備士が工事着手前に届け出る期限",
        "display": "10日前"
      }
    ]
  },
  "job-change-hope-reality-gap-2025": {
    "title": "転職希望と実現の差",
    "note": "個人の転職成功率ではありません。",
    "items": [
      {
        "label": "前年の転職希望者が翌年実際に転職した割合",
        "display": "11.8%"
      },
      {
        "label": "10年間での低下",
        "display": "2.7ポイント"
      }
    ]
  },
  "job-openings-may-2026": {
    "title": "2026年5月の有効求人倍率",
    "items": [
      {
        "label": "有効求人倍率（季節調整値）",
        "display": "1.17倍"
      },
      {
        "label": "前月からの変化",
        "display": "0.01ポイント低下"
      }
    ]
  },
  "labor-force-may-2026": {
    "title": "2026年5月分の労働力調査の主な数値",
    "note": "完全失業率は季節調整値です。",
    "items": [
      {
        "label": "完全失業率（季節調整値）",
        "display": "2.5%"
      },
      {
        "label": "就業者数",
        "display": "6,890万人"
      },
      {
        "label": "完全失業者数",
        "display": "185万人"
      }
    ]
  },
  "land-surveyor-vs-surveyor": {
    "title": "土地家屋調査士の資格ルートに関わる数値",
    "note": "土地家屋調査士の資格は、試験合格か法務大臣の認定のいずれかで、学歴を土台に資格を得るルートはありません。",
    "items": [
      {
        "label": "土地家屋調査士試験の受験手数料（令和8年受験案内）",
        "display": "8,300円"
      },
      {
        "label": "法務大臣の認定ルートに必要な登記事務の従事期間",
        "display": "通算10年以上"
      }
    ]
  },
  "lawyer-vs-shiho-vs-gyosei": {
    "title": "資格ごとの条件の数字",
    "note": "認定を受けていない司法書士はこの代理ができず、140万円を超える事件や地方裁判所の事件は弁護士の領域です。",
    "items": [
      {
        "label": "認定司法書士が代理できる事件の金額",
        "display": "140万円以下"
      },
      {
        "label": "司法修習の期間",
        "display": "1年間"
      },
      {
        "label": "行政書士試験の実施",
        "display": "年1回"
      }
    ]
  },
  "librarian-vs-curator": {
    "title": "資格ルートの単位と年数",
    "note": "どちらも国家試験はなく、課程・科目の履修や講習で資格を得る",
    "items": [
      {
        "label": "司書講習の単位数",
        "display": "15単位"
      },
      {
        "label": "司書：補助職の経験から進む場合",
        "display": "3年以上"
      },
      {
        "label": "学芸員：学芸員補の経験から進む場合",
        "display": "3年以上"
      }
    ]
  },
  "long-working-hours-2025": {
    "title": "長時間労働の分布",
    "note": "各年12月時点の雇用者についての割合です。",
    "items": [
      {
        "label": "月当たり法定外労働時間が45時間以上の雇用者の割合",
        "display": "5.1%"
      },
      {
        "label": "長時間労働の基準（月当たり法定外労働時間）",
        "display": "45時間"
      }
    ]
  },
  "sharoushi-vs-gyoseishoshi": {
    "title": "資格取得の条件の数字",
    "note": "社会保険労務士のような実務経験の要件は、行政書士の登録には設けられていません。",
    "items": [
      {
        "label": "社会保険労務士に必要な実務経験",
        "display": "2年以上"
      },
      {
        "label": "社会保険労務士試験の実施",
        "display": "毎年1回"
      },
      {
        "label": "行政書士試験の実施",
        "display": "年1回"
      },
      {
        "label": "公務員経験による行政書士の資格要件",
        "display": "20年（高卒等は17年以上）"
      }
    ]
  },
  "shindanshi-vs-keiei-consultant": {
    "title": "中小企業診断士の試験・登録の数字",
    "note": "経営コンサルタントには法定の試験・登録制度はなく、資格がなくても就くことができます。",
    "items": [
      {
        "label": "第1次試験の科目数",
        "display": "全7科目"
      },
      {
        "label": "第1次試験の合格基準",
        "display": "総点の60%以上"
      },
      {
        "label": "登録に必要な実務要件",
        "display": "15日の実務要件"
      },
      {
        "label": "第1次試験合格の有効期間",
        "display": "2年の有効期間"
      }
    ]
  },
  "tax-accountant-vs-cpa": {
    "title": "試験と資格取得の条件",
    "note": "公認会計士は試験合格後も、実務補習を受けて修了考査に合格することが条件です。",
    "items": [
      {
        "label": "税理士試験の合格に必要な科目",
        "display": "合計5科目"
      },
      {
        "label": "公認会計士試験・短答式",
        "display": "4科目、年2回実施"
      },
      {
        "label": "公認会計士試験・論文式",
        "display": "5科目、年1回実施"
      },
      {
        "label": "公認会計士の業務補助等の期間",
        "display": "3年以上"
      }
    ]
  },
  "training-benefit-before-application": {
    "title": "教育訓練給付の給付率と上限",
    "note": "給付率は種類で異なります。数字は制度改定で変わるため、申込み直前に公式ページで再確認します。",
    "items": [
      {
        "label": "一般教育訓練",
        "display": "20%（上限10万円）"
      },
      {
        "label": "専門実践教育訓練",
        "display": "50%（年間上限40万円）"
      },
      {
        "label": "専門実践教育訓練の支給時期",
        "display": "受講中6か月ごと"
      }
    ]
  }
};

export type ArticleItemRow = {
  term: string;
  text?: string;
};

export type ArticleItems = {
  title: string;
  items: ArticleItemRow[];
};

export const articleItems: Record<string, ArticleItems> = {
  "ai-explanation-at-work-2026": {
    "title": "説明に含めること",
    "items": [
      {
        "term": "説明は目的から始める"
      },
      {
        "term": "人の確認範囲を示す"
      },
      {
        "term": "訂正経路まで用意する"
      }
    ]
  },
  "ai-explanation-survey-2000-2026": {
    "title": "AI利用を説明するときの項目",
    "items": [
      {
        "term": "利用目的"
      },
      {
        "term": "入力データ"
      },
      {
        "term": "出力の使い方"
      },
      {
        "term": "人による確認"
      },
      {
        "term": "限界"
      },
      {
        "term": "問い合わせ先"
      }
    ]
  },
  "care-manager-vs-home-helper-vs-facility-staff": {
    "title": "仕事の中心の違い",
    "items": [
      {
        "term": "ケアマネジャー",
        "text": "ケアプランの作成と事業者との連絡調整が中心"
      },
      {
        "term": "訪問介護員",
        "text": "居宅を訪問して身体介護と家事支援を行う"
      },
      {
        "term": "施設介護員",
        "text": "施設で入所・通所する利用者の世話と自立支援を行う"
      }
    ]
  },
  "certified-care-worker-vs-social-worker": {
    "title": "介護福祉士試験の受験資格ルート",
    "items": [
      {
        "term": "養成施設等で2年以上",
        "text": "介護福祉士として必要な知識・技能を修得するルート"
      },
      {
        "term": "大学の社会福祉科目＋養成施設1年",
        "text": "大学で社会福祉に関する科目を修めて卒業した者が養成施設で1年以上修得するルート"
      },
      {
        "term": "実務3年以上＋6月以上の修得",
        "text": "3年以上介護等の業務に従事した者が、指定した学校・養成施設で6月以上修得するルート"
      },
      {
        "term": "福祉系高校で3年以上",
        "text": "指定を受けた高等学校・中等教育学校で3年以上修得する福祉系高校のルート"
      }
    ]
  },
  "certified-psychologist-vs-clinical-psychologist": {
    "title": "公認心理師が行う法定の行為",
    "items": [
      {
        "term": "心理状態を観察し、その結果を分析すること"
      },
      {
        "term": "その心理に関する相談に応じ、助言、指導その他の援助を行うこと"
      },
      {
        "term": "関係者に対し、その相談に応じ、助言、指導その他の援助を行うこと"
      },
      {
        "term": "心の健康に関する知識の普及を図るための教育及び情報の提供を行うこと"
      }
    ]
  },
  "childcare-flexible-work-2026": {
    "title": "柔軟な働き方を実現するための措置（5つの選択肢）",
    "items": [
      {
        "term": "始業時刻の変更"
      },
      {
        "term": "テレワーク等（月10日以上）"
      },
      {
        "term": "保育施設の設置運営等"
      },
      {
        "term": "養育両立支援休暇（年10日以上）"
      },
      {
        "term": "短時間勤務制度"
      }
    ]
  },
  "choose-one-learning-video": {
    "title": "視聴メモに記録する三つ",
    "items": [
      {
        "term": "なぜこの順番か"
      },
      {
        "term": "どの条件なら別の方法か"
      },
      {
        "term": "何を確認して次へ進んだか"
      }
    ]
  },
  "clinical-engineer-vs-clinical-lab-tech": {
    "title": "臨床工学技士試験の受験資格ルート",
    "items": [
      {
        "term": "養成所3年のルート"
      },
      {
        "term": "大学等で指定科目を修めた学びと養成所1〜2年を組み合わせるルート"
      },
      {
        "term": "大学で指定科目を修めて卒業するルート"
      }
    ]
  },
  "compare-three-careers-45-minutes": {
    "title": "比較シートの六項目",
    "items": [
      {
        "term": "仕事内容"
      },
      {
        "term": "成果物"
      },
      {
        "term": "関わる相手"
      },
      {
        "term": "入口の作業"
      },
      {
        "term": "注意点"
      },
      {
        "term": "公式出典"
      }
    ]
  },
  "compare-training-total-cost": {
    "title": "講座を比べる七項目",
    "items": [
      {
        "term": "受講料"
      },
      {
        "term": "教材・ソフト・試験等の追加費用"
      },
      {
        "term": "給付・補助の条件"
      },
      {
        "term": "教材と質問の利用期限"
      },
      {
        "term": "指導や添削の範囲"
      },
      {
        "term": "作れる成果物"
      },
      {
        "term": "解約・返金"
      }
    ]
  },
  "data-analyst-first-90-minutes": {
    "title": "列の確認項目",
    "items": [
      {
        "term": "列名"
      },
      {
        "term": "データ型"
      },
      {
        "term": "欠損"
      },
      {
        "term": "重複"
      },
      {
        "term": "範囲外の値"
      }
    ]
  },
  "dental-hygienist-vs-dental-assistant": {
    "title": "歯科衛生士の法定業務（歯科衛生士法第2条）",
    "items": [
      {
        "term": "歯科予防処置",
        "text": "予防処置＝歯石等の除去と薬物塗布、歯科医師の指導の下に行う"
      },
      {
        "term": "歯科診療の補助",
        "text": "歯科診療の補助と歯科保健指導も法定の業務だが、診療補助には第13条の2の制限がある"
      },
      {
        "term": "歯科保健指導",
        "text": "歯科衛生士の名称を用いて歯科保健指導を業とできる"
      }
    ]
  },
  "dental-technician-vs-dental-hygienist": {
    "title": "歯科技工士に認められていない行為（歯科技工士法第20条）",
    "items": [
      {
        "term": "印象採得",
        "text": "歯科技工士には禁止され、歯科医師が行う"
      },
      {
        "term": "咬合採得",
        "text": "歯科技工士には禁止され、歯科医師が行う"
      },
      {
        "term": "試適",
        "text": "歯科技工士には禁止され、歯科医師が行う"
      },
      {
        "term": "装着",
        "text": "歯科技工士には禁止され、歯科医師が行う"
      }
    ]
  },
  "dentist-vs-dental-hygienist": {
    "title": "歯科衛生士の法定業務（歯科衛生士法第2条）",
    "items": [
      {
        "term": "歯科予防処置",
        "text": "歯科医師の指導の下に行う歯科予防処置"
      },
      {
        "term": "歯科診療の補助",
        "text": "歯科診療の補助"
      },
      {
        "term": "歯科保健指導",
        "text": "歯科衛生士の名称を用いて行う歯科保健指導"
      }
    ]
  },
  "digital-skills-standard-v2-2026": {
    "title": "デジタルスキル標準 ver.2.0の更新点",
    "items": [
      {
        "term": "AI活用を事業変革と結び付けて整理"
      },
      {
        "term": "データマネジメントの役割を強化"
      },
      {
        "term": "職種を越えた連携を学習計画へ含める"
      }
    ]
  },
  "digital-talent-ai-era-2026": {
    "title": "AI時代のデジタル人材に求められること",
    "items": [
      {
        "term": "AI・データ・セキュリティを横断"
      },
      {
        "term": "目的設定と評価を重視"
      },
      {
        "term": "役割間の連携を成果物で確認"
      }
    ]
  },
  "dx-award-2026-lessons": {
    "title": "事例を分解する視点",
    "items": [
      {
        "term": "課題の定義"
      },
      {
        "term": "経営との接続"
      },
      {
        "term": "データ"
      },
      {
        "term": "現場定着"
      },
      {
        "term": "効果検証"
      }
    ]
  },
  "dx-indicator-2026-revision": {
    "title": "データ・人材・セキュリティで確認すること",
    "items": [
      {
        "term": "データ",
        "text": "定義、品質、アクセス権、更新責任"
      },
      {
        "term": "人材",
        "text": "役割、学習機会、部門間連携"
      },
      {
        "term": "サイバーセキュリティ",
        "text": "予防、検知、復旧、説明の手順"
      }
    ]
  },
  "dx-self-assessment-1164-2026": {
    "title": "改訂されたDX推進指標の要素",
    "items": [
      {
        "term": "データ活用・連携"
      },
      {
        "term": "デジタル人材の育成・確保"
      },
      {
        "term": "サイバーセキュリティ"
      }
    ]
  },
  "employer-examples-how-to-read": {
    "title": "企業例の読み方（確認点）",
    "items": [
      {
        "term": "出典は各社の公式ページ",
        "text": "出典ページと確認日を併記しているので、読んだ人も同じページを開いて確かめられます"
      },
      {
        "term": "確認日を併記"
      },
      {
        "term": "1件は全体の代表ではない",
        "text": "1件の例はその職業全体の代表ではありません"
      },
      {
        "term": "公的情報と並べて読む",
        "text": "公的情報で全体像をつかみ、企業例で具体の業務を確かめる"
      },
      {
        "term": "作業の相性を見る",
        "text": "給与や知名度より先に、日々の作業との相性を見るための材料です"
      },
      {
        "term": "募集要項で最終判断",
        "text": "応募するかどうかは募集要項を読んでから決めます"
      }
    ]
  },
  "first-portfolio-without-private-data": {
    "title": "説明文の六項目",
    "items": [
      {
        "term": "目的"
      },
      {
        "term": "想定利用者"
      },
      {
        "term": "入力素材"
      },
      {
        "term": "行った作業"
      },
      {
        "term": "確認方法"
      },
      {
        "term": "残った課題"
      }
    ]
  },
  "future-of-work-whitepaper-2026": {
    "title": "行動を支える組織側の条件",
    "items": [
      {
        "term": "時間"
      },
      {
        "term": "上司"
      },
      {
        "term": "評価"
      },
      {
        "term": "異動"
      },
      {
        "term": "学習機会"
      }
    ]
  },
  "general-affairs-vs-office-clerk": {
    "title": "求人を選ぶときの確認の観点",
    "items": [
      {
        "term": "配属先",
        "text": "配属先が各部署なのか総務部門なのか"
      },
      {
        "term": "扱う対象",
        "text": "扱う対象が伝票やデータなどの定型処理なのか"
      },
      {
        "term": "会社全体に関わる事柄",
        "text": "設備・備品の管理、社内規定の策定、会議や行事の運営といった会社全体に関わる事柄なのか"
      }
    ]
  },
  "hoikushi-vs-yochien-kyoin": {
    "title": "資格の仕組みの違い",
    "items": [
      {
        "term": "保育士",
        "text": "児童福祉法に基づく登録制の資格"
      },
      {
        "term": "幼稚園教諭",
        "text": "教育職員免許法に基づく教員免許"
      },
      {
        "term": "保育教諭",
        "text": "幼稚園教諭免許と保育士登録の両方が必要"
      }
    ]
  },
  "human-investment-panel-2026": {
    "title": "人的投資を分ける要素",
    "items": [
      {
        "term": "参加可能性"
      },
      {
        "term": "学習内容"
      },
      {
        "term": "勤務時間内外"
      },
      {
        "term": "実践機会"
      },
      {
        "term": "上司の支援"
      },
      {
        "term": "評価への接続"
      }
    ]
  },
  "income-ranking-how-to-read": {
    "title": "年収ランキングの前提（確認点）",
    "items": [
      {
        "term": "土台は賃金構造基本統計調査"
      },
      {
        "term": "分類の平均から換算",
        "text": "対応する分類の平均賃金から年収を換算しています"
      },
      {
        "term": "平均は中央値とずれる",
        "text": "「真ん中の人の金額」を表す中央値とはずれます"
      },
      {
        "term": "税・社会保険料の控除前",
        "text": "税金や社会保険料を引く前の金額で、手取りとも違います"
      },
      {
        "term": "順位は良し悪しの判定ではない",
        "text": "順位だけで職業の良し悪しを決める材料にはなりません"
      },
      {
        "term": "求人の提示額は別に確認",
        "text": "求人票の提示額、雇用形態、勤務地、賞与や残業の扱いを個別に確かめます"
      }
    ]
  },
  "japan-labor-chartbook-june-2026": {
    "title": "チャートブックを読むときの確認点",
    "items": [
      {
        "term": "民間求人データと政府統計を区別"
      },
      {
        "term": "賃金と物価を同じ単位で確認"
      },
      {
        "term": "単月の転職タイミングを断定しない"
      }
    ]
  },
  "job-title-to-task-map": {
    "title": "作業表の四列",
    "items": [
      {
        "term": "入力",
        "text": "顧客の要望、数値、原稿、問い合わせなど"
      },
      {
        "term": "判断",
        "text": "優先順位、例外、安全、品質の確認"
      },
      {
        "term": "成果物",
        "text": "報告書、画面、記録、回答のように第三者が確認できる名詞"
      },
      {
        "term": "相手",
        "text": "顧客、上司、現場、利用者など、成果を受け取る人"
      }
    ]
  },
  "jobtag-occupation-check": {
    "title": "job tagの歩き方（確認点）",
    "items": [
      {
        "term": "厚生労働省が運営"
      },
      {
        "term": "556職業を収録"
      },
      {
        "term": "仕事内容→就くには→労働条件→関連資格",
        "text": "最初に仕事内容を読みます"
      },
      {
        "term": "労働条件は目安として読む",
        "text": "実際の勤務時間や休日は勤務先と雇用形態で変わる"
      },
      {
        "term": "決め手は仕事内容の一致",
        "text": "照合の決め手は名前ではなく仕事内容の記述です"
      },
      {
        "term": "絞り込みは作業の相性から",
        "text": "資格の有無や年収の数字より先に、作業との相性で順位をつける"
      }
    ]
  },
  "labor-data-before-career-decision-2026": {
    "title": "質問に対応する公的統計",
    "items": [
      {
        "term": "労働力調査",
        "text": "足元の雇用人数は労働力調査"
      },
      {
        "term": "一般職業紹介状況",
        "text": "求人と求職は一般職業紹介状況"
      },
      {
        "term": "毎月勤労統計",
        "text": "月次の賃金・時間は毎月勤労統計"
      },
      {
        "term": "賃金構造基本統計",
        "text": "条件別賃金は賃金構造基本統計"
      }
    ]
  },
  "labor-market-three-indicators-2026": {
    "title": "労働市場の三指標とその役割",
    "items": [
      {
        "term": "完全失業率",
        "text": "働く意思と求職行動を含む人口の状態"
      },
      {
        "term": "有効求人倍率",
        "text": "公共職業安定所の求人数と求職者数の関係"
      },
      {
        "term": "就業者数",
        "text": "仕事に就いている人の規模"
      }
    ]
  },
  "lawyer-vs-prosecutor-vs-judge": {
    "title": "法曹三者の役割の違い",
    "items": [
      {
        "term": "弁護士＝当事者の側に立つ代理人・弁護人",
        "text": "使命は基本的人権の擁護と社会正義の実現（弁護士法第1条）"
      },
      {
        "term": "検察官＝刑事事件を捜査・起訴し、公判で立証する側",
        "text": "公益の代表者として、刑事事件の捜査・公訴・裁判の執行の監督を担う（検察庁法第4条、第6条）"
      },
      {
        "term": "裁判官＝中立の立場で審理し、判断を下す側",
        "text": "判事は、判事補・検察官・弁護士等の職を通算10年以上経験した者の中から、最高裁判所の指名名簿に基づいて内閣が任命する（裁判所法第40条、第42条）"
      }
    ]
  },
  "monthly-earnings-may-2026": {
    "title": "月次の賃金ニュースを読む前の確認項目",
    "items": [
      {
        "term": "現金給与総額か所定内給与か"
      },
      {
        "term": "名目か実質か"
      },
      {
        "term": "どの事業所規模か"
      },
      {
        "term": "指数か実額か"
      },
      {
        "term": "速報か確報か"
      }
    ]
  },
  "nominal-real-wages-2026": {
    "title": "名目賃金と実質賃金の違い",
    "items": [
      {
        "term": "名目賃金",
        "text": "支払われた金額の動き"
      },
      {
        "term": "実質賃金",
        "text": "物価変動を考慮した購買力の動き"
      }
    ]
  },
  "nurse-vs-midwife-vs-public-nurse": {
    "title": "看護師・助産師・保健師の法定の業務",
    "items": [
      {
        "term": "看護師",
        "text": "療養上の世話又は診療の補助"
      },
      {
        "term": "助産師",
        "text": "助産又は妊婦、じよく婦若しくは新生児の保健指導"
      },
      {
        "term": "保健師",
        "text": "保健師の名称を用いて、保健指導に従事すること"
      }
    ]
  },
  "pharmacist-vs-registered-seller": {
    "title": "販売できる医薬品と調剤の違い",
    "items": [
      {
        "term": "要指導医薬品",
        "text": "販売できるのは薬剤師のみ"
      },
      {
        "term": "第1類医薬品",
        "text": "薬剤師のみが販売できる"
      },
      {
        "term": "第2類・第3類",
        "text": "薬剤師または登録販売者が販売できる"
      },
      {
        "term": "調剤",
        "text": "薬剤師だけが行える"
      }
    ]
  },
  "prosthetist-vs-physical-therapist": {
    "title": "義肢装具士の業務の工程",
    "items": [
      {
        "term": "採型",
        "text": "義肢及び装具の装着部位の採型"
      },
      {
        "term": "製作",
        "text": "義肢及び装具の製作"
      },
      {
        "term": "身体への適合",
        "text": "身体への適合"
      }
    ]
  },
  "pt-vs-ot-vs-st": {
    "title": "理学療法士・作業療法士・言語聴覚士の対象",
    "items": [
      {
        "term": "理学療法士",
        "text": "身体に障害のある者に対し、主としてその基本的動作能力の回復を図る"
      },
      {
        "term": "作業療法士",
        "text": "身体又は精神に障害のある者に対し、主としてその応用的動作能力又は社会的適応能力の回復を図る"
      },
      {
        "term": "言語聴覚士",
        "text": "音声機能、言語機能又は聴覚に障害のある者について、その機能の維持向上を図る"
      }
    ]
  },
  "qualification-official-route": {
    "title": "受験資格の確認点",
    "items": [
      {
        "term": "受験資格は複数ルートの場合がある"
      },
      {
        "term": "公式ルート図で照合",
        "text": "ルート図で自分の学歴と実務経験に合う入口があるかを確かめます"
      },
      {
        "term": "最終確認は公式要項",
        "text": "まとめ記事は入口の発見に使っても、最終確認は公式に戻ります"
      },
      {
        "term": "実務経験の数え方は要項で",
        "text": "自分の経験が対象に入るかも要項で確かめます"
      },
      {
        "term": "申込期間と試験日を先に確保",
        "text": "学習計画より先に日程の確保が必要です"
      },
      {
        "term": "合格率は個人の確率ではない",
        "text": "自分の合格可能性を直接示す数字ではありません"
      }
    ]
  },
  "radiologic-technologist-vs-clinical-lab-tech": {
    "title": "法定業務の担当領域",
    "items": [
      {
        "term": "診療放射線技師の中心業務",
        "text": "エックス線などの放射線を人体に照射して撮影すること"
      },
      {
        "term": "MRI・超音波",
        "text": "MRI・超音波など放射線を使わない画像診断装置の検査も、政令の範囲で業務に含まれる"
      },
      {
        "term": "検体検査",
        "text": "血液・尿・組織など体から得た材料を調べる"
      },
      {
        "term": "生理学的検査",
        "text": "心電図など生体の状態を測る検査で、範囲は厚生労働省令で定められる"
      }
    ]
  },
  "reskilling-support-2026": {
    "title": "制度ごとに確認する条件",
    "items": [
      {
        "term": "対象者"
      },
      {
        "term": "対象講座"
      },
      {
        "term": "申請時期"
      },
      {
        "term": "自己負担"
      },
      {
        "term": "修了条件"
      },
      {
        "term": "転職支援の範囲"
      }
    ]
  },
  "riyoshi-vs-biyoshi": {
    "title": "理容と美容の法律上の定義",
    "items": [
      {
        "term": "理容",
        "text": "頭髪の刈込、顔そり等の方法により、容姿を整えること"
      },
      {
        "term": "美容",
        "text": "パーマネントウエーブ、結髪、化粧等の方法により、容姿を美しくすること"
      },
      {
        "term": "顔そり",
        "text": "理容の定義に含まれる"
      },
      {
        "term": "パーマとカッティング",
        "text": "理容師・美容師とも制限なし"
      }
    ]
  },
  "seven-day-skill-gap-plan": {
    "title": "七日で確かめる進め方",
    "items": [
      {
        "term": "一日目",
        "text": "職業ページと一次情報で作業の目的を確認"
      },
      {
        "term": "二日目",
        "text": "基礎用語を五つだけ調べます"
      },
      {
        "term": "三日目と四日目",
        "text": "最小の成果物を作り"
      },
      {
        "term": "五日目",
        "text": "誤りや不足を見つけます"
      },
      {
        "term": "六日目",
        "text": "一度作り直し"
      },
      {
        "term": "七日目",
        "text": "目的、手順、判断理由、残課題を三分で説明できるか確認します"
      }
    ]
  },
  "shiho-shoshi-vs-land-surveyor": {
    "title": "司法書士の法定業務",
    "items": [
      {
        "term": "登記又は供託に関する手続について代理すること"
      },
      {
        "term": "法務局・地方法務局に提出する書類の作成"
      },
      {
        "term": "法務局長に対する登記・供託に関する審査請求手続の代理"
      },
      {
        "term": "裁判所・検察庁に提出する書類の作成"
      },
      {
        "term": "これらの事務に関する相談"
      }
    ]
  },
  "sme-whitepaper-latest": {
    "title": "白書が柱に挙げる「稼ぐ力」強化の取組",
    "items": [
      {
        "term": "価格転嫁"
      },
      {
        "term": "成長投資"
      },
      {
        "term": "事業承継・M&A"
      },
      {
        "term": "AI活用・デジタル化"
      }
    ]
  },
  "social-worker-vs-psychiatric-social-worker": {
    "title": "受験資格の骨格（両資格に共通する入口）",
    "items": [
      {
        "term": "指定科目を修めて卒業",
        "text": "大学で指定科目を修めて卒業した者"
      },
      {
        "term": "短期養成施設等で6月以上修得",
        "text": "大学で基礎科目を修めて卒業し短期養成施設等で6月以上修得した者"
      },
      {
        "term": "一般養成施設等で1年以上修得",
        "text": "大学を卒業し一般養成施設等で1年以上修得した者"
      },
      {
        "term": "短期大学で指定科目を修めて卒業",
        "text": "短期大学で指定科目を修めて卒業し指定施設で相談援助の業務に従事した者"
      }
    ]
  },
  "telework-2016-2024": {
    "title": "テレワークの確認点",
    "items": [
      {
        "term": "実施頻度"
      },
      {
        "term": "選択権"
      },
      {
        "term": "仕事との適合"
      },
      {
        "term": "連絡方法"
      },
      {
        "term": "評価"
      },
      {
        "term": "機器・費用"
      },
      {
        "term": "勤務時間の境界"
      }
    ]
  },
  "veterinarian-vs-animal-nurse": {
    "title": "愛玩動物看護師の3つの業務",
    "items": [
      {
        "term": "診療の補助",
        "text": "獣医師の指示の下に行われるもの"
      },
      {
        "term": "病気・けがの愛玩動物の看護",
        "text": "疾病にかかり又は負傷した愛玩動物の世話その他の愛玩動物の看護"
      },
      {
        "term": "飼い主への助言・支援",
        "text": "飼い主などへの愛護と適正な飼養に関する助言その他の支援"
      }
    ]
  },
  "wage-structure-2025": {
    "title": "賃金構造基本統計調査の表に並ぶ項目",
    "items": [
      {
        "term": "所定内給与額"
      },
      {
        "term": "年間賞与その他特別給与額"
      },
      {
        "term": "労働者数"
      },
      {
        "term": "平均年齢"
      },
      {
        "term": "勤続年数"
      }
    ]
  },
  "wages-by-employment-type-2025": {
    "title": "雇用形態別の平均差に重なる条件",
    "items": [
      {
        "term": "年齢"
      },
      {
        "term": "勤続年数"
      },
      {
        "term": "職種"
      },
      {
        "term": "企業規模"
      },
      {
        "term": "労働時間"
      }
    ]
  },
  "web-designer-first-accessible-screen": {
    "title": "375、768、1280pxで確認する項目",
    "items": [
      {
        "term": "横あふれ"
      },
      {
        "term": "不自然な一文字改行"
      },
      {
        "term": "タップ領域"
      },
      {
        "term": "固定要素との重なり"
      }
    ]
  },
  "web-designer-vs-graphic-vs-director": {
    "title": "作る対象と役割の違い",
    "items": [
      {
        "term": "Webデザイナー",
        "text": "Webサイトの画面デザインとレイアウトが中心、公開後の修正も担当"
      },
      {
        "term": "グラフィックデザイナー",
        "text": "広告・出版物・パッケージ・ロゴなど平面のビジュアルが中心"
      },
      {
        "term": "Webディレクター",
        "text": "制作全体を指揮し進行させる側"
      }
    ]
  },
  "web-marketer-first-measurement-plan": {
    "title": "計測表に並べる項目",
    "items": [
      {
        "term": "確認したい行動"
      },
      {
        "term": "指標"
      },
      {
        "term": "取得方法"
      },
      {
        "term": "集計単位"
      },
      {
        "term": "判断"
      },
      {
        "term": "限界"
      }
    ]
  },
  "working-hours-may-2026": {
    "title": "分けて確認する労働時間",
    "items": [
      {
        "term": "総実労働時間"
      },
      {
        "term": "所定内"
      },
      {
        "term": "所定外"
      }
    ]
  }
};

function slugFromPathname(pathname: string) {
  return pathname.split("/").filter(Boolean)[1] ?? "";
}

export function articleFiguresForPathname(pathname: string) {
  return articleFigures[slugFromPathname(pathname)];
}

export function articleItemsForPathname(pathname: string) {
  return articleItems[slugFromPathname(pathname)];
}
