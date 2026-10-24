/** A recorded production URL may outlive a freshness deadline. This never promotes a draft. */
export function retainObservedNewsUrl(item: { slug: string; status: string }, observedSlugs: readonly string[]) {
  return item.status === "published" && observedSlugs.includes(item.slug);
}
