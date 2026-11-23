import { loadDefaultJapaneseParser } from "budoux";

const parser = loadDefaultJapaneseParser();

// BudouX が語の途中で割ってしまう実測パターンへの補正。
// - 数字列と英字列は境界で再結合する（「202｜6年」「第3｜9回」「IPA D｜X動向」対策）
// - 保護対象の複合語が境界をまたぐ場合は再結合する（「完全失｜業率」など）
const PROTECTED_WORDS = ["完全失業率", "有効求人倍率", "求人分析", "はたらく", "一次情報", "ページ", "読める", "割増賃金", "1時間", "平均年収"];

const endsWithDigit = (value: string) => /[0-9０-９]$/.test(value);
const startsWithDigit = (value: string) => /^[0-9０-９]/.test(value);
const endsWithLatin = (value: string) => /[A-Za-z]$/.test(value);
const startsWithLatin = (value: string) => /^[A-Za-z]/.test(value);
// 行頭に来てはいけない文字（閉じ括弧・句読点・小書き仮名・長音）で始まる文節は前へつなぐ
const startsWithClosing = (value: string) => /^[）)」』】〕］\]、。，．,.・：:；;！？!?％%ーぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ〜～]/.test(value);
// 開き括弧で終わる文節は次へつなぐ
const endsWithOpening = (value: string) => /[（(「『【〔［\[]$/.test(value);

// 数字の桁区切り・小数点・％でも割らない（「28万9,｜536円」「31.｜2%」対策）
const endsWithNumberish = (value: string) => /[0-9０-９][,.，．]?$/.test(value);
const startsWithNumberish = (value: string) => /^[,.，．]?[0-9０-９%％]/.test(value) || /^[%％]/.test(value);
// 短い括弧書きの途中では割らない（「（令和｜5年3月卒）」対策）。長い括弧は通常どおり。
const openParenLength = (value: string) => {
  const open = Math.max(value.lastIndexOf("（"), value.lastIndexOf("("), value.lastIndexOf("「"), value.lastIndexOf("『"));
  if (open < 0) return -1;
  const tail = value.slice(open);
  return /[）)」』]/.test(tail) ? -1 : [...tail].length;
};

// 漢字・カタカナの連なりの長さ（末尾／先頭）。BudouX が熟語の途中（「空｜港」「男女共同｜参画」「法定｜外労働」）で
// 区切るのを防ぐため、短い連なり同士の区切りはつなぐ（独立監査 2026-11-18 H5・M1）
const KANJI_RUN = /[一-鿿々〆ヶ]+$/u;
const KANJI_HEAD = /^[一-鿿々〆ヶ]+/u;
const KATA_RUN = /[ァ-ヺー]+$/u;
const KATA_HEAD = /^[ァ-ヺー]+/u;
const runJoin = (previous: string, segment: string, tail: RegExp, head: RegExp, max: number) => {
  const a = previous.match(tail)?.[0];
  const b = segment.match(head)?.[0];
  return Boolean(a && b && [...a].length + [...b].length <= max);
};

export function joinSegments(segments: string[]): string[] {
  const joined: string[] = [];
  for (const segment of segments) {
    const previous = joined[joined.length - 1];
    if (previous) {
      const combined = previous + segment;
      const parenOpen = openParenLength(previous);
      const shouldJoin =
        (endsWithDigit(previous) && startsWithDigit(segment)) ||
        (endsWithNumberish(previous) && startsWithNumberish(segment)) ||
        (/[0-9０-９]か$/.test(previous) && segment.startsWith("月")) ||
        (/(令和|平成|昭和|西暦)$/.test(previous) && startsWithDigit(segment)) ||
        (parenOpen > 0 && parenOpen + [...segment].length <= 12) ||
        (endsWithLatin(previous) && startsWithLatin(segment)) ||
        startsWithClosing(segment) ||
        runJoin(previous, segment, KANJI_RUN, KANJI_HEAD, 12) ||
        runJoin(previous, segment, KATA_RUN, KATA_HEAD, 14) ||
        endsWithOpening(previous) ||
        PROTECTED_WORDS.some(
          (word) => combined.includes(word) && !previous.includes(word) && !segment.includes(word),
        );
      if (shouldJoin) {
        joined[joined.length - 1] = combined;
        continue;
      }
    }
    joined.push(segment);
  }
  // 数字の再結合で長くなった文節（「消費者物価2026年8月分、」）は、語と数字の境目で
  // 折れるようにする。長すぎる文節は画面幅を超えて任意位置で割れ、句読点が行頭に来るため。
  const split: string[] = [];
  // 括弧書きの再結合で長くなった文節（「（労働力調査詳細集計・2026年4〜6月期）」）は、
  // 中黒・読点の後で折れるようにする（行幅を超えると「）」が行頭に落ちるため）
  // 長い複合語（「人気職業アクセスランキング」「営業用大型貨物自動車運転者（通信…）」）も、
  // 漢字とカタカナの境目・開き括弧の前・区切り記号の後でだけ折れるようにする
  const KATA = /[ァ-ヺ]/;
  const KAN = /[一-鿿々]/;
  const HIRA = /[ぁ-ゖ]/;
  const expanded: string[] = [];
  for (const segment of joined) {
    const chars = [...segment];
    if (chars.length <= 8) { expanded.push(segment); continue; }
    let start = 0;
    for (let i = 2; i < chars.length - 2; i++) {
      const x = chars[i - 1], y = chars[i];
      const after = /[・、，／/]/.test(x) && i - start >= 3 && chars.length - i >= 3;
      const beforeParen = /[（(「『]/.test(y) && i - start >= 3 && chars.length - i >= 4;
      const script = ((KAN.test(x) && KATA.test(y)) || (KATA.test(x) && KAN.test(y))) && i - start >= 2 && chars.length - i >= 2;
      // 独立監査2 2026-11-19 M3：「2026年7〜9月期GDP速報を」が1文節のまま行幅を超え「GDP速｜報」と割れていた。
      // 漢字→英字の境目（「…月期｜GDP…」）でも折れるようにする（英字→漢字の「GDP｜速報」では折らない）
      const toLatin = KAN.test(x) && /[A-Za-z]/.test(y) && i - start >= 2 && chars.length - i >= 3;
      // レイアウト監査 2026-11-17：長い文節が行幅を超えて任意位置で割れていた
      // （「『採用の約束』じゃない｜。」「保健指導を｜掌る」「実態調査を読｜む」）。
      // 「：」・閉じ括弧の後、ひらがな→漢字・カタカナの境目（助詞・送り仮名の後）でも折れるようにする。
      const afterColonOrClose = /[：:』」）)]/.test(x) && i - start >= 3 && chars.length - i >= 3 && !/^[、。，．・：:；;！？）」』]/.test(y);
      const hiraToWord = HIRA.test(x) && !(x === "の" && y === "他") && (KAN.test(y) || KATA.test(y)) && !/[おご]/.test(x) && !(x === "か" && /[0-9０-９]/.test(chars[i - 2] ?? "")) && i - start >= 3 && chars.length - i >= 3 && (openParenLength(chars.slice(start, i).join("")) < 0 || chars.length > 12);
      // 「8年版｜男女共同参画白書」「令和7年分｜民間給与…」「第39回｜介護…」：数字＋助数詞の後で、続く熟語の前に折れ目を置く
      const counterBreak = KAN.test(y) && !/[度目間前後以未超末頭代版生分]/.test(y) && ((/[年回号版分]/.test(x) && /[0-9０-９]/.test(chars[i - 2] ?? "")) || (/[版分]/.test(x) && chars[i - 2] === "年" && /[0-9０-９]/.test(chars[i - 3] ?? ""))) && i - start >= 2 && chars.length - i >= 3;
      if (after || beforeParen || script || toLatin || afterColonOrClose || hiraToWord || counterBreak) { expanded.push(chars.slice(start, i).join("")); start = i; }
    }
    expanded.push(chars.slice(start).join(""));
  }
  joined.splice(0, joined.length, ...expanded);
  for (const segment of joined) {
    const match = [...segment].length > 9 ? segment.match(/^([^0-9０-９]*[^0-9０-９,.，．%％\s(（「『])([0-9０-９].*)$/) : null;
    if (match && [...match[1]].length >= 2 && [...match[2]].length >= 3 && openParenLength(match[1]) < 0) { split.push(match[1], match[2]); continue; }
    // 独立監査2 2026-11-19 M3：前半にも数字がある長い文節（「第3次産業活動指数2026年9月、」）は上の規則で割れず、
    // 行幅を超えて「9｜月」「月｜、」のように任意位置で割れていた。年の4桁の直前（漢字・かなの後）で折れ目を置く
    const chars = [...segment];
    let cut = -1;
    if (chars.length > 9) {
      for (let i = 2; i < chars.length - 3; i++) {
        if (/[一-鿿々ぁ-ゖァ-ヺー]/.test(chars[i - 1]) && /^[0-9０-９]{4}年/.test(chars.slice(i, i + 5).join("")) && openParenLength(chars.slice(0, i).join("")) < 0) { cut = i; break; }
      }
    }
    if (cut > 0) split.push(chars.slice(0, cut).join(""), chars.slice(cut).join(""));
    else split.push(segment);
  }
  // 最後の文節が1〜2文字だけ次の行へ落ちないよう、直前の短い文節とつなぐ（「…を｜読む」対策）
  if (split.length >= 2) {
    const last = split[split.length - 1];
    const previous = split[split.length - 2];
    if ([...last].length <= 2 && [...previous].length + [...last].length <= 12) {
      split.splice(split.length - 2, 2, previous + last);
    }
  }
  return split;
}

export function phraseSegments(text: string): string[] {
  return joinSegments(parser.parse(text));
}
