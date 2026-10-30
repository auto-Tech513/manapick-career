export default function ArticleSteps({ headings }: { headings: string[] }) {
  if (headings.length < 3) return null;
  return (
    <figure className="article-chart article-steps" aria-label="このガイドの進め方">
      <figcaption>
        <span className="article-chart-eyebrow">進め方</span>
        <strong>このガイドの進め方</strong>
      </figcaption>
      <ol className="article-steps-list">
        {headings.map((heading, index) => (
          <li key={heading}>
            <span className="article-step-number">{String(index + 1).padStart(2, "0")}</span>
            <span>{heading.replace(/^\d+\.\s*/, "")}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
