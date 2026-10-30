// IndexNow へ sitemap の全URLを送信する（Bing / Copilot / ChatGPT検索の収録を能動化）
// 使い方: デプロイ完了後に `npm run indexnow:submit`
// 前提: public/<key>.txt が本番に配信されていること（keyLocation で検証される）
import fs from "node:fs";
import path from "node:path";

const host = "career.manapick.app";
const keyFile = fs.readdirSync("public").find((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (!keyFile) { console.error("IndexNow key file (public/<32hex>.txt) が見つかりません"); process.exit(1); }
const key = keyFile.replace(/\.txt$/, "");

const sitemap = await (await fetch(`https://${host}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) { console.error("sitemap から URL を取得できませんでした"); process.exit(1); }

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${keyFile}`, urlList }),
});
console.log(`IndexNow submission: ${urlList.length} URLs -> HTTP ${response.status}`);
if (response.status !== 200 && response.status !== 202) process.exit(1);
