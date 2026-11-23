// ニュースカード（public/card/news/*.png）の見出し数値を、答えの文から抜き出す規則。
// 見出し数値とキャプションは、どちらも本文の逐語部分文字列でなければならない（言い換えをしない）。
// 途中で切れて語句が壊れる場合は数値カードにせず、スタンプ型に落とす（null を返す）。

export const FIGURE_OVERRIDES = {
  // 答えの冒頭に「事業所規模5人以上」が来て自動抽出がずれるため、見出し数値を手で指定（どちらも本文の逐語）
  "monthly-earnings-august-2026": { figure: "311,364円", caption: "現金給与総額" },
  // 最初の％が前年比の増減で見出しに不向きなため、死亡者数を指定（どちらも本文の逐語）
  "workplace-accidents-latest": { figure: "700人", caption: "死亡者数" },
};
// 自動抽出の数値が見出しとして弱い記事はスタンプ型にする
export const FIGURE_SKIP = new Set(["employment-whitepaper-2026"]);

// 数値の直前の符号と、直後の増減語は数値の一部として扱う。
// 以前は「前期比0.0%減」から「0.0%」だけを抜き、「減」を落としていた（2026-11-19 GDP速報カード）。
// 「前月比0.5%低下」「前月比1.7％の低下」「前年比11.7%増」なども同じで、増減語を落とすと意味が逆にも読める。
const SIGN = "(?:(?<![0-9A-Za-z])[+＋−－‐-])?";
const NUMBER = "[0-9][0-9,]*\\.?[0-9]*";
const DIRECTION = "(?:の)?(?:増加|減少|上昇|低下|下落|増(?!減)|減)";
const PRIMARY = new RegExp(`${SIGN}${NUMBER}\\s*(?:円|％|%|倍)(?:${DIRECTION})?`);
const SECONDARY = new RegExp(`${SIGN}${NUMBER}\\s*(?:人|件|時間|ポイント)(?:${DIRECTION})?`);
// 要点行の切り詰めで使う「数値のかたまり」（符号・数値・単位・増減語）
const FIGURE_TOKEN = `${SIGN}${NUMBER}(?:\\s*(?:円|％|%|倍|人|件|時間|ポイント|か月|年|社|歳)(?:${DIRECTION})?)?`;

// 1行に収まる字数で切る（全角1・半角0.55で数える）。
// 切れ目が数値のかたまりの途中に来る場合は、かたまりの手前で切る
// （「有効求人倍率は1…」「0.9ポイント…（低下が落ちる）」のように数値や増減語が欠けた行を出さない）。
export function clipLine(text, max) {
  let width = 0;
  let out = "";
  for (const ch of text) {
    width += ch.charCodeAt(0) > 255 ? 1 : 0.55;
    if (width > max) {
      const cut = out.length;
      for (const token of text.matchAll(new RegExp(FIGURE_TOKEN, "g"))) {
        const end = token.index + token[0].length;
        if (token.index < cut && cut < end) {
          const head = text.slice(0, token.index).replace(/[\s、，,（(]+$/, "");
          if (head) out = head;
          break;
        }
        if (token.index >= cut) break;
      }
      return `${out}…`;
    }
    out += ch;
  }
  return out;
}

export function captionSegment(answer, index) {
  const before = answer.slice(0, index);
  const start = Math.max(before.lastIndexOf("。"), before.lastIndexOf("、")) + 1;
  return before
    .slice(start)
    .replace(/^(結論として|つまり|なお|また|一方|具体的には)/, "")
    .trim()
    .replace(/(は|が|の|を|に|へ|と|で|も)$/, "");
}

export function extractFigure(answer, slug) {
  if (!answer) return null;
  if (FIGURE_SKIP.has(slug)) return null;
  if (FIGURE_OVERRIDES[slug]) return FIGURE_OVERRIDES[slug];
  // 第一優先: 円・％・倍（金額と割合は見出しとして意味が立つ）
  const primary = answer.match(PRIMARY);
  if (primary) {
    const caption = captionSegment(answer, primary.index);
    if (caption.length >= 3 && caption.length <= 20) return { figure: primary[0].replace(/\s+/g, ""), caption };
    return null;
  }
  // 第二優先: 人・件・時間・ポイント（キャプションが十分ある場合だけ）
  const secondary = answer.match(SECONDARY);
  if (secondary) {
    const caption = captionSegment(answer, secondary.index);
    if (caption.length >= 4 && caption.length <= 20) return { figure: secondary[0].replace(/\s+/g, ""), caption };
  }
  return null;
}
