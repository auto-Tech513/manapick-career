import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "manapick-news-static-"));
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));

function write(relativePath, contents) {
  const absolute = path.join(fixture, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, contents);
}

try {
  fs.symlinkSync(path.join(root, "node_modules"), path.join(fixture, "node_modules"), "dir");
  fs.copyFileSync(
    path.join(root, "lib/news-static-params.mjs"),
    path.join(fixture, "news-static-params.mjs"),
  );
  write("package.json", JSON.stringify({ private: true, type: "module" }));
  write("next.config.mjs", "export default { output: 'export', trailingSlash: true };\n");
  write("app/layout.js", "export default function Layout({ children }) { return <html><body>{children}</body></html>; }\n");
  write("app/page.js", "export default function Home() { return <main>fixture</main>; }\n");
  write("app/news/[slug]/page.js", `
import { notFound } from "next/navigation";
import { buildNewsStaticParams, EMPTY_NEWS_ROUTE_SLUG } from "../../../news-static-params.mjs";

const newsItems = [{ slug: "human-approved-news", title: "人が確認した公開ニュース" }];
export const dynamicParams = false;
export function generateStaticParams() { return buildNewsStaticParams(newsItems); }
export default async function Page({ params }) {
  const { slug } = await params;
  if (slug === EMPTY_NEWS_ROUTE_SLUG) notFound();
  const item = newsItems.find((candidate) => candidate.slug === slug);
  if (!item) notFound();
  return <main><h1>{item.title}</h1><p>approved-static-export-marker</p></main>;
}
`);

  // The fixture reuses the repository's pinned dependencies through a symlink.
  // Webpack accepts that isolated fixture; Turbopack intentionally rejects a
  // node_modules symlink that points outside the temporary project root.
  execFileSync(process.execPath, [nextBin, "build", fixture, "--webpack"], {
    cwd: root,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const approvedHtml = path.join(fixture, "out/news/human-approved-news/index.html");
  assert.equal(fs.existsSync(approvedHtml), true, "承認済み1件の詳細HTMLを静的exportする");
  assert.match(fs.readFileSync(approvedHtml, "utf8"), /approved-static-export-marker/);
  assert.equal(
    fs.existsSync(path.join(fixture, "out/news/__no-published-news__")),
    false,
    "承認済みニュースがあるとき予約slugを生成しない",
  );
  console.log("news static export integration: approved fixture HTML generated; sentinel absent");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
