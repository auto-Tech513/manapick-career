export const EMPTY_DATA_ROUTE_SLUG: "__no-published-data__";
export function buildDataStaticParams(
  renderableItems: ReadonlyArray<{ slug: string }>,
): Array<{ slug: string }>;
