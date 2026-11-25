/**
 * テンプレートで作る meta description を、文の区切りで 160 字以内に収める。
 * 先頭の文から順に足し、160 字を超える文の手前で止める（文の途中では切らない）。
 * Bing の推奨（長すぎる・短すぎる説明文）への対応（strengthen ■1 T-24）。
 */
export function sentencesWithin(sentences: string[], max = 160): string {
  let out = "";
  for (const sentence of sentences) {
    if (!sentence) continue;
    if (out && (out + sentence).length > max) break;
    out += sentence;
  }
  return out;
}
