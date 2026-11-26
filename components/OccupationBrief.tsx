'use client';
import { useEffect, useState } from 'react';
import type { OccupationBrief as Brief } from '@/lib/occupation-brief';
import { PhraseText } from "@/components/PhraseTitle";
import { externalRel } from "@/lib/network-links";
const cache = new Map<string, Brief>();
// The links are to the responsible authorities' guidance, not a claim that
// the archived job tag explanation has been fully checked for currency.
const currentQualificationGuidance: Record<string, { title: string; url: string }> = {
  '公認会計士': { title: '金融庁：公認会計士の資格取得に関するQ&A', url: 'https://www.fsa.go.jp/ordinary/kouninkaikeisi/index.html' },
  '薬剤師': { title: '厚生労働省：薬剤師国家試験のページ', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iyakuhin/yakuzaishi-kokkashiken/index.html' },
  '税理士': { title: '国税庁：令和7年度（第75回）税理士試験の試験問題・答案用紙・正誤表', url: 'https://www.nta.go.jp/taxes/zeirishi/zeirishishiken/shikenkekka/75/touanyoushi.htm' },
  '弁護士': { title: '法務省：令和6年司法試験問題（短答式・論文式）', url: 'https://www.moj.go.jp/jinji/shihoushiken/jinji08_00241.html' },
  '看護師': { title: '厚生労働省：第115回看護師国家試験の問題および正答', url: 'https://www.mhlw.go.jp/seisakunitsuite/bunya/kenkou_iryou/iryou/topics/tp260424-03_04_05.html' },
  '社会保険労務士': { title: '社会保険労務士試験オフィシャルサイト（試験問題・合格基準・受験資格）', url: 'https://www.sharosi-siken.or.jp/' },
};
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
    <section className="brief-employers"><h4 className="phrase-breaks"><PhraseText text="この仕事を担う企業・法人の例" /></h4>{result.employers?.length ? <><p className="brief-note">企業・法人の公式な職種・業務案内を基にした例です。募集の継続や採用可能性を示すものではありません。法人・事業所や業務範囲は各リンク先で確認してください。</p><ul>{result.employers.map(item => <li key={`${item.name}-${item.source.url}`}><strong>{item.name}</strong>（{item.role}）<p>{item.description}</p><a href={item.source.url} target="_blank" rel={externalRel(item.source.url)}>公式情報：{item.source.title}</a><small>（AIによる出典照合：{item.source.checkedAt}）</small></li>)}</ul></> : <p className="brief-note">この仕事について、企業・法人の職種との一致を確認した例はまだありません。</p>}</section>
    <div className="brief-body"><section><h4 className="phrase-breaks"><PhraseText text="どういう仕事か" /></h4>{paragraphs(result.work)}</section><section><h4 className="phrase-breaks"><PhraseText text="仕事に必要なこと・入職の条件" /></h4><p className="brief-note">以下は公式データの就業経路の説明です。個人の適性判定や採用可能性の評価ではありません。</p>{result.correction ? <div className="brief-correction"><p className="brief-note">入職条件の補足（AI出典照合 {result.correction.checkedAt}）：{result.correction.reason}</p>{result.correction.entry.map(text => <p key={text}>{text}</p>)}<p className="depth-evidence">根拠：{result.correction.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel={externalRel(source.url)}>{source.provider}「{source.title}」</a>)}</p></div> : paragraphs(result.entry)}</section><section><h4 className="phrase-breaks"><PhraseText text="働く場所と労働条件の特徴" /></h4>{paragraphs(result.conditions)}</section><section><h4 className="phrase-breaks"><PhraseText text="元データに掲載されている関連資格" /></h4>{result.qualifications.length ? <ul>{result.qualifications.map(item => <li key={item}>{item}</li>)}</ul> : <p>この取込データに関連資格の記載はありません。「資格が一切ない」「すべての求人で不要」という意味ではありません。</p>}<p className="brief-note">資格の名称があることは就業に必須という意味ではありません。受験・登録・研修の現行条件は実施団体の案内で確認してください。</p></section></div>
    {currentQualificationGuidance[name] ? <p className="brief-note">資格制度の公式案内（参照先を2026-11-26に確認）：<a href={currentQualificationGuidance[name].url} target="_blank" rel={externalRel(currentQualificationGuidance[name].url)}>{currentQualificationGuidance[name].title}</a>。受験や登録の最新条件はリンク先で確認してください。</p> : null}
    <a href={result.source.url} target="_blank" rel={externalRel(result.source.url)}>job tag公式の配布元・版を確認</a>
  </div>;
}
function paragraphs(text: string) { return text.split(/\n+/).map(line => line.trim()).filter(Boolean).map((line, index) => <p key={index}>{line}</p>); }
