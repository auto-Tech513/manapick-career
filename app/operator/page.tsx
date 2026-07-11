import type { Metadata } from "next";import { InfoPage } from "@/components/InfoPage";
export const metadata:Metadata={title:"運営者情報",alternates:{canonical:"/operator/"}};
export default function Page(){return <InfoPage eyebrow="Operator" title="運営者情報" lead="manapick careerは、manapick公式ネットワークの職業情報サイトです。"><h2>運営</h2><p>manapick編集部</p><h2>サイトの役割</h2><p>manapickは学習動画、manapick AIはAIツール、manapick licenseは資格情報、manapick careerは職業詳細情報の正本を担当します。</p><h2>執筆体制</h2><p>運営者が経験していない職種を実体験として書きません。体験情報がない場合は、公的資料と一次情報を整理した編集記事であることを各ページに表示します。</p></InfoPage>}
