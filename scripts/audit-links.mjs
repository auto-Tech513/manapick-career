import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const network = JSON.parse(await fs.readFile(path.join(root, "content/network-map.json"), "utf8"));

if (args.has("--internal")) {
  const out = path.join(root, "out");
  const publication = JSON.parse(await fs.readFile(path.join(root, "content/occupation-publication.json"), "utf8"));
  const newsPublication = JSON.parse(await fs.readFile(path.join(root, "content/news-publication.json"), "utf8"));
  const publishedOccupationIds = new Set(publication.records.filter((record) => record.status === "published").map((record) => record.catalogId));
  const publishedNewsSlugs = new Set(newsPublication.records.filter((record) => record.status === "published").map((record) => record.slug));
  const html = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith(".html")) html.push(full);
    }
  }
  await walk(out);
  const failures = [];
  for (const file of html) {
    const relative = path.relative(out, file);
    const occupationOutput = relative.match(/^occupation\/([^/]+)\/index\.html$/);
    if (occupationOutput && !publishedOccupationIds.has(occupationOutput[1])) failures.push(`unreviewed occupation output: ${relative}`);
    const newsOutput = relative.match(/^news\/([^/]+)\/index\.html$/);
    if (newsOutput && !publishedNewsSlugs.has(newsOutput[1])) failures.push(`unreviewed news output: ${relative}`);
    const body = await fs.readFile(file, "utf8");
    for (const match of body.matchAll(/href="(\/[^\"]*)"/g)) {
      const raw = match[1];
      if (raw.startsWith("//")) continue;
      const pathname = decodeURI(raw.split(/[?#]/)[0]);
      if (!pathname || pathname === "/") continue;
      const target = pathname.endsWith("/") ? path.join(out, pathname, "index.html") : path.join(out, pathname);
      if (!await fs.stat(target).then(() => true).catch(() => false)) failures.push(`${relative} -> ${raw}`);
    }
  }
  for (const publicFile of ["sitemap.xml", "llms.txt", "feed.xml"]) {
    const body = await fs.readFile(path.join(out, publicFile), "utf8");
    for (const match of body.matchAll(/\/occupation\/([^/\s<]+)\//g)) {
      if (!publishedOccupationIds.has(match[1])) failures.push(`${publicFile} exposes unreviewed occupation ${match[1]}`);
    }
    for (const match of body.matchAll(/\/news\/([^/\s<]+)\//g)) {
      if (!publishedNewsSlugs.has(match[1])) failures.push(`${publicFile} exposes unreviewed news ${match[1]}`);
    }
  }
  if (failures.length) {
    failures.forEach((failure) => console.error(`ERROR ${failure}`));
    process.exit(1);
  }
  console.log(`internal links: ${html.length} HTML files; 0 missing; ${publishedOccupationIds.size} reviewed occupation routes; ${publishedNewsSlugs.size} reviewed news routes only`);
}

if (args.has("--network")) {
  const report = [];
  for (const [itemId, item] of Object.entries(network.items)) {
    const url = new URL(item.path, `${network.sites[item.siteId].baseUrl}/`).toString();
    let status = 0;
    let state = "unconfirmed";
    try {
      let res = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "user-agent": "manapick-career-link-audit/1.0" } });
      if (res.status === 405) res = await fetch(url, { method: "GET", redirect: "follow", headers: { "user-agent": "manapick-career-link-audit/1.0", range: "bytes=0-0" } });
      status = res.status;
      state = status >= 200 && status < 400 ? "ok" : status === 404 ? "broken" : status === 403 || status === 429 ? "bot-restricted" : "unconfirmed";
    } catch {
      state = "unconfirmed";
    }
    report.push({ itemId, url, status, state });
  }
  await fs.mkdir(path.join(root, "docs"), { recursive: true });
  await fs.writeFile(path.join(root, "docs/qa-network.json"), `${JSON.stringify({ checkedAt: new Date().toISOString(), report }, null, 2)}\n`);
  const broken = report.filter((item) => item.state === "broken");
  console.log(`network links: ${report.filter((item) => item.state === "ok").length} ok / ${broken.length} broken / ${report.filter((item) => item.state === "bot-restricted").length} bot-restricted / ${report.filter((item) => item.state === "unconfirmed").length} unconfirmed`);
  if (broken.length) process.exit(1);
}
