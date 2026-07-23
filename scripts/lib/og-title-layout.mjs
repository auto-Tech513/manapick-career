const wordSegmenter = new Intl.Segmenter("ja-JP", { granularity: "word" });
const graphemeSegmenter = new Intl.Segmenter("ja-JP", { granularity: "grapheme" });

// JIS X 4051で行頭・行末が不自然になる代表的な約物を、OG見出し用に厳しめに扱う。
// %は約物としてだけでなく、直前の数値と分離しないようtokensForでも保護する。
export const prohibitedLineStart = new Set([..."、。，．・：；？！‼⁉゛゜ー〜～…‥％%）〕］｝〉》」』】〙〗〟’”»ァィゥェォッャュョヮぁぃぅぇぉっゃゅょゎ々〻"]);
export const prohibitedLineEnd = new Set([..."（〔［｛〈《「『【〘〖〝‘“«"]);

const particles = new Set([
  "が", "を", "に", "へ", "と", "で", "の", "は", "も", "や", "か", "から", "まで", "より", "だけ", "なら", "ても", "では", "には", "へは", "とは", "って",
]);
const numericUnits = new Set([
  "%", "％", "万", "億", "兆", "京", "人", "名", "社", "件", "倍", "割", "点", "円", "字", "文字", "ページ",
  "年", "年間", "月", "月間", "か月", "ヶ月", "カ月", "日", "日間", "時", "時間", "分", "秒", "週", "週間",
  "回", "項目", "職業", "候補", "枚", "つ", "本", "行", "画面", "種", "種類", "例", "校", "国", "地域", "ポイント",
]);
const largeNumberUnits = new Set(["万", "億", "兆", "京"]);
const dateTimeUnits = new Set(["年", "月", "日", "時", "時間", "分", "秒"]);

const graphemes = (value) => [...graphemeSegmenter.segment(String(value))].map((part) => part.segment);
const compact = (value) => String(value).replace(/\s+/g, "");
const isCjk = (value) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(value);
const isPunctuation = (value) => /^[\p{P}\p{S}]+$/u.test(value);
const containsDigit = (value) => /[0-9０-９]/u.test(value);
const startsWithDigit = (value) => /^[0-9０-９]/u.test(value);
const endsWithAny = (value, candidates) => [...candidates].some((candidate) => String(value).endsWith(candidate));

function shouldMergeNumericToken(previousValue, tokenValue, nextValue = "") {
  if (!containsDigit(previousValue)) return false;
  // 11.8% / APAC600万件 / 1,326人 / 2026年のような「数値＋単位」を1トークンにする。
  if (numericUnits.has(tokenValue)) return true;
  if (!startsWithDigit(tokenValue)) return false;
  // 5万5,894人や1億2000万円の中間で折らない。後続単位がある場合に限定する。
  if (endsWithAny(previousValue, largeNumberUnits) && numericUnits.has(nextValue)) return true;
  // 2026年7月23日 / 5時間30分のような連続した日時表現を保護する。
  return endsWithAny(previousValue, dateTimeUnits) && dateTimeUnits.has(nextValue);
}

export function textUnits(value) {
  return graphemes(value).reduce((total, char) => {
    if (/\s/u.test(char)) return total + 0.28;
    if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(char)) return total + 1;
    if (/\p{N}/u.test(char)) return total + 0.62;
    return total + 0.58;
  }, 0);
}

function tokensFor(value) {
  const raw = [...wordSegmenter.segment(String(value))].map((part) => ({
    value: part.segment,
    wordLike: Boolean(part.isWordLike),
  }));
  const tokens = [];
  for (let index = 0; index < raw.length; index += 1) {
    const token = raw[index];
    if (!token.value) continue;
    const previous = tokens.at(-1);
    if (previous && shouldMergeNumericToken(previous.value, token.value, raw[index + 1]?.value)) {
      previous.value += token.value;
      continue;
    }
    // 「個人」「情報」のような複合語を、短い名詞断片の境界で折らない。
    if (
      previous
      && previous.wordLike
      && token.wordLike
      && isCjk(previous.value)
      && isCjk(token.value)
      && !particles.has(previous.value)
      && !particles.has(token.value)
      && (
        (textUnits(previous.value) <= 4 && textUnits(token.value) <= 4)
        || (textUnits(previous.value) <= 6 && textUnits(token.value) <= 2)
      )
    ) {
      previous.value += token.value;
      continue;
    }
    if (previous && prohibitedLineStart.has(graphemes(token.value)[0])) {
      previous.value += token.value;
      if (isPunctuation(token.value)) previous.wordLike = false;
      continue;
    }
    tokens.push(token);
  }
  return tokens;
}

function lineIsAllowed(value) {
  const chars = graphemes(value.trim());
  return chars.length > 0
    && !prohibitedLineStart.has(chars[0])
    && !prohibitedLineEnd.has(chars.at(-1));
}

