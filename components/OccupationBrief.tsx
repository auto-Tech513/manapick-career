'use client';
import { useEffect, useState } from 'react';
import type { OccupationBrief as Brief } from '@/lib/occupation-brief';
const cache = new Map<string, Brief>();
export function OccupationBrief({ catalogId, name, version }: { catalogId: string; name: string; version: string }) {
  const [result, setResult] = useState<Brief | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const key = `${catalogId}:${version}`;
    async function load() {
      setFailed(false);
      const cached = cache.get(key);
      if (cached) { setResult(cached); return; }
      try {
        const response = await fetch(`/data/occupation-briefs/${encodeURIComponent(catalogId)}.json?v=${encodeURIComponent(version)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('occupation unavailable');
        const data = await response.json() as Brief;
        if (data.schemaVersion !== 1 || data.catalogId !== catalogId || data.name !== name || !data.work || !data.entry || !data.conditions) throw new Error('occupation mismatch');
        if (!controller.signal.aborted) { cache.set(key, data); setResult(data); }
      } catch { if (!controller.signal.aborted) setFailed(true); }
    }
    void load();
    return () => controller.abort();
  }, [catalogId, name, version, attempt]);
  if (failed) return <div className="occupation-brief" id={`occupation-brief-${catalogId}`} role="status"><p>説明を読み込めませんでした。</p><button type="button" onClick={() => setAttempt(value => value + 1)}>もう一度読み込む</button></div>;
  if (!result) return <div className="occupation-brief" id={`occupation-brief-${catalogId}`} role="status">仕事内容を読み込んでいます。</div>;
  return <div className="occupation-brief" id={`occupation-brief-${catalogId}`}>
    <p className="brief-attribution">{result.source.provider}作成「{result.source.title}」を項目別に整形。取込記録 {result.source.importedAt}／公式配布ファイルとの一致確認 {result.source.retrievedAt}。</p>
    <p className="brief-vintage">この職業の解説更新年：{result.updatedYears.description ? `${result.updatedYears.description}年` : '元データに記載なし'}。配布ファイルとの一致は、記載された制度・資格・労働条件が現在も有効という確認ではありません。</p>
    <div className="brief-body"><section><h4>どういう仕事か</h4>{paragraphs(result.work)}</section><section><h4>仕事に必要なこと・入職の条件</h4><p className="brief-note">以下は公式データの就業経路の説明です。個人の適性判定や採用可能性の評価ではありません。</p>{result.correction ? <div className="brief-correction"><p className="brief-note">入職条件の補足（AI出典照合 {result.correction.checkedAt}）：{result.correction.reason}</p>{result.correction.entry.map(text => <p key={text}>{text}</p>)}<p className="depth-evidence">根拠：{result.correction.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">{source.provider}「{source.title}」</a>)}</p></div> : paragraphs(result.entry)}</section><section><h4>働く場所と労働条件の特徴</h4>{paragraphs(result.conditions)}</section><section><h4>元データに掲載されている関連資格</h4>{result.qualifications.length ? <ul>{result.qualifications.map(item => <li key={item}>{item}</li>)}</ul> : <p>この取込データに関連資格の記載はありません。「資格が一切ない」「すべての求人で不要」という意味ではありません。</p>}<p className="brief-note">資格の名称があることは就業に必須という意味ではありません。受験・登録・研修の現行条件は実施団体の案内で確認してください。</p></section></div>
    <p className="brief-note">企業名と、その会社の職務との一致はこの元データから確認できないため、企業例を補っていません。企業の公式職種まで調べた仕事は、別のcareer詳細解説で示します。</p>
    <a href={result.source.url} target="_blank" rel="noopener noreferrer">job tag公式の配布元・版を確認</a>
  </div>;
}
function paragraphs(text: string) { return text.split(/\n+/).map(line => line.trim()).filter(Boolean).map((line, index) => <p key={index}>{line}</p>); }
