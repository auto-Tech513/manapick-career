"use client";

import { useEffect, useMemo, useState } from "react";

// 手取りシミュレーター（簡易試算）
// 根拠: 国税庁 No.1410 給与所得控除（令和8年分）、No.1199 基礎控除（令和8年分）、
// 所得税速算表、住民税は基礎控除43万円・税率10%・均等割5,000円の前提。
// 社会保険料率は初期値を表示し、利用者が変更できる前提条件として扱う。
const BASIC_DEDUCTION_BRACKETS: Array<[number, number]> = [
  [1_320_000, 1_040_000],
  [3_360_000, 1_040_000],
  [4_890_000, 1_040_000],
  [6_550_000, 670_000],
  [23_500_000, 620_000],
  [24_000_000, 480_000],
  [24_500_000, 320_000],
  [25_000_000, 160_000],
];

function basicDeduction(totalIncome: number): number {
  for (const [limit, amount] of BASIC_DEDUCTION_BRACKETS) {
    if (totalIncome <= limit) return amount;
  }
  return 0;
}

function employmentIncomeDeduction(gross: number): number {
  if (gross <= 2_200_000) return 740_000;
  if (gross <= 3_600_000) return gross * 0.3 + 80_000;
  if (gross <= 6_600_000) return gross * 0.2 + 440_000;
  if (gross <= 8_500_000) return gross * 0.1 + 1_100_000;
  return 1_950_000;
}

function incomeTaxRate(taxable: number): { tax: number } {
  const brackets: Array<[number, number, number]> = [
    [1_950_000, 0.05, 0],
    [3_300_000, 0.1, 97_500],
    [6_950_000, 0.2, 427_500],
    [9_000_000, 0.23, 636_000],
    [18_000_000, 0.33, 1_536_000],
    [40_000_000, 0.4, 2_796_000],
    [Infinity, 0.45, 4_796_000],
  ];
  for (const [limit, rate, deduction] of brackets) {
    if (taxable <= limit) return { tax: Math.max(0, taxable * rate - deduction) };
  }
  return { tax: 0 };
}


const parseNum = (text: string): number => {
  const n = Number(text);
  return Number.isFinite(n) ? n : 0;
};

// 入力中の文字列を壊さないためのサニタイズ。数値化は計算側で行う。
// 先行ゼロを圧縮し（"0300"→"300"、ただし "0.5" の先頭0は残す）、
// 小数点は1つだけ残す。
function sanitizeNumeric(text: string, decimal: boolean): string {
  let t = decimal ? text.replace(/[^0-9.]/g, "") : text.replace(/[^0-9]/g, "");
  if (decimal) {
    const firstDot = t.indexOf(".");
    if (firstDot >= 0) t = t.slice(0, firstDot + 1) + t.slice(firstDot + 1).replace(/\./g, "");
  }
  return t.replace(/^0+(?=\d)/, "");
}

function normalizeOnBlur(text: string, max: number): string {
  if (text === "") return "";
  const t = text.replace(/\.$/, "").replace(/^0+(?=\d)/, "");
  const n = Number(t);
  if (!Number.isFinite(n)) return "";
  const clamped = Math.min(Math.max(n, 0), max);
  return String(clamped);
}

const yen = (value: number) => `${Math.round(value).toLocaleString("ja-JP")}円`;
const manYen = (value: number) => `${(value / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}万円`;

