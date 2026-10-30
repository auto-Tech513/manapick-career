import type { IncomeStatistic } from '@/lib/occupation-income';
export function IncomeFigure({ statistic, name, compact = false }: { statistic?: IncomeStatistic; name: string; compact?: boolean }) {
  return <aside className={`income-figure${compact ? ' is-compact' : ''}`} aria-label={`${name}の対応分類の年収統計`}>
    <span className="income-label">対応する統計分類の平均年収換算 · 2025年統計</span>
    {statistic ? <><p className="income-classification">統計分類：{statistic.classificationName}</p><strong className="income-amount">{(statistic.annualizedMeanYen / 10000).toLocaleString('ja-JP', {minimumFractionDigits:1,maximumFractionDigits:1})}<span>万円／年</span></strong><p className="income-note">全国・男女計・企業規模10人以上の一般労働者の平均値です。分類に複数の職業を含む場合があります。</p>{!compact ? <dl className="income-basis"><div><dt>6月の平均給与（月額・残業代等含む）</dt><dd>{(Number(statistic.monthlyCashThousandYen)/10).toFixed(2)}万円</dd></div><div><dt>平均の年間賞与・特別給与</dt><dd>{(Number(statistic.annualBonusThousandYen)/10).toFixed(2)}万円</dd></div><div><dt>集計された人の平均年齢</dt><dd>{statistic.meanAge.toFixed(1)}歳</dd></div><div><dt>推計労働者数（標本人数ではない）</dt><dd>{statistic.estimatedWorkers.toLocaleString('ja-JP')}人</dd></div></dl> : null}<p className="income-population">全国・男女計・企業10人以上・一般労働者（短時間以外）</p></> : <><strong className="income-unavailable">対応する年収統計なし</strong><p className="income-note">公式対応表に賃金統計の分類がありません。他職種の平均や求人給与で補っていません。</p></>}
    <a className="income-source" href="https://www.e-stat.go.jp/stat-search/files?layout=datalist&stat_infid=000040421116" target="_blank" rel="noopener noreferrer">厚生労働省・賃金構造基本統計調査 第1表</a>
  </aside>;
}
