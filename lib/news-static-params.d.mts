export const EMPTY_NEWS_ROUTE_SLUG: "__no-published-news__";
export function buildNewsStaticParams(
  publishedItems: ReadonlyArray<{ slug: string }>,
): Array<{ slug: string }>;