export function NetIncomeSimulator() {
  const [grossText, setGrossText] = useState("450");
  const [ageBand, setAgeBand] = useState<"under40" | "40to64" | "65plus">("under40");
  const [dependents, setDependents] = useState(0);
  const [healthText, setHealthText] = useState("10");
  const [nursingText, setNursingText] = useState("1.59");
  const [unemploymentText, setUnemploymentText] = useState("0.6");
  const grossMan = parseNum(grossText);
  const healthRate = parseNum(healthText);
  const nursingRate = parseNum(nursingText);
  const unemploymentRate = parseNum(unemploymentText);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const yenParam = new URLSearchParams(window.location.search).get("yen");
      const parsed = yenParam ? Number(yenParam) : NaN;
      if (Number.isFinite(parsed) && parsed >= 500_000 && parsed <= 50_000_000) {
        setGrossText(String(Math.round((parsed / 10000) * 10) / 10));
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const result = useMemo(() => {
    const gross = Math.max(0, Math.round(grossMan * 10000));
    const health = (gross * healthRate) / 100 / 2;
    const nursing = ageBand === "40to64" ? (gross * nursingRate) / 100 / 2 : 0;
    const pension = (gross * 18.3) / 100 / 2;
    const unemployment = (gross * unemploymentRate) / 100;
    const socialInsurance = health + nursing + pension + unemployment;

    const employmentIncome = Math.max(0, gross - employmentIncomeDeduction(gross));
    const dependentDeduction = dependents * 380_000;
    const taxableIncomeRaw = employmentIncome - socialInsurance - basicDeduction(employmentIncome) - dependentDeduction;
    const taxableIncome = Math.max(0, Math.floor(taxableIncomeRaw / 1000) * 1000);
    const incomeTax = Math.floor((incomeTaxRate(taxableIncome).tax * 1.021) / 100) * 100;

    const residentBase = Math.max(0, employmentIncome - socialInsurance - 430_000 - dependents * 330_000);
    const residentTax = Math.floor((residentBase * 0.1) / 100) * 100 + (gross > 0 ? 5_000 : 0);

    const totalDeductions = socialInsurance + incomeTax + residentTax;
    const net = gross - totalDeductions;
    return {
      gross,
      health,
      nursing,
      pension,
      unemployment,
      socialInsurance,
      incomeTax,
      residentTax,
      totalDeductions,
      net,
      netMonthly: net / 12,
      netRate: gross > 0 ? (net / gross) * 100 : 0,
    };
  }, [grossMan, ageBand, dependents, healthRate, nursingRate, unemploymentRate]);

  return (
    <div className="sim-wrap">
      <form className="sim-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          年収（額面・税込）
          <span className="sim-input-row">
            <input type="text" value={grossText} onChange={(e) => setGrossText(sanitizeNumeric(e.target.value, false))} onBlur={() => setGrossText((t) => normalizeOnBlur(t, 5000))} inputMode="numeric" autoComplete="off" aria-label="年収（万円）" />
            万円
          </span>
        </label>
        <label>
          年齢
          <select value={ageBand} onChange={(e) => setAgeBand(e.target.value as typeof ageBand)}>
            <option value="under40">40歳未満</option>
            <option value="40to64">40歳〜64歳（介護保険料あり）</option>
            <option value="65plus">65歳以上</option>
          </select>
        </label>
        <label>
          扶養親族の数（一般扶養として計算）
          <select value={dependents} onChange={(e) => setDependents(Number(e.target.value))}>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}人</option>
            ))}
          </select>
        </label>
        <details className="sim-rates">
          <summary>保険料率の前提を変更する</summary>
          <label>
            健康保険料率（全体・%）※初期値は協会けんぽ全国平均水準の目安
            <input type="text" value={healthText} onChange={(e) => setHealthText(sanitizeNumeric(e.target.value, true))} onBlur={() => setHealthText((t) => normalizeOnBlur(t, 15))} inputMode="decimal" autoComplete="off" aria-label="健康保険料率（%）" />
          </label>
          <label>
            介護保険料率（全体・%）※初期値は令和7年度の協会けんぽ料率
            <input type="text" value={nursingText} onChange={(e) => setNursingText(sanitizeNumeric(e.target.value, true))} onBlur={() => setNursingText((t) => normalizeOnBlur(t, 5))} inputMode="decimal" autoComplete="off" aria-label="介護保険料率（%）" />
          </label>
          <label>
            雇用保険料率（本人負担・%）※初期値は一般の事業の令和7年度料率
            <input type="text" value={unemploymentText} onChange={(e) => setUnemploymentText(sanitizeNumeric(e.target.value, true))} onBlur={() => setUnemploymentText((t) => normalizeOnBlur(t, 3))} inputMode="decimal" autoComplete="off" aria-label="雇用保険料率（%）" />
          </label>
          <p>厚生年金保険料率は18.3%（本人負担は半分）で固定しています。健康保険料は本人負担が半分として計算します。</p>
        </details>
      </form>

      <div className="sim-result" aria-live="polite">
        <p className="sim-result-label">手取りの目安（年額）</p>
        <p className="sim-result-value">{manYen(result.net)}<span>（{yen(result.net)}）</span></p>
        <p className="sim-result-sub">月額の目安 {manYen(result.netMonthly)} ／ 額面に対する手取り率 {result.netRate.toFixed(1)}%</p>
        <table className="sim-table">
          <tbody>
            <tr><th>額面年収</th><td>{yen(result.gross)}</td></tr>
            <tr><th>健康保険料（本人負担）</th><td>−{yen(result.health)}</td></tr>
            {ageBand === "40to64" ? <tr><th>介護保険料（本人負担）</th><td>−{yen(result.nursing)}</td></tr> : null}
            <tr><th>厚生年金保険料（本人負担）</th><td>−{yen(result.pension)}</td></tr>
            <tr><th>雇用保険料</th><td>−{yen(result.unemployment)}</td></tr>
            <tr><th>所得税（復興特別所得税を含む）</th><td>−{yen(result.incomeTax)}</td></tr>
            <tr><th>住民税（所得割＋均等割）</th><td>−{yen(result.residentTax)}</td></tr>
            <tr className="sim-total"><th>差し引き合計</th><td>−{yen(result.totalDeductions)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