function chooseLines(tokens, limit, maxLines) {
  const memo = new Map();
  const search = (start, linesLeft) => {
    const key = `${start}:${linesLeft}`;
    if (memo.has(key)) return memo.get(key);
    if (start === tokens.length) return { score: 0, lines: [] };
    if (linesLeft === 0) return null;

    let best = null;
    let line = "";
    for (let end = start; end < tokens.length; end += 1) {
      line += tokens[end].value;
      const units = textUnits(line);
      if (units > limit + 0.001) break;
      if (!lineIsAllowed(line)) continue;
      const next = tokens[end + 1];
      if (next && particles.has(next.value)) continue;
      const nextCoreLength = next ? graphemes(next.value).filter((char) => isCjk(char)).length : 0;
      if (next && tokens[end].wordLike && isCjk(next.value) && nextCoreLength > 0 && nextCoreLength <= 2) continue;
      const rest = search(end + 1, linesLeft - 1);
      if (!rest) continue;

      const chars = graphemes(compact(line)).length;
      const isLast = end === tokens.length - 1;
      const ragged = (limit - units) ** 2 * (isLast ? 0.32 : 1);
      const orphanPenalty = isLast && chars <= 2 && compact(tokens.map((item) => item.value).join("")).length > 2 ? 10000 : 0;
      const shortPenalty = !isLast && units < limit * 0.45 ? 180 : 0;
      const semanticPenalty = next && tokens[end].wordLike && next.wordLike && isCjk(tokens[end].value) && isCjk(next.value) ? 36 : 0;
      const score = ragged + orphanPenalty + shortPenalty + semanticPenalty + rest.score;
      if (!best || score < best.score) best = { score, lines: [line.trim(), ...rest.lines] };
    }
    memo.set(key, best);
    return best;
  };
  return search(0, maxLines)?.lines ?? null;
}

function fallbackTokens(value, limit) {
  const output = [];
  let current = "";
  for (const char of graphemes(value)) {
    if (current && textUnits(current + char) > limit) {
      output.push({ value: current, wordLike: true });
      current = "";
    }
    current += char;
  }
  if (current) output.push({ value: current, wordLike: true });
  return output;
}

export function layoutOgTitle(title, options = {}) {
  const maxLines = options.maxLines ?? 3;
  const maxWidth = options.maxWidth ?? 950;
  const fontSizes = options.fontSizes ?? [58, 54, 50, 46, 42];
  const originalTokens = tokensFor(title);

  for (const fontSize of fontSizes) {
    const limit = maxWidth / fontSize;
    let lines = chooseLines(originalTokens, limit, maxLines);
    if (!lines && originalTokens.some((token) => textUnits(token.value) > limit)) {
      lines = chooseLines(fallbackTokens(title, limit), limit, maxLines);
    }
    if (!lines) continue;
    const validation = validateOgTitleLayout(title, lines);
    if (validation.length === 0) {
      return { lines, fontSize, lineHeight: Math.round(fontSize * 1.38), maxWidth };
    }
  }
  throw new Error(`OGタイトルを${maxLines}行へ安全に配置できません: ${title}`);
}

export function validateOgTitleLayout(title, lines) {
  const failures = [];
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 3) failures.push("行数が1〜3行ではない");
  if (compact(lines.join("")) !== compact(title)) failures.push("折返し後の文字列が元タイトルと一致しない");
  lines.forEach((line, index) => {
    const chars = graphemes(line.trim());
    if (!chars.length) failures.push(`${index + 1}行目が空`);
    if (prohibitedLineStart.has(chars[0])) failures.push(`${index + 1}行目が禁則文字で始まる`);
    if (prohibitedLineEnd.has(chars.at(-1))) failures.push(`${index + 1}行目が禁則文字で終わる`);
  });
  const tokenBoundaries = new Set();
  let tokenLength = 0;
  for (const token of tokensFor(title).slice(0, -1)) {
    tokenLength += graphemes(compact(token.value)).length;
    tokenBoundaries.add(tokenLength);
  }
  let renderedLength = 0;
  for (const line of lines.slice(0, -1)) {
    renderedLength += graphemes(compact(line)).length;
    if (!tokenBoundaries.has(renderedLength)) failures.push("Intl.Segmenterで保護した語の途中で改行");
  }
  for (let index = 0; index < lines.length - 1; index += 1) {
    const previous = compact(lines[index]);
    const next = compact(lines[index + 1]);
    if (/[0-9０-９]$/u.test(previous) && /^[%％万億兆京人名社件倍割点円字年月日時分秒週回]/u.test(next)) {
      failures.push("数値と%・単位の間で改行");
    }
    if (/[万億兆京]$/u.test(previous) && /^[0-9０-９]/u.test(next)) failures.push("複合数値の途中で改行");
    if (/(?:年|月|日|時|時間|分|秒)$/u.test(previous) && /^[0-9０-９][0-9０-９,，.．]*(?:月|日|時|時間|分|秒)/u.test(next)) {
      failures.push("連続した日時表現の途中で改行");
    }
  }
  const finalLength = graphemes(compact(lines.at(-1) ?? "")).length;
  if (graphemes(compact(title)).length > 2 && finalLength <= 2) failures.push("最終行が1〜2文字で孤立");
  return failures;
}
