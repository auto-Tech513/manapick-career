import fs from "node:fs";
import path from "node:path";
import { EMPTY_NEWS_ROUTE_SLUG } from "../lib/news-static-params.mjs";

const outputRoot = path.resolve(process.cwd(), "out");
const reservedRoute = path.join(outputRoot, "news", EMPTY_NEWS_ROUTE_SLUG);

if (fs.existsSync(reservedRoute)) {
  fs.rmSync(reservedRoute, { recursive: true, force: true });
}

if (fs.existsSync(reservedRoute)) {
  throw new Error(`Failed to remove the static-export-only news route: ${reservedRoute}`);
}

console.log(`news static export cleanup: ${path.relative(process.cwd(), reservedRoute)} absent`);
