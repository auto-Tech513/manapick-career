import { careerIncome, incomeMetadata } from '@/lib/occupation-income';
import { IncomeFigure } from '@/components/IncomeFigure';
export function CareerIncome({slug}:{slug:string}) {
  const data=careerIncome(slug);
  return <section id="income" className="career-depth-section income-section"><span className="section-num">INCOME / OFFICIAL STATISTICS</span><h2>平均年収は？ 統計の範囲も確かめる</h2><p className="section-lead">{data.explanation}</p>{data.items.length ? data.items.map(item=><div key={item.name}><h3>参照する職業：{item.name}</h3><IncomeFigure name={item.name} statistic={item.statistic}/></div>) : <p>対応する給与統計は未確認です。年収中央値も記載していません。</p>}<details className="income-method"><summary>計算方法・対象年・中央値との違い</summary><p>平均年収換算＝「きまって支給する現金給与額」×12＋「年間賞与その他特別給与額」。千円単位を円へ換算しています。</p>{incomeMetadata.limitations.map(text=><p key={text}>{text}</p>)}<p>{incomeMetadata.annualMedian.reason}</p><ul>{incomeMetadata.sources.map(source=><li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul></details></section>;
}
