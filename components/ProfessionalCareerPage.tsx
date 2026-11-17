import Link from 'next/link';
import profiles from '@/content/professional-careers.json';
import { careerDossierBySlug, careerEvidenceById } from '@/lib/career-dossiers';
import { WorkDepth, FitDepth, QualificationDepth, EmployerDepth } from '@/components/CareerDepth';
import { CareerIncome } from '@/components/CareerIncome';
import { TransferCards, type TransferCard } from '@/components/TransferCards';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, articleOgUrl } from '@/lib/site';
import { AdSlot } from '@/components/AdSlot';
import { AdSenseScript } from '@/components/AdSenseScript';
import { relatedPublishedOccupationsForCareer } from '@/content/catalog';
import { PhraseText } from "@/components/PhraseTitle";
const sections=[['summary','仕事の概要'],['work','業務と成果物'],['income','平均年収と統計の範囲'],['fit','向いている作業'],['qualifications','資格と登録'],['employers','日本企業・法人の例'],['next-steps','学びにつなぐ'],['sources','出典と作成方法']];
function Toc(){return <nav className="dos-toc" aria-label="このページの目次"><p className="dos-toc-h">CONTENTS</p>{sections.map(([id,label],index)=><a key={id} href={`#${id}`} className={index>=6?'sp-x':undefined}><i>{String(index+1).padStart(2,'0')}</i>{label}</a>)}</nav>}
export function ProfessionalCareerPage({slug}:{slug:string}){
 const profile=profiles.items.find(item=>item.slug===slug)!;const dossier=careerDossierBySlug.get(slug)!;
 const url=absoluteUrl(`/career/${slug}/`);
 const firstQual=dossier.qualifications[0];
 const transferCards:TransferCard[]=[
  {siteId:'license',title:firstQual?.name ?? 'ITパスポート',description:'関連資格を確認',href:firstQual?.licensePath ? `https://license.manapick.app${firstQual.licensePath}` : 'https://license.manapick.app/license/it-passport/'},
  {siteId:'manapick',title:'資格の学び方ガイド',description:'無料動画で学ぶ',href:'https://manapick.app/guide/certification/'},
  {siteId:'ai',title:'ChatGPT',description:'仕事で使うAI',href:'https://ai.manapick.app/tool/chatgpt/'},
  {siteId:'company',title:'上場企業ランキング',description:'業界の企業を読む',href:'https://company.manapick.app/ranking/'},
 ];
 return <><JsonLd data={{'@context':'https://schema.org','@graph':[
{'@type':'Article',headline:`${profile.name}の仕事内容・資格・年収`,description:profile.summary,url,dateModified:profile.researchedAt,inLanguage:'ja-JP',image:{'@type':'ImageObject',url:articleOgUrl('career',slug,`${profile.name}|${profile.researchedAt}|professional-v1`),width:1200,height:675},author:{'@type':'Organization',name:'manapick career',url:absoluteUrl('/operator/')},publisher:{'@id':absoluteUrl('/#organization')},mainEntityOfPage:url,citation:dossier.sourceIds.flatMap(id=>{const source=careerEvidenceById.get(id);return source?[source.url]:[]})},
{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'トップ',item:absoluteUrl('/')},{'@type':'ListItem',position:2,name:'職業一覧',item:absoluteUrl('/all/')},{'@type':'ListItem',position:3,name:profile.name,item:url}]},
{'@type':'Occupation',name:profile.name,description:profile.summary,mainEntityOfPage:url},
]}}/><AdSenseScript /><div className="detail-shell dossier-article"><nav className="dos-crumb" aria-label="パンくずリスト"><Link href="/">トップ</Link><span aria-hidden="true">／</span><Link href="/all/">職業一覧</Link><span aria-hidden="true">／</span><span aria-current="page">{profile.name}</span></nav><header id="summary" className="dos-head"><p className="dos-eyebrow"><span className="stn lg" aria-hidden="true">CA</span> CA-DOSSIER · {profile.categoryLabel}</p><h1><mark>{profile.name}</mark><small>仕事内容・向いている人・資格・年収・職場例</small></h1><p className="dos-lead">{profile.summary}</p><div className="dos-meta"><span><b>公式資料から仕事を知る</b>AIによる出典整理：{profile.researchedAt}</span><span><b>内容</b>毎日の作業と条件を、公式資料から具体的に紹介</span></div></header><div className="detail-layout"><Toc/><article className="detail-content"><section id="work"><h2 className="phrase-breaks"><i>01</i><PhraseText text="どういう仕事？ 業務と成果物" /></h2><WorkDepth dossier={dossier} heroSummary={profile.summary}/></section><CareerIncome slug={slug}/><FitDepth dossier={dossier}/><AdSlot unit="career" placement="career-after-section-3" /><QualificationDepth dossier={dossier}/><EmployerDepth dossier={dossier}/><section id="next-steps"><h2 className="phrase-breaks"><i>06</i><PhraseText text="仕事を知って、学びにつなぐ" /></h2><p>資格の試験範囲を確認し、公式の仕事内容と照らして学びを選びます。AIは公開資料の要点整理や学習問題の作成などの補助に使い、根拠は原文で確認してください。顧客・患者・子どもの個人情報や業務上の秘密は入力しません。専門職の判断・資格・登録をAIで置き換えることはできません。</p></section>{relatedPublishedOccupationsForCareer(slug).length ? <section id="related-occupations" className="editorial-block"><h2 className="phrase-breaks"><i>07</i><PhraseText text="同じ分野の職業ページ" /></h2><p>同じ分類で個別ページを公開している職業です。年収の目安は、各ページで統計の範囲とあわせて確認できます。</p><ul>{relatedPublishedOccupationsForCareer(slug).map((item) => <li key={item.catalogId}><Link href={`/occupation/${item.catalogId}/`}>{item.name}の個別ページ</Link></li>)}</ul></section> : null}<section id="sources" className="editorial-block"><h2 className="phrase-breaks"><i>08</i><PhraseText text="出典と作成方法" /></h2><p>公式の職業情報、資格制度、企業・法人の職種説明をAIが照合して整理しました。作業から考える相性や練習案は、業務説明をもとにした編集上の整理です。</p><p>資料照合日：{profile.researchedAt}。年収統計の対象年・計算方法は年収欄に別記しています。</p><ul className="source-list">{dossier.sourceIds.map(id=>{const source=careerEvidenceById.get(id);return source?<li key={id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.provider}「{source.title}」</a><small>{source.support}／AI照合 {source.accessedAt}</small></li>:null;})}</ul><Link href="/contact/">情報の訂正窓口</Link></section></article><aside className="detail-aside"><div className="daily-action-card"><span>OFFICIAL SOURCES</span><strong>公式資料から仕事を知る</strong><p>毎日の作業と条件を、公式資料から具体的に紹介します。</p><Link href="/all/">職業一覧へ</Link></div></aside></div><section className="dos-transfer" aria-label="ほかの駅へ"><div className="dos-sh"><div><p className="dos-sh-k">TRANSFER — 乗り換え</p><h2 className="phrase-breaks"><PhraseText text="ほかの駅へ進む" /></h2></div></div><TransferCards cards={transferCards}/></section></div></>;
}
