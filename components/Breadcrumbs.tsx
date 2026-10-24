import Link from "next/link";

type Crumb = { name: string; path: string };
// AI Breadcrumbs visual component. The page graph already emits its BreadcrumbList.
export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return <nav className="crumbs" aria-label="パンくず">{trail.map((item, index) => <span key={`${item.path}-${index}`}>
    {index > 0 ? <i aria-hidden="true">/</i> : null}
    {index < trail.length - 1 ? <Link href={item.path}>{item.name}</Link> : <b>{item.name}</b>}
  </span>)}</nav>;
}
