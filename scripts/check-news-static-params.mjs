import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildNewsStaticParams,
  EMPTY_NEWS_ROUTE_SLUG,
} from "../lib/news-static-params.mjs";

const root = process.cwd();
const routeSource = fs.readFileSync(path.join(root, "app/news/[slug]/page.tsx"), "utf8");
const packageData = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.deepEqual(
  buildNewsStaticParams([]),
  [{ slug: EMPTY_NEWS_ROUTE_SLUG }],
  "0件時はNext.jsの静的export検証だけを通す予約slugを1件返す",
);
assert.deepEqual(
  buildNewsStaticParams([{ slug: "human-approved-news" }]),
  [{ slug: "human-approved-news" }],
  "人が承認した1件は、その詳細slugだけを静的出力対象にする",
);
assert.deepEqual(
  buildNewsStaticParams([{ slug: "approved-a" }, { slug: "approved-b" }]),
  [{ slug: "approved-a" }, { slug: "approved-b" }],
  "公開件数が増えても予約slugを混ぜない",
);
assert.throws(
  () => buildNewsStaticParams([{ slug: EMPTY_NEWS_ROUTE_SLUG }]),
  /reserved news slug/,
  "予約slugの公開データ衝突を拒否する",
);
assert.throws(
  () => buildNewsStaticParams([{ slug: "duplicate" }, { slug: "duplicate" }]),
  /unique/,
  "重複slugを拒否する",
);

assert.match(routeSource, /buildNewsStaticParams\(newsItems\)/, "詳細パスは公開配列からだけ生成する");
assert.match(routeSource, /slug === EMPTY_NEWS_ROUTE_SLUG/, "予約slugは必ずnotFoundへ送る");
assert.doesNotMatch(routeSource, /export const revalidate\s*=\s*0/, "revalidate=0で承認済み詳細を捨てない");
assert.equal(
  packageData.scripts?.postbuild,
  "node scripts/cleanup-empty-news-route.mjs",
  "Next.js検証用の予約slugはpostbuildで公開成果物から除去する",
);

console.log("news static params check: zero=sentinel+cleanup, approved=static, collision/duplicate=blocked");
