import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "out");
const origin = "https://career.manapick.app";
const failures = [];

const read = (relative) => fs.readFile(path.join(root, relative), "utf8");
const exists = (absolute) => fs.stat(absolute).then(() => true).catch(() => false);
const outputFileFor = (pathname) => pathname === "/"
  ? path.join(out, "index.html")
  : path.join(out, pathname.replace(/^\//, ""), "index.html");

const sitemap = await read("out/sitemap.xml");
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const uniqueLocations = new Set(locations);

if (!locations.length) failures.push("sitemap has no URLs");
if (uniqueLocations.size !== locations.length) failures.push(`sitemap has ${locations.length - uniqueLocations.size} duplicate URL(s)`);

for (const location of locations) {
  let url;
  try {
    url = new URL(location);
  } catch {
    failures.push(`invalid sitemap URL: ${location}`);
    continue;
  }
  if (url.origin !== origin || url.search || url.hash) failures.push(`non-canonical sitemap URL: ${location}`);
  if (url.pathname !== "/" && !url.pathname.endsWith("/")) failures.push(`sitemap URL lacks trailing slash: ${location}`);
  const output = outputFileFor(url.pathname);
  if (!await exists(output)) {
    failures.push(`sitemap output missing: ${url.pathname}`);
    continue;
  }
  const html = await fs.readFile(output, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  if (canonical !== location) failures.push(`${url.pathname}: canonical ${canonical ?? "missing"} does not match sitemap`);
  const robots = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] ?? "";
  if (/noindex|nofollow/i.test(robots)) failures.push(`${url.pathname}: robots blocks indexing (${robots})`);
  if (html.includes('"@type":"JobPosting"')) failures.push(`${url.pathname}: prohibited JobPosting JSON-LD`);
}

for (const prohibited of ["/occupation/", "/news/__build-empty__/"]) {
  if (sitemap.includes(prohibited)) failures.push(`sitemap exposes prohibited route ${prohibited}`);
}

const newsPublication = JSON.parse(await read("content/news-publication.json"));
for (const record of newsPublication.records.filter((item) => item.status !== "published")) {
  if (sitemap.includes(`/news/${record.slug}/`)) failures.push(`sitemap exposes unapproved news ${record.slug}`);
  if (await exists(path.join(out, "news", record.slug, "index.html"))) failures.push(`static output exposes unapproved news ${record.slug}`);
}

const careerDir = path.join(out, "career");
const careerEntries = (await fs.readdir(careerDir, { withFileTypes: true })).filter((entry) => entry.isDirectory());
for (const entry of careerEntries) {
  const slug = entry.name;
  const html = await fs.readFile(path.join(careerDir, slug, "index.html"), "utf8");
  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1] ?? "";
  if (!ogImage.startsWith(`${origin}/og/biz-udp-v1/career/${slug}.png`)) failures.push(`career/${slug}: unique large OG image missing`);
  for (const anchor of ["summary", "industry", "work", "differences", "transition", "application", "learning", "next-steps", "news", "sources"]) {
    if (!html.includes(`id="${anchor}"`)) failures.push(`career/${slug}: section id ${anchor} missing`);
    if (!html.includes(`href="#${anchor}"`)) failures.push(`career/${slug}: TOC link ${anchor} missing`);
  }
}

for (const relative of ["all/index.html", "guide/index.html", ...["creative", "data", "it-ai", "marketing", "office-accounting", "people-license"].map((key) => `category/${key}/index.html`)]) {
  const html = await read(`out/${relative}`);
  if (!html.includes('"@type":"CollectionPage"')) failures.push(`${relative}: CollectionPage JSON-LD missing`);
  if (!html.includes('"@type":"BreadcrumbList"')) failures.push(`${relative}: BreadcrumbList JSON-LD missing`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`ERROR ${failure}`));
  process.exit(1);
}

console.log(`indexability: ${locations.length} unique sitemap URLs; canonical/robots/output OK; ${careerEntries.length} career OG+TOC routes; draft and JobPosting exposure 0`);
