/**
 * Next.js 16.2.11's static-export validator mistakes an empty
 * generateStaticParams() result for a missing generateStaticParams() function.
 * A single reserved parameter keeps that validator satisfied. The page calls
 * notFound() for the reserved slug, then the postbuild cleanup removes the
 * generated 404 artifact so a static host cannot serve it as a soft-404 200.
 */
export const EMPTY_NEWS_ROUTE_SLUG = "__no-published-news__";

/**
 * @param {ReadonlyArray<{ slug: string }>} publishedItems
 * @returns {Array<{ slug: string }>}
 */
export function buildNewsStaticParams(publishedItems) {
  const slugs = publishedItems.map((item) => item.slug);
  if (slugs.includes(EMPTY_NEWS_ROUTE_SLUG)) {
    throw new Error(`The reserved news slug cannot be published: ${EMPTY_NEWS_ROUTE_SLUG}`);
  }
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Published news slugs must be unique");
  }
  return slugs.length > 0
    ? slugs.map((slug) => ({ slug }))
    : [{ slug: EMPTY_NEWS_ROUTE_SLUG }];
}
