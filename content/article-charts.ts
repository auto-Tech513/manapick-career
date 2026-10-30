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
  "architect-vs-construction-manager": {
    "title": "技術検定・第一次検定を受検できる年齢",
    "note": "第一次検定は、学歴や実務経験を問わず受検できます。",
    "bars": [
      {
        "display": "19歳以上",
        "label": "1級建築施工管理",
        "value": 19
      },
      {
        "display": "17歳以上",
        "label": "2級建築施工管理",
        "value": 17
      }
    ]
  },
  "childcare-leave-rate-latest": {
    "title": "育児休業取得率（令和7年度雇用均等基本調査）",
    "note": "取得率は、対象期間に出産があった人のうち、調査時点までに育児休業を開始した人の割合です。休業期間の長さは含みません。",
    "bars": [
      {
        "label": "女性（令和7年度）",
        "value": 88.3,
        "display": "88.3％"
      },
      {
        "label": "女性（令和6年度）",
        "value": 86.6,
        "display": "86.6％"
      },
      {
        "label": "男性（令和7年度）",
        "value": 50.9,
        "display": "50.9％"
      },
      {
        "label": "男性（令和6年度）",
        "value": 40.5,
        "display": "40.5％"
      }
    ]
  },
  "customs-broker-vs-trade-practitioner": {
    "title": "通関士試験で科目の一部免除となる従事期間",
    "note": "通関業者の通関業務や、官庁における関税その他通関に関する事務に従事した期間が対象です",
    "bars": [
      {
        "display": "15年以上",
        "label": "15年以上になる者",
        "value": 15
      },
      {
        "display": "5年以上",
        "label": "5年以上になる者",
        "value": 5
      }
    ]
  },
  "disability-employment-latest": {
    "title": "民間企業の障害者実雇用率と法定雇用率（令和7年6月1日現在）",
    "note": "法定雇用率を達成した企業の割合は46.0％で、半数を下回ります。",
    "bars": [
      {
        "label": "法定雇用率",
        "value": 2.5,
        "display": "2.5％"
      },
      {
        "label": "実雇用率",
        "value": 2.41,
        "display": "2.41％"
      }
    ]
  },
  "doctor-vs-dentist": {
    "title": "診療に従事するための臨床研修の期間",
    "note": "どちらも国家試験に合格し、免許を受けた後に受ける臨床研修です。",
    "bars": [
      {
        "display": "2年以上",
        "label": "医師",
        "value": 2
      },
      {
        "display": "1年以上",
        "label": "歯科医師",
        "value": 1
      }
    ]
  },
  "dx-producer-vs-it-consultant": {
    "title": "入職前の実務経験が「特に必要ない」と答えた割合",
    "note": "就業者への調査（job tag）で、入職前の実務経験が「特に必要ない」という回答の割合です。",
    "bars": [
      {
        "display": "33.3%",
        "label": "DXプロデューサー",
        "value": 33.3
      },
      {
        "display": "31.8%",
        "label": "ITコンサルタント",
        "value": 31.8
      }
    ]
  },
  "elderly-employment-latest": {
    "title": "65歳までの雇用確保措置の内訳（実施済み企業）",
    "note": "65歳までの雇用確保措置を実施済みの企業は99.9％です。70歳までの就業確保措置の実施済みは34.8％にとどまります。",
    "bars": [
      {
        "label": "継続雇用制度の導入",
        "value": 65.1,
        "display": "65.1％"
      },
      {
        "label": "定年の引き上げ",
        "value": 31,
        "display": "31.0％"
      },
      {
        "label": "定年制の廃止",
        "value": 3.9,
        "display": "3.9％"
      }
    ]
  },
  "electrician-vs-chief-electricity-engineer": {
    "title": "電気主任技術者が監督できる電圧の上限",
    "note": "第一種は事業用電気工作物の全般を監督できます。第三種では、出力5千キロワット以上の発電所又は蓄電所が除かれます。",
    "bars": [
      {
        "display": "17万ボルト未満",
        "label": "第二種電気主任技術者",
        "value": 17
      },
      {
        "display": "5万ボルト未満",
        "label": "第三種電気主任技術者",
        "value": 5
      }
    ]
  },
  "employment-trends-latest": {
    "title": "転職入職者の賃金変動（前職との比較・2025年）",
    "note": "残りは「変わらない」です。入職率は14.7％、離職率は13.7％でした。",
    "bars": [
      {
        "label": "増加",
        "value": 40.8,
        "display": "40.8％"
      },
      {
        "label": "減少",
        "value": 31,
        "display": "31.0％"
      }
    ]
  },
  "first-class-vs-second-class-electrician": {
    "title": "電気工事士試験の受験手数料",
    "bars": [
      {
        "label": "第一種",
        "value": 14400,
        "display": "14,400円"
      },
      {
        "label": "第一種（電子申請等）",
        "value": 13000,
        "display": "13,000円"
      },
      {
        "label": "第二種",
        "value": 12500,
        "display": "12,500円"
      },
      {
        "label": "第二種（電子申請等）",
        "value": 11100,
        "display": "11,100円"
      }
    ]
  },
  "foreign-workers-latest": {
    "title": "国籍別の外国人労働者数（令和7年10月末時点）",
    "note": "割合では、ベトナムが全体の23.6%、中国が16.8%、フィリピンが10.1%です。",
    "bars": [
      {
        "label": "ベトナム",
        "value": 605906,
        "display": "605,906人"
      },
      {
        "label": "中国",
        "value": 431949,
        "display": "431,949人"
      },
      {
        "label": "フィリピン",
        "value": 260869,
        "display": "260,869人"
      }
    ]
  },
  "gender-whitepaper-latest": {
    "title": "「何歳になっても、能力を伸ばし続けることができる」に「そう思う」と答えた割合",
    "note": "「社会の変化に対応するために、学び続けることが必要だ」への肯定は、女性44.7％、男性40.3％でした。",
    "bars": [
      {
        "label": "女性",
        "value": 47.5,
        "display": "47.5％"
      },
      {
        "label": "男性",
        "value": 37.9,
        "display": "37.9％"
      }
    ]
  },
  "graduate-recruiting-process-2026": {
    "title": "採用プロセスの実施状況（企業調査）",
    "note": "利用率は優劣を示すものではなく、複数の接点を併用する企業もあります。",
    "bars": [
      {
        "label": "Web説明会",
        "value": 66.4,
        "display": "66.4%"
      },
      {
        "label": "対面説明会",
        "value": 61.2,
        "display": "61.2%"
      }
    ]
  },
  "home-visit-nurse-vs-home-helper": {
    "title": "看護師の主なタスクの実施率（job tag）",
    "note": "厚生労働省job tagのタスク一覧に載る看護師の実施率です。",
    "bars": [
      {
        "display": "96.2％",
        "label": "健康状態や症状のチェック",
        "value": 96.2
      },
      {
        "display": "96.2％",
        "label": "体温・脈拍・血圧の計測",
        "value": 96.2
      },
      {
        "display": "94.2％",
        "label": "注射・点滴などの処置",
        "value": 94.2
      }
    ]
  },
  "household-spending-latest": {
    "title": "消費支出の実質増減率（前年同月比・二人以上の世帯）",
    "note": "8月は3.1％減と、減少が続いています。",
    "bars": [
      {
        "display": "0.4％減",
        "label": "5月",
        "value": 0.4
      },
      {
        "display": "3.3％減",
        "label": "6月",
        "value": 3.3
      },
      {
        "display": "3.6％減",
        "label": "7月",
        "value": 3.6
      },
      {
        "display": "3.1％減",
        "label": "8月",
        "value": 3.1
      }
    ]
  },
  "income-tax-threshold-2026": {
    "title": "合計所得金額で変わる基礎控除（令和8年分）",
    "note": "給与所得控除の最低保障額74万円と合わせた課税最低限は178万円です。",
    "bars": [
      {
        "display": "104万円",
        "label": "合計所得金額132万円以下",
        "value": 104
      },
      {
        "display": "67万円",
        "label": "489万円超655万円以下",
        "value": 67
      },
      {
        "display": "62万円",
        "label": "655万円超2,350万円以下",
        "value": 62
      }
    ]
  },
  "industrial-production-latest": {
    "title": "業種別の生産（前月比）",
    "note": "生産指数全体は前月比1.7％の低下で、全15業種のうち12業種が低下しています。",
    "bars": [
      {
        "display": "13.3％減",
        "label": "石油・石炭製品工業",
        "value": 13.3
      },
      {
        "display": "6.8％減",
        "label": "自動車工業",
        "value": 6.8
      },
      {
        "display": "6.1％増",
        "label": "生産用機械工業",
        "value": 6.1
      },
      {
        "display": "6.0％減",
        "label": "汎用・業務用機械工業",
        "value": 6
      },
      {
        "display": "2.9％増",
        "label": "自動車を除く輸送機械工業",
        "value": 2.9
      }
    ]
  },
  "ipa-dx-trends-2026": {
    "title": "AIの利用用途（企業回答・DX動向2026）",
    "note": "割合は回答企業の利用状況で、作業が無人化された割合ではありません。",
    "bars": [
      {
        "label": "文書・音声の要約・翻訳・校正",
        "value": 82.5,
        "display": "82.5%"
      },
      {
        "label": "文書・レポートの作成",
        "value": 80.5,
        "display": "80.5%"
      },
      {
        "label": "情報検索・収集・分析・レポーティング",
        "value": 77,
        "display": "77.0%"
      },
      {
        "label": "自社製品・サービスの高度化",
        "value": 10.9,
        "display": "10.9%"
      },
      {
        "label": "生産・物流・サービス提供の計画支援",
        "value": 6,
        "display": "6.0%"
      }
    ]
  },
  "job-openings-august-2026": {
    "title": "都道府県別の有効求人倍率（2026年8月・就業地別）",
    "note": "全国の有効求人倍率（季節調整値）は1.18倍で、正社員有効求人倍率は1.00倍でした。",
    "bars": [
      {
        "label": "福井県",
        "value": 1.72,
        "display": "1.72倍"
      },
      {
        "label": "全国",
        "value": 1.18,
        "display": "1.18倍"
      },
      {
        "label": "大阪府",
        "value": 0.95,
        "display": "0.95倍"
      }
    ]
  },
  "labor-force-august-2026": {
    "title": "産業別の就業者数（2026年8月）",
    "note": "前年同月と比べ、医療，福祉は23万人増、製造業は21万人減でした。",
    "bars": [
      {
        "display": "1,035万人",
        "label": "卸売業，小売業",
        "value": 1035
      },
      {
        "display": "1,018万人",
        "label": "製造業",
        "value": 1018
      },
      {
        "display": "950万人",
        "label": "医療，福祉",
        "value": 950
      },
      {
        "display": "348万人",
        "label": "運輸業，郵便業",
        "value": 348
      }
    ]
  },
  "manufacturing-midcareer-hiring-2026": {
    "title": "人手不足への対応方法（ものづくり企業・複数回答）",
    "note": "人材不足と答えた3,092社への質問です。",
    "bars": [
      {
        "label": "中途採用の強化",
        "value": 69,
        "display": "69.0%"
      },
      {
        "label": "初任給や賃金等の処遇の引き上げ",
        "value": 50.5,
        "display": "50.5%"
      },
      {
        "label": "働きやすい職場環境の整備",
        "value": 36.2,
        "display": "36.2%"
      },
      {
        "label": "人材育成・能力開発の強化",
        "value": 19.5,
        "display": "19.5%"
      }
    ]
  },
  "minimum-wage-2026": {
    "title": "2026年度の地域別最低賃金（時間額）",
    "note": "発効日は都道府県ごとに2026年10月1日から12月2日まで異なります。",
    "bars": [
      {
        "label": "東京都",
        "value": 1280,
        "display": "1,280円"
      },
      {
        "label": "全国加重平均",
        "value": 1177,
        "display": "1,177円"
      },
      {
        "label": "宮崎県",
        "value": 1085,
        "display": "1,085円"
      },
      {
        "label": "昨年度の全国加重平均",
        "value": 1121,
        "display": "1,121円"
      }
    ]
  },
  "monthly-earnings-august-2026": {
    "title": "給与の内訳（事業所規模5人以上・2026年8月）",
    "note": "現金給与総額は、きまって支給する給与に特別に支払われた給与を加えた総額です。",
    "bars": [
      {
        "display": "311,364円",
        "label": "現金給与総額",
        "value": 311364
      },
      {
        "display": "298,358円",
        "label": "きまって支給する給与",
        "value": 298358
      },
      {
        "display": "277,861円",
        "label": "所定内給与",
        "value": 277861
      },
      {
        "display": "13,006円",
        "label": "特別に支払われた給与",
        "value": 13006
      }
    ]
  },
  "new-graduate-employment-latest": {
    "title": "学校種別の就職率（2026年3月卒業者・4月1日現在）",
    "note": "就職率は、卒業生全員ではなく就職希望者を分母にした割合です。",
    "bars": [
      {
        "label": "高等専門学校",
        "value": 99.2,
        "display": "99.2%"
      },
      {
        "label": "専修学校（専門課程）",
        "value": 98.6,
        "display": "98.6%"
      },
      {
        "label": "大学生",
        "value": 98,
        "display": "98.0%"
      },
      {
        "label": "高校生",
        "value": 97.9,
        "display": "97.9%"
      },
      {
        "label": "短期大学",
        "value": 97.4,
        "display": "97.4%"
      }
    ]
  },
  "nurse-exam-latest": {
    "title": "国家試験の合格率（2026年実施）",
    "note": "看護師の合格率は、新卒者と全体で5.8ポイントの差があります。",
    "bars": [
      {
        "label": "助産師",
        "value": 99.7,
        "display": "99.7%"
      },
      {
        "label": "看護師・新卒",
        "value": 94.1,
        "display": "94.1%"
      },
      {
        "label": "看護師・全体",
        "value": 88.3,
        "display": "88.3%"
      },
      {
        "label": "保健師",
        "value": 87.1,
        "display": "87.1%"
      }
    ]
  },
  "nurse-vs-assistant-nurse": {
    "title": "看護師の主なタスクの実施率（job tag）",
    "note": "job tagのタスク一覧に載る実施率です。",
    "bars": [
      {
        "label": "健康状態のチェック",
        "value": 96.2,
        "display": "96.2％"
      },
      {
        "label": "体温・脈拍・血圧の計測",
        "value": 96.2,
        "display": "96.2％"
      },
      {
        "label": "注射・点滴などの処置",
        "value": 94.2,
        "display": "94.2％"
      },
      {
        "label": "看護計画を立てる",
        "value": 80.8,
        "display": "80.8％"
      },
      {
        "label": "他の看護師を指導し教育する",
        "value": 76.9,
        "display": "76.9％"
      }
    ]
  },
  "office-clerk-vs-accounting-clerk": {
    "title": "就業者数の比較（job tag掲載の統計）",
    "note": "賃金（年収）は一般事務が541.4万円、経理事務が512.2万円です。いずれも厚生労働省編職業分類に対応する集計で、その職業のみの統計とは限りません。",
    "bars": [
      {
        "display": "約264万人",
        "label": "一般事務",
        "value": 264
      },
      {
        "display": "約152万人",
        "label": "経理事務",
        "value": 152
      }
    ]
  },
  "overwork-compensation-2025": {
    "title": "精神障害の支給決定（認定基準上の出来事別・令和7年度）",
    "note": "出来事は、心理的負荷の強度を評価するために類型化された項目です。",
    "bars": [
      {
        "label": "パワーハラスメント",
        "value": 222,
        "display": "222件"
      },
      {
        "label": "顧客等からの著しい迷惑行為",
        "value": 127,
        "display": "127件"
      },
      {
        "label": "セクシュアルハラスメント",
        "value": 127,
        "display": "127件"
      },
      {
        "label": "仕事内容・仕事量の大きな変化",
        "value": 113,
        "display": "113件"
      }
    ]
  },
  "paramedic-vs-firefighter": {
    "title": "消防に所属する救急救命士のタスク実施率（job tag）",
    "note": "job tagのタスク一覧に載る実施率です。",
    "bars": [
      {
        "label": "地域住民への応急手当・AEDの講習",
        "value": 100,
        "display": "100.0％"
      },
      {
        "label": "人命の救出活動",
        "value": 95.7,
        "display": "95.7％"
      },
      {
        "label": "消火活動",
        "value": 91.3,
        "display": "91.3％"
      }
    ]
  },
  "police-officer-vs-self-defense-force": {
    "title": "警察官と自衛官の階級の数",
    "note": "警察官は巡査から警視総監まで、自衛官は陸・海・空ごとに定められる別の体系です",
    "bars": [
      {
        "display": "16階級",
        "label": "自衛官（陸上自衛隊）",
        "value": 16
      },
      {
        "display": "9階級",
        "label": "警察官",
        "value": 9
      }
    ]
  },
  "private-salary-survey-2025": {
    "title": "雇用形態別の平均給与（令和7年分・1年を通じて勤務した給与所得者）",
    "note": "平均給与は、給料・手当と賞与の年間支給総額を人数で割った値です。",
    "bars": [
      {
        "label": "正社員（正職員）",
        "value": 559,
        "display": "559万円"
      },
      {
        "label": "全体",
        "value": 487,
        "display": "487万円"
      },
      {
        "label": "正社員（正職員）以外",
        "value": 210,
        "display": "210万円"
      }
    ]
  },
  "registered-dietitian-vs-dietitian": {
    "title": "管理栄養士国家試験の受験資格に必要な実務経験年数（栄養士免許後）",
    "note": "在学年数と実務経験を合わせて5年でそろう計算です。",
    "bars": [
      {
        "display": "3年以上",
        "label": "修業年限2年の施設",
        "value": 3
      },
      {
        "display": "2年以上",
        "label": "修業年限3年の施設",
        "value": 2
      },
      {
        "display": "1年以上",
        "label": "修業年限4年の施設",
        "value": 1
      }
    ]
  },
  "sales-admin-vs-office-clerk": {
    "title": "営業事務の主なタスクの実施率（job tag）",
    "note": "job tagのタスク一覧に載る実施率です。",
    "bars": [
      {
        "label": "顧客の問い合わせに対応する",
        "value": 89.3,
        "display": "89.3%"
      },
      {
        "label": "出荷の手配を行う",
        "value": 78.6,
        "display": "78.6%"
      },
      {
        "label": "来客対応を行う",
        "value": 78.6,
        "display": "78.6%"
      },
      {
        "label": "請求書を発行する",
        "value": 71.4,
        "display": "71.4%"
      },
      {
        "label": "納期を管理する",
        "value": 69.6,
        "display": "69.6%"
      }
    ]
  },
  "skills-development-survey-latest": {
    "title": "OFF-JTを受講した労働者の割合（令和7年度能力開発基本調査）",
    "note": "自己啓発を実施した労働者でも、正社員43.3％に対し正社員以外は15.9％と差があります。",
    "bars": [
      {
        "label": "正社員",
        "value": 44.5,
        "display": "44.5％"
      },
      {
        "label": "全体",
        "value": 37.3,
        "display": "37.3％"
      },
      {
        "label": "正社員以外",
        "value": 19.4,
        "display": "19.4％"
      }
    ]
  },
  "social-insurance-part-timers-2026": {
    "title": "社会保険の企業規模要件（被保険者数）の段階的な縮小",
    "note": "週の所定労働時間が20時間以上であることなど、ほかの加入要件は変わりません。",
    "bars": [
      {
        "label": "2026年10月から",
        "value": 51,
        "display": "51人以上"
      },
      {
        "label": "2027年10月から",
        "value": 36,
        "display": "36人以上"
      },
      {
        "label": "2029年10月から",
        "value": 21,
        "display": "21人以上"
      },
      {
        "label": "2032年10月から",
        "value": 11,
        "display": "11人以上"
      }
    ]
  },
  "spring-wage-settlement-2026": {
    "title": "主要企業の平均妥結額（春季賃上げ）",
    "note": "賃上げ率は5.18％で、前年の5.52％から0.34ポイント下がりました。集計対象は、資本金10億円以上かつ従業員1,000人以上の労働組合のある企業428社です。",
    "bars": [
      {
        "label": "前年",
        "value": 18629,
        "display": "18,629円"
      },
      {
        "label": "2026年",
        "value": 18167,
        "display": "18,167円"
      }
    ]
  },
  "surveyor-vs-assistant-surveyor": {
    "title": "測量士の学歴ルートに必要な実務経験",
    "note": "測量士補の学歴・養成施設ルートでは実務経験は求められません。",
    "bars": [
      {
        "display": "1年以上",
        "label": "大学卒",
        "value": 1
      },
      {
        "display": "3年以上",
        "label": "短大等卒",
        "value": 3
      },
      {
        "display": "2年以上",
        "label": "養成施設で1年以上修得",
        "value": 2
      }
    ]
  },
  "teacher-exam-latest": {
    "title": "校種別の競争率（令和7年度公立学校教員採用選考）",
    "note": "数字は2026年10月1日付の訂正後の資料に基づきます。",
    "bars": [
      {
        "label": "全体",
        "value": 2.9,
        "display": "2.9倍"
      },
      {
        "label": "小学校",
        "value": 2,
        "display": "2.0倍"
      },
      {
        "label": "特別支援学校",
        "value": 2,
        "display": "2.0倍"
      },
      {
        "label": "中学校",
        "value": 3.6,
        "display": "3.6倍"
      },
      {
        "label": "高等学校",
        "value": 3.8,
        "display": "3.8倍"
      },
      {
        "label": "養護教諭",
        "value": 8.2,
        "display": "8.2倍"
      },
      {
        "label": "栄養教諭",
        "value": 9.9,
        "display": "9.9倍"
      }
    ]
  },
  "wage-increase-survey-latest": {
    "title": "2026年の賃金改定の動向（企業の割合）",
    "note": "1人平均賃金の改定額は13,926円（前年13,601円）、改定率は4.4％です。対象は常用労働者100人以上の民営企業です。",
    "bars": [
      {
        "label": "引き上げた・引き上げる",
        "value": 92,
        "display": "92.0％"
      },
      {
        "label": "未定",
        "value": 5.1,
        "display": "5.1％"
      },
      {
        "label": "改定を実施しない",
        "value": 2.1,
        "display": "2.1％"
      },
      {
        "label": "引き下げた・引き下げる",
        "value": 0.4,
        "display": "0.4％"
      },
      {
        "label": "変わらなかった・変わらない",
        "value": 0.4,
        "display": "0.4％"
      }
    ]
  },
  "workplace-accidents-latest": {
    "title": "業種別の死亡者数（令和7年）",
    "note": "全体の死亡者数は700人で、過去最少を更新しました。",
    "bars": [
      {
        "display": "214人",
        "label": "建設業",
        "value": 214
      },
      {
        "display": "115人",
        "label": "製造業",
        "value": 115
      },
      {
        "display": "80人",
        "label": "陸上貨物運送事業",
        "value": 80
      },
      {
        "display": "61人",
        "label": "商業",
        "value": 61
      }
    ]
  },
  "workplace-learning-ojt-offjt-2025": {
    "title": "職場の学びの実施割合（雇用者）",
    "note": "対象は各年12月時点の雇用者です。",
    "bars": [
      {
        "display": "22.0%",
        "label": "Off-JT実施割合",
        "value": 22
      },
      {
        "display": "24.8%",
        "label": "OJT実施割合",
        "value": 24.8
      }
    ]
  }
};

export function articleChartForPathname(pathname: string): ArticleChart | undefined {
  const slug = pathname.split("/").filter(Boolean)[1];
  return slug ? articleCharts[slug] : undefined;
}
