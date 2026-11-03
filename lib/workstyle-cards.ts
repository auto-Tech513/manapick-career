// 働き方診断の結果カードを、職業の作業特性コードから組み立てる（サーバー側専用）。
// 対応づけの方法: 各職業の仕事内容から4軸を -2〜+2 でコード化し（content/workstyle-coding.json）、
// タイプの傾向ベクトルとの重なりで選ぶ。強い傾向と大きく反する職業は候補にしない。
// 内部スコアは公開しない。表示するのは「近い入口」「少し違う入口」の区分と、仕事内容の事実だけ。
import { occupationCatalog } from "@/content/catalog";
import { workstyleAxes, workstyleTypes, type WorkstyleAxisKey } from "@/content/workstyle-diagnosis";
import codingData from "@/content/workstyle-coding.json";
import type { WorkstyleCard, WorkstyleCardsByType } from "@/components/WorkstyleDiagnosis";

interface CodedOccupation {
  catalogId: string;
  axes: Record<WorkstyleAxisKey, number | null>;
  basis: Partial<Record<WorkstyleAxisKey, string>>;
  traits: string[];
}

const coded = codingData as unknown as CodedOccupation[];
const occupationById = new Map(occupationCatalog.map((item) => [item.catalogId, item]));

function typeSigns(code: string): Record<WorkstyleAxisKey, -1 | 1> {
  const signs = {} as Record<WorkstyleAxisKey, -1 | 1>;
  workstyleAxes.forEach((axis, index) => {
    signs[axis.key] = code[index] === axis.plusLetter ? 1 : -1;
  });
  return signs;
}

function scoreOccupation(signs: Record<WorkstyleAxisKey, -1 | 1>, occupation: CodedOccupation): { score: number; mismatchedAxes: number; usable: boolean } {
  let score = 0;
  let mismatchedAxes = 0;
  let knownAxes = 0;
  for (const axis of workstyleAxes) {
    const value = occupation.axes[axis.key];
    if (value === null || value === undefined) continue;
    knownAxes += 1;
    score += signs[axis.key] * value;
    if (value !== 0 && Math.sign(value) !== signs[axis.key]) mismatchedAxes += 1;
    // 強い傾向と真逆（|2|）の軸がある職業は、理由の説明が破綻するため大きく減点する
    if (Math.abs(value) === 2 && Math.sign(value) !== signs[axis.key]) score -= 6;
  }
  return { score, mismatchedAxes, usable: knownAxes >= 3 };
}

function reasonsFor(signs: Record<WorkstyleAxisKey, -1 | 1>, occupation: CodedOccupation): string[] {
  const picked: { strength: number; text: string }[] = [];
  for (const axis of workstyleAxes) {
    const value = occupation.axes[axis.key];
    const basis = occupation.basis[axis.key];
    if (value === null || value === undefined || !basis) continue;
    if (value !== 0 && Math.sign(value) === signs[axis.key]) picked.push({ strength: Math.abs(value), text: basis });
  }
  return picked.sort((a, b) => b.strength - a.strength).slice(0, 2).map((item) => item.text);
}

function toCard(signs: Record<WorkstyleAxisKey, -1 | 1>, occupation: CodedOccupation): WorkstyleCard | null {
  const catalogEntry = occupationById.get(occupation.catalogId);
  if (!catalogEntry) return null;
  return {
    catalogId: occupation.catalogId,
    name: catalogEntry.name,
    summary: catalogEntry.summary,
    traits: occupation.traits.slice(0, 4),
    reasons: reasonsFor(signs, occupation),
  };
}

export function buildWorkstyleCards(): Record<string, WorkstyleCardsByType> {
  const result: Record<string, WorkstyleCardsByType> = {};
  for (const code of Object.keys(workstyleTypes)) {
    const signs = typeSigns(code);
    const ranked = coded
      .map((occupation) => ({ occupation, ...scoreOccupation(signs, occupation) }))
      .filter((entry) => entry.usable)
      .sort((a, b) => b.score - a.score || a.occupation.catalogId.localeCompare(b.occupation.catalogId));

    const close: CodedOccupation[] = [];
    const usedCategories = new Map<string, number>();
    for (const entry of ranked) {
      if (close.length >= 4) break;
      if (entry.mismatchedAxes > 0) continue;
      const catalogEntry = occupationById.get(entry.occupation.catalogId);
      const category = catalogEntry?.categoryKey ?? "";
      if ((usedCategories.get(category) ?? 0) >= 2) continue;
      close.push(entry.occupation);
      usedCategories.set(category, (usedCategories.get(category) ?? 0) + 1);
    }
    // 近い入口が4件に満たない場合は、不一致1軸まで許して補う（理由が付く範囲に限る）
    if (close.length < 4) {
      for (const entry of ranked) {
        if (close.length >= 4) break;
        if (close.includes(entry.occupation)) continue;
        if (entry.mismatchedAxes > 1) continue;
        close.push(entry.occupation);
      }
    }

    const stretch: CodedOccupation[] = [];
    for (const entry of ranked) {
      if (stretch.length >= 2) break;
      if (close.includes(entry.occupation)) continue;
      if (entry.mismatchedAxes !== 1) continue;
      if (entry.score <= 0) continue;
      stretch.push(entry.occupation);
    }

    result[code] = {
      close: close.map((occupation) => toCard(signs, occupation)).filter((card): card is WorkstyleCard => card !== null),
      stretch: stretch.map((occupation) => toCard(signs, occupation)).filter((card): card is WorkstyleCard => card !== null),
    };
  }
  return result;
}
