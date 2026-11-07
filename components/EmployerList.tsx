import Link from "next/link";
import { Fragment } from "react";
import { ArrowUpRight } from "lucide-react";
import companyLinks from "@/content/company-links.json";
import { occupationById, publishedOccupationIds, type EmployerItem } from "@/lib/employers";

/** 企業例のある職業のリスト（/employers/ 分野別ページで共用）。 */
export function EmployerList({ items }: { items: EmployerItem[] }) {
  return <ul className="employers-list">{items.map(item => {
    const occupation = occupationById.get(item.catalogId);
    if (!occupation) return null;
    return <li key={item.catalogId}>
      <div><h3>{occupation.name}</h3><p>{item.employers.map((employer, index) => { const company = (companyLinks.links as unknown as Record<string, { url: string }>)[employer.name]; return <Fragment key={employer.name}>{index ? "／" : null}{company ? <a href={company.url} target="_blank" rel="noopener noreferrer">{employer.name}</a> : employer.name}</Fragment>; })}</p></div>
      {publishedOccupationIds.has(item.catalogId)
        ? <Link href={`/occupation/${item.catalogId}/`}>個別ページで読む <ArrowUpRight aria-hidden="true" /></Link>
        : <Link href="/all/">名録で読む <ArrowUpRight aria-hidden="true" /></Link>}
    </li>;
  })}</ul>;
}
