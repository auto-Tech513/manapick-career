/** Existing, unchanged public articles can remain as dated archives, never as verified current news. */
export function canRetainNewsArchive({ record, actualDigest, retention, noticeAvailable }) {
  if (!noticeAvailable || record?.status !== 'published') return false;
  if (!/^[a-f0-9]{64}$/i.test(record.contentSha256 ?? '') || record.contentSha256 !== actualDigest) return false;
  if (!Array.isArray(retention?.slugs) || !retention.slugs.includes(record.slug)) return false;
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  return validDate(record.publishedAt) && validDate(retention.observedAt) && record.publishedAt <= retention.observedAt;
}
