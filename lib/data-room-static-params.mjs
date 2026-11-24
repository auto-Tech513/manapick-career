/**
 * データ室の記事（/data/{slug}/）の静的パラメータ。
 * 公開記事が0件のとき generateStaticParams() が空になると、Next.js の static export の検査が
 * 「generateStaticParams が無い」と誤判定する（ニュースと同じ事情。lib/news-static-params.mjs）。
 * そのため予約 slug を1つだけ返し、ページ側で notFound() にして、postbuild で出力を消す。
 */
export const EMPTY_DATA_ROUTE_SLUG = "__no-published-data__";

/**
 * @param {ReadonlyArray<{ slug: string }>} renderableItems
 * @returns {Array<{ slug: string }>}
 */
export function buildDataStaticParams(renderableItems) {
  const slugs = renderableItems.map((item) => item.slug);
  if (slugs.includes(EMPTY_DATA_ROUTE_SLUG)) {
    throw new Error(`The reserved data slug cannot be used: ${EMPTY_DATA_ROUTE_SLUG}`);
  }
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Data room slugs must be unique");
  }
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: EMPTY_DATA_ROUTE_SLUG }];
}
