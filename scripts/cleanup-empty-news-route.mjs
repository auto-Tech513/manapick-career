import fs from "node:fs";
import path from "node:path";
import { EMPTY_NEWS_ROUTE_SLUG } from "../lib/news-static-params.mjs";
import { EMPTY_DATA_ROUTE_SLUG } from "../lib/data-room-static-params.mjs";

const outputRoot = path.resolve(process.cwd(), "out");
// ニュース（/news/）とデータ室の記事（/data/）の、static export のためだけの予約ルートを消す
const reservedRoutes = [
  ["news", path.join(outputRoot, "news", EMPTY_NEWS_ROUTE_SLUG)],
  ["data", path.join(outputRoot, "data", EMPTY_DATA_ROUTE_SLUG)],
];

for (const [label, reservedRoute] of reservedRoutes) {
  if (fs.existsSync(reservedRoute)) {
    fs.rmSync(reservedRoute, { recursive: true, force: true });
  }

  if (fs.existsSync(reservedRoute)) {
    throw new Error(`Failed to remove the static-export-only ${label} route: ${reservedRoute}`);
  }

  console.log(`${label} static export cleanup: ${path.relative(process.cwd(), reservedRoute)} absent`);
}

// データ室の記事が0件のとき out/data/ が空のディレクトリとして残らないようにする
const dataRoot = path.join(outputRoot, "data");
if (fs.existsSync(dataRoot) && fs.readdirSync(dataRoot).length === 0) fs.rmdirSync(dataRoot);
