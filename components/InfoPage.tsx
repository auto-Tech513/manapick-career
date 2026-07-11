import type { ReactNode } from "react";
export function InfoPage({eyebrow,title,lead,children}:{eyebrow:string;title:string;lead:string;children:ReactNode}){return <div className="page-shell info-page"><div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{lead}</p></div><article className="prose">{children}</article></div>}
